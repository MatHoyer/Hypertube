import { LoadingButton } from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";
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

  return (
    <InputGroup>
      <InputGroupTextarea
        autoFocus={autoFocus}
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
            disabled={!newComment}
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
