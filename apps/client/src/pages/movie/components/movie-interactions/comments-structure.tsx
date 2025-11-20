import { LoadingButton } from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Typography } from "@/components/ui/typography";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import {
  deleteCommentSchemas,
  getCommentRepliesSchemas,
  getUrl,
  ParentTypes,
  type TGetMovieCommentsSchemas,
} from "@hypertube/libs";
import type { TCommentSchema } from "@hypertube/libs/src/schemas/database/comments.schema";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { t } from "i18next";
import { ChevronDown, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { EditCommentButton, PostReplyComment } from "./comments-actions";
import { CommentLikeButton } from "./likes";
import { getParentQueryKey, type TQueryParent } from "./utils";

export const CommentActionsDropdown: React.FC<{
  commentId: TCommentSchema["id"];
  parent: TQueryParent;
  initialContent: TCommentSchema["content"];
}> = ({ commentId, parent, initialContent }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const {
    mutate: deleteComment,
    isPending: isDeleting,
    isSuccess,
  } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: "DELETE",
        url: getUrl("api-comments", { commentId }),
        schemas: deleteCommentSchemas,
      }),
    onSuccess: () => {
      toast.success(t("movie.comments.toast.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: getParentQueryKey(parent) });
    },
    onError: () => {
      toast.error(t("movie.comments.toast.deleteError"));
    },
  });

  if (isEditing) {
    return (
      <EditCommentButton
        commentId={commentId}
        parent={parent}
        initialContent={initialContent}
        setIsEditing={setIsEditing}
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="relative w-60">
        <Button className="rounded-full size-fit p-0">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Typography variant="small">
              {t("movie.comments.editComment")}
            </Typography>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <LoadingButton
              variant="ghost"
              onClick={() => deleteComment()}
              loading={isDeleting}
              success={isSuccess}
            >
              <Typography variant="small">
                {t("movie.comments.deleteComment")}
              </Typography>
            </LoadingButton>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const CommentComponent: React.FC<{
  comment: TGetMovieCommentsSchemas["response"]["comments"][number];
  parent: TQueryParent;
  depth?: number;
}> = ({ comment, parent, depth = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const maxDepth = 3;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status: _,
  } = useInfiniteQuery({
    queryKey: ["comment-replies", comment.id],
    queryFn: async ({ pageParam }) =>
      axiosFetch({
        method: "GET",
        url: getUrl("api-comments-replies", {
          commentId: comment.id,
          searchParams: { page: pageParam.toString(), pageSize: "10" },
        }),
        schemas: getCommentRepliesSchemas,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (lastPage) => {
      if (lastPage.page > 1) {
        return lastPage.page - 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  return (
    <div className="flex-col border-b-2 py-1">
      <div className="flex justify-between">
        <Typography>{comment.user.name}:</Typography>
        {comment.isOwnComment && (
          <CommentActionsDropdown
            commentId={comment.id}
            parent={parent}
            initialContent={comment.content}
          />
        )}
      </div>
      <Typography
        variant="small"
        className="whitespace-pre-wrap break-words mb-2"
      >
        {comment.content}
      </Typography>
      <div className="flex space-x-4">
        <CommentLikeButton
          commentId={comment.id}
          isLiked={comment.isLikedByUser}
          likesNumber={comment.likesNumber}
          parent={parent}
        />
        <Button onClick={() => setIsReplying((prev) => !prev)}>
          {t("movie.comments.reply")}
        </Button>
        {isReplying && (
          <PostReplyComment
            commentId={comment.id}
            setIsReplying={setIsReplying}
          />
        )}
      </div>
      <div
        className={`flex-col mt-2 ${
          depth < maxDepth ? "pl-6 border-l border-muted/30" : ""
        }`}
      >
        {data?.pages.map((page) =>
          page.comments.map((subComment) => (
            <CommentComponent
              key={subComment.id}
              comment={subComment}
              parent={{ id: comment.id, type: ParentTypes.COMMENT }}
              depth={depth + 1}
            />
          ))
        )}
      </div>
      {hasNextPage && (
        <LoadingButton
          variant="ghost"
          loading={isFetchingNextPage}
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          <ChevronDown />
        </LoadingButton>
      )}
    </div>
  );
};
