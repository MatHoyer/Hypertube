import { LoadingButton } from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  getUrl,
  patchCommentSchemas,
  postCommentReplySchemas,
  postMovieCommentSchemas,
  ROUTES,
  type TMovieSchema,
} from "@hypertube/libs";
import type { TCommentSchema } from "@hypertube/libs/src/schemas/database/comments.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getParentQueryKey, type TQueryParent } from "./utils";

export const PostMovieComment: React.FC<{ tmdbId: TMovieSchema["tmdbId"] }> = ({
  tmdbId,
}) => {
  const queryClient = useQueryClient();

  const {
    mutate: postComment,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (content: string) =>
      axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.MOVIES_COMMENT, { tmdbId }),
        data: { content },
        schemas: postMovieCommentSchemas,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.MOVIES_COMMENT, { tmdbId }),
      }),
  });

  return (
    <BasePostComment
      postComment={postComment}
      isPending={isPending}
      isSuccess={isSuccess}
    />
  );
};

export const PostReplyComment: React.FC<{
  commentId: TCommentSchema["id"];
  setIsReplying: (value: boolean) => void;
}> = ({ commentId, setIsReplying }) => {
  const queryClient = useQueryClient();

  const {
    mutate: postReply,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (content: string) =>
      axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.COMMENTS_REPLIES, { commentId }),
        data: { content },
        schemas: postCommentReplySchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.COMMENTS_REPLIES, { commentId }),
      });
      setIsReplying(false);
    },
  });

  return (
    <BasePostComment
      postComment={postReply}
      isPending={isPending}
      isSuccess={isSuccess}
    />
  );
};

const BasePostComment: React.FC<{
  postComment: (content: string) => void;
  isPending: boolean;
  isSuccess: boolean;
}> = ({ postComment, isPending, isSuccess }) => {
  const [newComment, setNewComment] = useState("");

  const handleCancel = () => setNewComment("");

  return (
    <InputGroup>
      <InputGroupTextarea
        placeholder={t("movie.comments.addComment")}
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && newComment) {
            e.preventDefault();
            postComment(newComment);
            setNewComment("");
          } else if (e.key === "Escape") {
            handleCancel();
          }
        }}
      />
      <InputGroupAddon align="block-end">
        <div className="flex-1" />
        {newComment && (
          <Button variant="ghost" disabled={!newComment} onClick={handleCancel}>
            {t("movie.comments.cancel")}
          </Button>
        )}

        <LoadingButton
          className="rounded-full"
          size="icon"
          loading={isPending}
          success={isSuccess}
          onClick={() => {
            postComment(newComment);
            setNewComment("");
          }}
        >
          <Send />
        </LoadingButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

export const EditCommentButton: React.FC<{
  commentId: TCommentSchema["id"];
  parent: TQueryParent;
  initialContent: TCommentSchema["content"];
  setIsEditing: (value: boolean) => void;
}> = ({ commentId, parent, initialContent, setIsEditing }) => {
  const queryClient = useQueryClient();
  const [editedContent, setEditedContent] = useState(initialContent);

  const {
    mutate: patchComment,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (content: string) =>
      axiosFetch({
        method: "PATCH",
        url: getUrl(ROUTES.API.COMMENTS, { commentId }),
        data: { content },
        schemas: patchCommentSchemas,
      }),
    onSuccess: () => {
      toast.success(t("movie.comments.toast.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: getParentQueryKey(parent) });
      setIsEditing(false);
    },
    onError: () => {
      toast.error(t("movie.comments.toast.updateError"));
    },
  });

  const handleCancel = () => {
    setEditedContent(initialContent);
    setIsEditing(false);
  };

  return (
    <InputGroup>
      <InputGroupTextarea
        placeholder={t("movie.comments.editComment")}
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && editedContent) {
            e.preventDefault();
            patchComment(editedContent);
          } else if (e.key === "Escape") {
            handleCancel();
          }
        }}
        disabled={isPending}
      />
      <InputGroupAddon align="inline-end">
        <Button disabled={isPending} onClick={() => handleCancel()}>
          {t("movie.comments.cancel")}
        </Button>
        <LoadingButton
          success={isSuccess}
          loading={isPending}
          onClick={() => patchComment(editedContent)}
        >
          {t("movie.comments.save")}
        </LoadingButton>
      </InputGroupAddon>
    </InputGroup>
  );
};
