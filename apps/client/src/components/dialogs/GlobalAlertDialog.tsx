import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAlertDialogStore } from "./alert-dialog.store";

export const GlobalAlertDialog = () => {
  const { isOpen, cb, close, options } = useAlertDialogStore();
  const [confirmTextToType, setConfirmTextToType] = useState("");
  const [doubleConfirm, setDoubleConfirm] = useState(false);
  const { t } = useTranslation();

  const handleClose = () => {
    setConfirmTextToType("");
    setDoubleConfirm(false);
    close();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="z-60" />
        <AlertDialogContent className="z-60">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {options?.title || t("alert-dialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {options?.description || t("alert-dialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {(!!options?.confirmTextToType || !!options?.doubleConfirm) && (
            <div className="flex flex-col gap-4 py-4">
              {!!options?.confirmTextToType && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmTextToType">
                    {t("alert-dialog.confirmTextToType", {
                      confirmTextToType: options.confirmTextToType,
                    })}
                  </Label>
                  <Input
                    id="confirmTextToType"
                    value={confirmTextToType}
                    onChange={(e) => setConfirmTextToType(e.target.value)}
                  />
                </div>
              )}
              {!!options?.doubleConfirm && (
                <div className="flex items-center justify-start gap-2">
                  <Checkbox
                    id="doubleConfirm"
                    checked={doubleConfirm}
                    onCheckedChange={(checked) => setDoubleConfirm(!!checked)}
                  />
                  <Label htmlFor="doubleConfirm">
                    {t("alert-dialog.doubleConfirm")}
                  </Label>
                </div>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClose}>
              {options?.cancelLabel || t("alert-dialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={
                (!!options?.confirmTextToType &&
                  confirmTextToType !== options.confirmTextToType) ||
                (!!options?.doubleConfirm && !doubleConfirm)
              }
              onClick={() => {
                cb?.();
                handleClose();
              }}
            >
              {options?.confirmLabel || t("alert-dialog.continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};
