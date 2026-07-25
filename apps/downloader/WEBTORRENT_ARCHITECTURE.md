# WebTorrent + S3 seeding architecture

Replaces the standalone Transmission daemon (RPC over HTTP, `network_mode: container:vpn`,
local-disk download dir) with an in-process WebTorrent client running inside the
`downloader` app, seeding from raw torrent-piece data stored in S3/MinIO instead of local
disk. This ADR records the three decisions the migration required.

## Package

`webtorrent@3.x` — the Node build (same package works in Node and browser; we only ever
`import WebTorrent from "webtorrent"` inside `apps/downloader`, never bundle it for the
client). `engines.node >= 22` matches this repo's `node:22` images.

Deviation: `webtorrent` ships no first-party TypeScript types, and `@types/webtorrent` is
stuck at v2 (last published against the v2 API), which would produce misleading types
against the v3 runtime we're actually using. Instead of pulling in a stale `@types`
package, `apps/downloader/src/types/webtorrent.d.ts` hand-declares the narrow slice of the
API this codebase actually calls (`client.add`, `torrent` events/properties, `file`
stream/select methods, the `store` factory option). If the used surface grows, extend that
file rather than reaching for `@types/webtorrent`.

## Decision A — remux vs. transcode

Always transcoding is expensive and lossy for the common case (torrent releases that are
already h264/aac in an mkv/avi container). We ffprobe the downloaded source file (see
Decision B for why it's a local file, not a live pipe, by the time we probe it) and branch:

| video codec | audio codec | ffmpeg output options |
|---|---|---|
| `h264` | none, or `aac` | `-c:v copy -c:a copy` (or drop the audio map if there's no audio stream) — pure remux |
| `h264` | present, not `aac` | `-c:v copy -c:a aac` — video remuxed, audio transcoded |
| anything else (`hevc`, `vp9`, `mpeg4`, ...) | any | `-c:v libx264 -c:a aac` — full transcode |

All three branches still target `mp4` with `-movflags +faststart` (Decision B) and keep the
existing `-map 0:v:0 -map 0:a:0?` stream selection. This is a strict superset of the
current code, which always assumed remux was safe — that assumption silently produced
broken/unplayable output whenever a source wasn't already h264/aac. This ADR's decision
matrix is what actually implements the "detect via ffprobe" requirement; there was no real
decision being made before.

## Decision B — moov atom placement

Chosen: **Option 1 — local scratch file, not fragmented MP4.**

A muxer writes `moov` at the end of the file unless the output is seekable (so ffmpeg can
seek back and prepend it after encoding) or the file is written fragmented
(`frag_keyframe+empty_moov+default_base_moof`). We rejected fragmented MP4 for two reasons:

1. `apps/client` documents no explicit minimum browser/Safari-iOS baseline, so we can't
   verify fragmented MP4's progressive-download/Range behavior is safe on every target
   browser. Faststart MP4 on a plain byte-range object is universally supported; fragmented
   MP4 playback-via-Range has known rough edges on some Safari/iOS versions. When in doubt,
   don't ship the riskier option.
2. Independent of moov placement, ffprobe/ffmpeg need a **seekable** input to reliably
   detect and decode arbitrary source containers in the first place. A torrent's source file
   can itself be a trailing-moov mp4 (rare but possible for pirated releases), which cannot
   be demuxed *at all* from a live, non-seekable pipe — not for probing, not for remuxing,
   not for transcoding. So Decision A already forced us toward a seekable local file for the
   *source* side; reusing the same mechanism for the *output* side (write to a local temp
   file, run ffmpeg with `-movflags +faststart`, then upload the finished file) costs
   nothing extra and sidesteps that whole class of failure.

Concretely, per download job:

```
webtorrent file.createReadStream()  →  local scratch "source" file  (Decision C: reads are
                                                                       served from the S3
                                                                       chunk store, same as
                                                                       any other torrent read)
ffprobe(source)                     →  codec decision matrix (Decision A)
ffmpeg(source → converted, +faststart) → local scratch "converted" file
storageService.putObject(converted) →  movies bucket
rm source, converted
```

This is the same local-disk footprint the current Transmission-backed pipeline already has
(Transmission wrote the full source file to `downloads_transmission`, `convertMovie` wrote a
second local file before upload) — no regression, and it lets us keep
`probeVideoMetadata` / `buildMovieObjectMetadata` / the upload call in
`movie-downloader.ts` almost verbatim.

**Verification that seeking doesn't require the whole file**: `getPartialObject` is
already byte-range-accurate (untouched by this migration); the thing that was actually at
risk was moov placement inside the object, not the read path. Manual check after any
pipeline change: `ffprobe -v error -show_entries format=start_time,duration <uploaded file
downloaded from MinIO>` should succeed, and `MP4Box.js`/`ffprobe -show_data` (or simply:
confirm the `moov` box offset is small relative to file size, e.g. via
`ffprobe -show_format -show_streams -print_format json`, or a `mp4box -info`) should place
`moov` near the front, not the end. In review, spot check with a browser: seek to the last
10% of a freshly uploaded movie and confirm the network panel shows a `Range` request
immediately answered `206`, not a full re-fetch.

## Decision C — seeding from S3

The playable mp4 (Decision A/B's output) is a different artifact from the raw torrent piece
data the swarm expects — piece hashes are computed over the original source bytes, not our
transcoded output. We cannot seed the mp4 into the original swarm. Instead we persist the
*raw torrent pieces* (source bytes, pre-transcode) to S3 and hand WebTorrent a custom
`abstract-chunk-store`-compatible store backed by that S3 prefix, so any downloader worker
instance can pick up seeding duty without local disk state.

**Package search**: no maintained S3-backed `abstract-chunk-store` implementation exists on
npm. `s3-blob-store` implements `abstract-blob-store` (a different, coarser interface — one
blob, not indexed chunks) and hasn't been published since 2020 (predates the aws-sdk v3 /
S3-compatible-client ecosystem this repo already uses via `minio`). Every actively
maintained chunk-store package on npm is fs/memory/IndexedDB-backed for local or
browser use. **Deviation from the spec's preference for an existing package**: we hand-roll
`packages/server-core/src/services/StorageService/S3ChunkStore.ts`, built on the existing
`IStorageService` (so it works against MinIO today and any other S3-compatible backend
later) rather than a torrent-specific S3 SDK dependency.

**Storage layout**: bucket `torrent-pieces` (new `BUCKETS.TORRENT_PIECES`), one object per
piece at key `<infoHash>/<pieceIndex>`. A movie-sized torrent has a piece length of roughly
256KB–8MB, so a full download is hundreds to low-thousands of S3 objects — acceptable
request/storage cost. This design is **not** appropriate for torrents with very small piece
sizes or very large file counts (many-tiny-object cost blowup); it's scoped to
single-movie-file torrents, which is the only case this app ever adds.

**Resuming after a worker restart — no hand-rolled bitfield hacking.** WebTorrent's
internal `Storage` layer already verifies existing chunk data against each piece's hash the
moment a store is attached (this is exactly the mechanism that lets the stock CLI / desktop
app resume a paused download by pointing `fs-chunk-store` at the same folder again — nothing
torrent-specific to our setup). As long as `S3ChunkStore#get(index, cb)` faithfully returns
already-stored piece bytes (and errors when a piece isn't present yet), WebTorrent resumes
correctly on its own — we do not touch `torrent.bitfield` or any other private API. This was
the biggest risk called out in the original task spec ("verify against the torrent's piece
hashes... resume the client") and it turns out to be free: it's what a chunk store gives you
by construction, we just had to write a *correct* one.

**tmdbId/resolutionId → infoHash mapping**: already exists. `Resolution.infoHash`
(`packages/server-core/prisma/schemas/movie.prisma`) is populated from Prowlarr's
`release.hash` at search time (`apps/server/src/routes/movies/movies.controller.ts`). No
Prisma migration was needed. Because that field can be `null` (older rows, or a release
whose hash Prowlarr didn't report) or theoretically stale, the webtorrent client always
treats `torrent.infoHash` (resolved by WebTorrent itself once metadata arrives) as the
source of truth, and backfills `Resolution.infoHash` from it if the DB value is missing.

**Cross-process stop-seeding.** The monthly cleanup cron runs in the separate `scheduler`
app/container, so it cannot reach the downloader's in-memory `Map<infoHash, Torrent>`
directly. It instead:
1. deletes the DB rows,
2. deletes the `movies` bucket objects for that movie (unchanged, existing behavior),
3. deletes the `torrent-pieces/<infoHash>/` prefix for every resolution of that movie,
4. enqueues one `STOP_SEEDING` job (new `MOVIE_QUEUE_JOB_NAMES`, same `movie` BullMQ queue)
   per infoHash.

The downloader worker handles `STOP_SEEDING` by calling `client.remove(infoHash)` to detach
the in-memory `Torrent` — it does **not** also delete S3 objects (the scheduler already did,
and a second delete would just be a wasted, possibly-racing list+delete call).

**Defense in depth**: on every downloader process startup, before taking new jobs, it
reconciles: query every `Resolution` with `downloadState = DOWNLOADED` whose parent
`Movie.usedAt` is still within the monthly retention window used by
`deleteMoviesMonthly.ts`, and re-attach each one to the S3 store (using the `.torrent`/magnet
bytes already stored at `resolutions/<id>/resolution.torrent`, which the cleanup job also
deletes as part of step 2 above). This means a missed or never-delivered `STOP_SEEDING`
message self-heals on the next restart or deploy — nothing that should stop seeding survives
a downloader restart, and nothing that should keep seeding needs the original download's
worker instance to stay alive.

**Worker shutdown/restart mid-download**: BullMQ redelivers an in-flight job if the worker
that held its lock disappears. The redelivered job calls `downloadMovie` again with the same
`resolutionId`/infoHash, which re-attaches to the same `torrent-pieces/<infoHash>/` store;
per the resume behavior above, WebTorrent only re-fetches pieces that aren't already present
in S3, not the whole torrent.
