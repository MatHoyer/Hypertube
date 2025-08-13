export const ytsQualities = [
  "480p",
  "720p",
  "1080p",
  "1080p.x265",
  "2160p",
  "3D",
] as const;

export const ytsGenres = [
  "action",
  "adventure",
  "animation",
  "biography",
  "comedy",
  "crime",
  "documentary",
  "drama",
  "family",
  "fantasy",
  "film-noir",
  "game-show",
  "history",
  "horror",
  "music",
  "musical",
  "mystery",
  "news",
  "reality-tv",
  "romance",
  "sci-fi",
  "short",
  "sport",
  "talk-show",
  "thriller",
  "war",
  "western",
] as const;

export const ytsSortBy = [
  "title",
  "year",
  "rating",
  "peers",
  "seeds",
  "download_count",
  "like_count",
  "date_added",
] as const;

export const ytsDownloadStates = {
  NOT_DOWNLOADED: "not_downloaded",
  DOWNLOADING: "downloading",
  DOWNLOADED: "downloaded",
} as const;
