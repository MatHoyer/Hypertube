import type React from "react";
import type { ComponentProps, PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { LoadingButton } from "../LoadingButton";
import { Button } from "../ui/button";
import { DialogClose, DialogFooter } from "../ui/dialog";

/**
 * @description Global dialog footer component.
 * If you overwrite the default button, you must not provide props for him
 *
 *
 * @param defaultCancelButtonProps - Props for the default cancel button
 * @param defaultSubmitButtonProps - Props for the default submit button
 * @param submitButtonOverwrite - Overwrite for the default submit button
 * @param cancelButtonOverwrite - Overwrite for the default cancel button
 */
export const GlobalDialogFooter: React.FC<{
  defaultCancelButtonProps?: ComponentProps<typeof Button> & PropsWithChildren;
  defaultSubmitButtonProps?: ComponentProps<typeof LoadingButton> &
    PropsWithChildren;
  submitButtonOverwrite?: React.ReactNode;
  cancelButtonOverwrite?: React.ReactNode;
}> = ({
  defaultCancelButtonProps,
  defaultSubmitButtonProps,
  submitButtonOverwrite,
  cancelButtonOverwrite,
}) => {
  const { t } = useTranslation();

  return (
    <DialogFooter>
      {cancelButtonOverwrite ? (
        cancelButtonOverwrite
      ) : (
        <DialogClose asChild>
          <Button variant="outline" {...defaultCancelButtonProps}>
            {defaultCancelButtonProps?.children ?? t("dialog.cancel")}
          </Button>
        </DialogClose>
      )}
      {submitButtonOverwrite ? (
        submitButtonOverwrite
      ) : (
        <LoadingButton {...defaultSubmitButtonProps}>
          {defaultSubmitButtonProps?.children ?? t("dialog.submit")}
        </LoadingButton>
      )}
    </DialogFooter>
  );
};
