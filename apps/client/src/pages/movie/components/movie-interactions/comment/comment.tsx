import { ImageAvatar } from "@/components/images/Avatar";
import { LoadingButton } from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { cn, getNearDateWithLocale } from "@/lib/utils";
import {
  getCommentRepliesSchemas,
  getUrl,
  ParentTypes,
  ROUTES,
  type TGetMovieCommentsSchemas,
} from "@hypertube/libs";
import { useInfiniteQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { ChevronDown, Reply } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CommentLikeButton } from "../like/like";
import type { TQueryParent } from "../utils";
import { CommentActionsDropdown, EditCommentInput } from "./comment.actions";
import { PostReplyComment } from "./post-comment";

export const Comment: React.FC<{
  comment: TGetMovieCommentsSchemas["response"]["comments"][number];
  parent: TQueryParent;
  depth?: number;
}> = ({ comment, parent, depth = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const maxDepth = 1;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: getQueryKey(ROUTES.API.COMMENTS_REPLIES, {
        commentId: comment.id,
      }),
      queryFn: ({ pageParam }) =>
        axiosFetch({
          method: "GET",
          url: getUrl(ROUTES.API.COMMENTS_REPLIES, {
            commentId: comment.id,
            searchParams: { page: pageParam, pageSize: "10" },
          }),
          schemas: getCommentRepliesSchemas,
        }),
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.totalPages) {
          return lastPage.page + 1;
        }
        return undefined;
      },
      enabled: false,
      initialPageParam: 1,
    });

  const canLoadMore = comment.hasReplies && (!data || hasNextPage);

  return (
    <div className="flex flex-col mt-2 gap-2">
      <div className="flex justify-between">
        <div className="flex items-center">
          <ImageAvatar
            imageSrc={comment.user.image ?? undefined}
            name={comment.user.name}
            size={parent.type === ParentTypes.MOVIE ? "sm" : "xs"}
          />
          <Button asChild variant="link">
            <Link
              to={getUrl(ROUTES.CLIENT.PROFILE, { userId: comment.userId })}
            >
              <Typography>{comment.user.name}</Typography>
            </Link>
          </Button>
          <Typography textSize={"xs"} textColor={"muted"}>
            {getNearDateWithLocale({ date: comment.createdAt })}
          </Typography>
        </div>

        {comment.isOwnComment && (
          <CommentActionsDropdown
            commentId={comment.id}
            parent={parent}
            setIsEditing={setIsEditing}
            disabled={comment.deletedAt !== null}
          />
        )}
      </div>
      {isEditing ? (
        <EditCommentInput
          commentId={comment.id}
          parent={parent}
          initialContent={comment.content}
          setIsEditing={setIsEditing}
        />
      ) : (
        <Typography textSize={"sm"} functionnal="wrap">
          {comment.content}
        </Typography>
      )}

      {isReplying && (
        <PostReplyComment
          commentId={comment.id}
          setIsReplying={setIsReplying}
        />
      )}
      <div className="flex gap-4 justify-end">
        <CommentLikeButton
          commentId={comment.id}
          isLiked={comment.isLikedByUser}
          likesNumber={comment.likesNumber}
          parent={parent}
          disabled={comment.deletedAt !== null}
        />
        {!isEditing && depth < maxDepth && (
          <Button
            className="rounded-full"
            size="icon"
            onClick={() => setIsReplying((prev) => !prev)}
            disabled={comment.deletedAt !== null}
          >
            <Reply />
          </Button>
        )}
      </div>
      <div
        className={cn(
          "flex-col mt-2",
          depth < maxDepth && "pl-6 border-l border-muted/30"
        )}
      >
        {data?.pages.map((page) =>
          page.comments.map((subComment) => (
            <Comment
              key={subComment.id}
              comment={subComment}
              parent={{ id: comment.id, type: ParentTypes.COMMENT }}
              depth={depth + 1}
            />
          ))
        )}
      </div>
      {canLoadMore && (
        <LoadingButton
          variant="ghost"
          loading={isFetchingNextPage}
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          <ChevronDown />
          {t("movie.comments.loadMore")}
        </LoadingButton>
      )}
    </div>
  );
};
