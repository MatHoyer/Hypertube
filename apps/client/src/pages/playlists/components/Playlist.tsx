import type { TPlaylistSchema } from "@hypertube/libs/src/schemas/database/playlist.schema";

export const Playlist = ({
  playlistName,
}: {
  playlistName: TPlaylistSchema["name"];
}) => {
  return <div>{playlistName}</div>;
};
