export const notifications = {
  TEST: "test",
  MOVIE_DOWNLOADED: "movieDownloaded",
  MOVIE_DOWNLOADING: "movieDownloading",
  NEW_COMMENT_REPLY: "newCommentReply",
  NEW_COMMENT_LIKE: "newCommentLike",
} as const;

export type TNotification = (typeof notifications)[keyof typeof notifications];
