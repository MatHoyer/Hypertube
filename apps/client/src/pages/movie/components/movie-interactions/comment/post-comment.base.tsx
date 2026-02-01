import { LoadingButton } from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Typography } from "@/components/ui/typography";
import { t } from "i18next";
import { Send } from "lucide-react";
import { useState } from "react";

export const BasePostComment: React.FC<{
  postComment: (content: string) => void;
  isPending: boolean;
  isSuccess: boolean;
  autoFocus?: boolean;
}> = ({ postComment, isPending, isSuccess, autoFocus }) => {
  const [newComment, setNewComment] = useState("");

  const handleCancel = () => setNewComment("");

  const maxLength = 500;

  return (
    <InputGroup>
      <InputGroupTextarea
        name="comment"
        maxLength={maxLength}
        autoFocus={autoFocus}
        placeholder={t("movie.comments.addComment")}
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            handleCancel();
          }
        }}
        className="w-full break-all"
      />
      <InputGroupAddon align="block-end">
        <Typography>{maxLength - newComment.length}</Typography>
        <div className="flex w-full justify-end">
          {newComment && (
            <Button
              variant="ghost"
              disabled={!newComment}
              onClick={handleCancel}
            >
              {t("movie.comments.cancel")}
            </Button>
          )}

          <LoadingButton
            disabled={!newComment.trim()}
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
        </div>
      </InputGroupAddon>
    </InputGroup>
  );
};
