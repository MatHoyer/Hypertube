import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { openAlertDialog } from "./alert-dialog.store";
import {
  closeDialog,
  getDialogData,
  useDialogStore,
  type TDialogType,
} from "./dialog.store";

const dialogComponents: Record<TDialogType, React.FC> = {
  example: () => {
    const data = getDialogData("example");
    return (
      <DialogContent className="h-96">
        <p>{data.id}</p>
        <Button
          onClick={() =>
            openAlertDialog(() => {
              closeDialog();
            })
          }
        >
          Close
        </Button>
      </DialogContent>
    );
  },
};

export const GlobalDialog = () => {
  const { openDialog, close } = useDialogStore();

  const DialogComponent = openDialog ? dialogComponents[openDialog] : null;

  return (
    <Dialog open={!!openDialog} onOpenChange={close}>
      {DialogComponent && <DialogComponent />}
    </Dialog>
  );
};
