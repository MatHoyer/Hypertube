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
import { MoreVertical } from "lucide-react";
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

  const { mutate: deleteComment, isPending: isDeleting } = useMutation({
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
          <MoreVertical />{" "}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            {t("movie.comments.editComment")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => deleteComment()}
            disabled={isDeleting}
          >
            {t("movie.comments.deleteComment")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const CommentComponent: React.FC<{
  comment: TGetMovieCommentsSchemas["response"]["comments"][number];
  parent: TQueryParent;
}> = ({ comment, parent }) => {
  const [isReplying, setIsReplying] = useState(false);

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
    <div className="border-b py-2">
      {comment.isOwnComment && (
        <CommentActionsDropdown
          commentId={comment.id}
          parent={parent}
          initialContent={comment.content}
        />
      )}
      <Typography>{comment.id}:</Typography>
      <Typography variant="small">
        {comment.content} {comment.isOwnComment}
      </Typography>
      <div className="flex">
        <CommentLikeButton
          commentId={comment.id}
          isLiked={comment.isLikedByUser}
          likesNumber={comment.likesNumber}
          parent={parent}
        />
        <Button onClick={() => setIsReplying((prev) => !prev)}>Répondre</Button>
        {isReplying && (
          <PostReplyComment
            commentId={comment.id}
            setIsReplying={setIsReplying}
          />
        )}
      </div>
      <div>
        {data?.pages.map((page) =>
          page.comments.map((subComment) => (
            <CommentComponent
              key={subComment.id}
              comment={subComment}
              parent={{ id: comment.id, type: ParentTypes.COMMENT }}
            />
          ))
        )}
      </div>
      <button
        className="cursor-pointer"
        disabled={!hasNextPage || isFetchingNextPage}
        onClick={() => fetchNextPage()}
      >
        {isFetchingNextPage ? "Chargement..." : "Charger plus"}
      </button>
    </div>
  );
};
