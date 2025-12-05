import { LoadingButton } from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Typography } from "@/components/ui/typography";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import {
  deleteCommentSchemas,
  getUrl,
  patchCommentSchemas,
  ROUTES,
} from "@hypertube/libs";
import type { TCommentSchema } from "@hypertube/libs/src/schemas/database/comments.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { EllipsisVertical } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getParentQueryKey, type TQueryParent } from "../utils";

export const CommentActionsDropdown: React.FC<{
  commentId: TCommentSchema["id"];
  parent: TQueryParent;
  setIsEditing: (value: boolean) => void;
  disabled: boolean;
}> = ({ commentId, parent, setIsEditing, disabled }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutate: deleteComment } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: "DELETE",
        url: getUrl(ROUTES.API.COMMENTS, { commentId }),
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button className="rounded-full" size="icon" variant="ghost">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Typography textSize={"sm"}>
              {t("movie.comments.editComment")}
            </Typography>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => deleteComment()}>
            <Typography textSize={"sm"}>
              {t("movie.comments.deleteComment")}
            </Typography>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const EditCommentInput: React.FC<{
  commentId: TCommentSchema["id"];
  parent: TQueryParent;
  initialContent: TCommentSchema["content"];
  setIsEditing: (value: boolean) => void;
}> = ({ commentId, parent, initialContent, setIsEditing }) => {
  const queryClient = useQueryClient();
  const [editedContent, setEditedContent] = useState(initialContent);
  const maxLength = 500;

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
      queryClient.fetchQuery({ queryKey: getParentQueryKey(parent) });
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
        maxLength={500}
        placeholder={t("movie.comments.editComment")}
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            handleCancel();
          }
        }}
        disabled={isPending}
      />
      <InputGroupAddon align="inline-end">
        <Typography>{maxLength - editedContent.length}</Typography>
        <Button
          variant="ghost"
          disabled={isPending}
          onClick={() => handleCancel()}
        >
          {t("movie.comments.cancel")}
        </Button>
        <LoadingButton
          disabled={!editedContent.trim() || editedContent === initialContent}
          variant="ghost"
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
