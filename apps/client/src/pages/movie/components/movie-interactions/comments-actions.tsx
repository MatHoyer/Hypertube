import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import {
  getUrl,
  patchCommentSchemas,
  postCommentReplySchemas,
  postMovieCommentSchemas,
  type TMovieSchema,
} from "@hypertube/libs";
import type { TCommentSchema } from "@hypertube/libs/src/schemas/database/comments.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { useState } from "react";
import { toast } from "sonner";
import { getParentQueryKey, type TQueryParent } from "./utils";

export const PostMovieComment: React.FC<{ tmdbId: TMovieSchema["tmdbId"] }> = ({
  tmdbId,
}) => {
  const queryClient = useQueryClient();

  const { mutate: postComment } = useMutation({
    mutationFn: (content: string) =>
      axiosFetch({
        method: "POST",
        url: getUrl("api-movies-comment", { tmdbId }),
        data: { content },
        schemas: postMovieCommentSchemas,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["movie-comments", tmdbId] }),
  });

  return <BasePostComment postComment={postComment} />;
};

export const PostReplyComment: React.FC<{
  commentId: TCommentSchema["id"];
  setIsReplying: (value: boolean) => void;
}> = ({ commentId, setIsReplying }) => {
  const queryClient = useQueryClient();

  const { mutate: postReply } = useMutation({
    mutationFn: (content: string) =>
      axiosFetch({
        method: "POST",
        url: getUrl("api-comments-replies", { commentId }),
        data: { content },
        schemas: postCommentReplySchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comment-replies", commentId],
      });
      setIsReplying(false);
    },
  });

  return <BasePostComment postComment={postReply} />;
};

const BasePostComment: React.FC<{
  postComment: (content: string) => void;
}> = ({ postComment }) => {
  const [newComment, setNewComment] = useState("");

  return (
    <InputGroup>
      <InputGroupInput
        placeholder={t("movie.comments.addComment")}
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && newComment) {
            postComment(newComment);
            setNewComment("");
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  postComment(newComment);
                  setNewComment("");
                }}
              >
                {t("movie.comments.sendComment")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("movie.comments.tooltip.sendComment")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </InputGroupAddon>{" "}
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

  const { mutate: patchComment, isPending } = useMutation({
    mutationFn: (content: string) =>
      axiosFetch({
        method: "PATCH",
        url: getUrl("api-comments", { commentId }),
        data: { content },
        schemas: patchCommentSchemas,
      }),
    onSuccess: () => {
      toast.success("Comment updated successfully");
      queryClient.invalidateQueries({ queryKey: getParentQueryKey(parent) });
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Comment updating error");
    },
  });

  const handleCancel = () => {
    setEditedContent(initialContent);
    setIsEditing(false);
  };

  return (
    <InputGroup>
      <InputGroupInput
        placeholder={t("movie.comments.editComment")}
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && editedContent) {
            patchComment(editedContent);
          } else if (e.key === "Escape") {
            handleCancel();
          }
        }}
        disabled={isPending}
      />
      <InputGroupAddon align="inline-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button disabled={isPending} onClick={() => handleCancel()}>
                {t("movie.comments.cancel")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("movie.comments.tooltip.cancel")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={isPending}
                onClick={() => patchComment(editedContent)}
              >
                {t("movie.comments.save")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("movie.comments.tooltip.edit")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </InputGroupAddon>{" "}
    </InputGroup>
  );
};
