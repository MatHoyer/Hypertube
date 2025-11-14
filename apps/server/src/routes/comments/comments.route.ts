import {
  deleteCommentLikeSchemas,
  deleteCommentSchemas,
  getCommentRepliesSchemas,
  patchCommentSchemas,
  postCommentLikeSchemas,
  postCommentReplySchemas,
} from "@hypertube/libs";
import { Hono } from "hono";
import { bodyParser } from "../../middlewares/bodyParser";
import { isLogged } from "../../middlewares/isLogged";
import { searchParamsParser } from "../../middlewares/searchParamsParser";
import { urlParamsParser } from "../../middlewares/urlParamsParser";
import {
  deleteComment,
  deleteCommentLike,
  getCommentReplies,
  likeComment,
  patchComment,
  replyToComment,
} from "./comments.controller";

const commentsRouter = new Hono();

commentsRouter.get(
  "/:commentId/replies",
  isLogged,
  urlParamsParser(getCommentRepliesSchemas.urlParams),
  searchParamsParser(getCommentRepliesSchemas.searchParams),
  getCommentReplies
);

commentsRouter.post(
  "/:commentId/like",
  isLogged,
  urlParamsParser(postCommentLikeSchemas.urlParams),
  likeComment
);

commentsRouter.post(
  "/:commentId/replies",
  isLogged,
  urlParamsParser(postCommentReplySchemas.urlParams),
  replyToComment
);

commentsRouter.delete(
  "/:commentId/like",
  isLogged,
  urlParamsParser(deleteCommentLikeSchemas.urlParams),
  deleteCommentLike
);

commentsRouter.delete(
  "/:commentId",
  isLogged,
  urlParamsParser(deleteCommentSchemas.urlParams),
  deleteComment
);

commentsRouter.patch(
  "/:commentId",
  isLogged,
  urlParamsParser(patchCommentSchemas.urlParams),
  bodyParser(patchCommentSchemas.requirements),
  patchComment
);

export default commentsRouter;
