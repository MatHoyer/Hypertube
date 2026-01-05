import {
  deleteCommentLikeSchemas,
  deleteCommentSchemas,
  getCommentRepliesSchemas,
  getCommentSchemas,
  getCommentsSchemas,
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
  getComment,
  getCommentReplies,
  getComments,
  likeComment,
  patchComment,
  replyToComment,
} from "./comments.controller";

const commentsRouter = new Hono();

commentsRouter.get(
  "/",
  isLogged,
  searchParamsParser(getCommentsSchemas.searchParams),
  getComments
);

commentsRouter.get(
  "/:commentId",
  isLogged,
  urlParamsParser(getCommentSchemas.urlParams),
  getComment
);

commentsRouter.patch(
  "/:commentId",
  isLogged,
  urlParamsParser(patchCommentSchemas.urlParams),
  bodyParser(patchCommentSchemas.requirements),
  patchComment
);

commentsRouter.delete(
  "/:commentId",
  isLogged,
  urlParamsParser(deleteCommentSchemas.urlParams),
  deleteComment
);

commentsRouter.get(
  "/:commentId/replies",
  isLogged,
  urlParamsParser(getCommentRepliesSchemas.urlParams),
  searchParamsParser(getCommentRepliesSchemas.searchParams),
  getCommentReplies
);

commentsRouter.post(
  "/:commentId/replies",
  isLogged,
  urlParamsParser(postCommentReplySchemas.urlParams),
  bodyParser(postCommentReplySchemas.requirements),
  replyToComment
);

commentsRouter.post(
  "/:commentId/like",
  isLogged,
  urlParamsParser(postCommentLikeSchemas.urlParams),
  likeComment
);

commentsRouter.delete(
  "/:commentId/like",
  isLogged,
  urlParamsParser(deleteCommentLikeSchemas.urlParams),
  deleteCommentLike
);

export default commentsRouter;
