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
import { useTranslation } from "react-i18next";
import { useAlertDialogStore } from "./alert-dialog.store";

export const GlobalAlertDialog = () => {
  const { isOpen, cb, close } = useAlertDialogStore();
  const { t } = useTranslation();

  return (
    <AlertDialog open={isOpen} onOpenChange={close}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="z-[60]" />
        <AlertDialogContent className="z-[60]">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("alert-dialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("alert-dialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={close}>
              {t("alert-dialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                cb?.();
                close();
              }}
            >
              {t("alert-dialog.continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};
