import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MovieDialog } from "@/pages/library/dialogs/movie-dialog";
import { NewCredentialsDialog } from "@/pages/oauthCredentials/dialogs/new-credentials";
import { PostCredentialsDialog } from "@/pages/oauthCredentials/dialogs/post-credentials";
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
            openAlertDialog(
              () => {
                closeDialog();
              },
              {
                confirmLabel: "Close",
                confirmTextToType: "example",
                doubleConfirm: true,
              }
            )
          }
        >
          Close
        </Button>
      </DialogContent>
    );
  },
  newCredential: () => {
    const data = getDialogData("newCredential");

    return (
      <NewCredentialsDialog
        clientId={data.clientId}
        clientSecret={data.clientSecret}
      />
    );
  },
  postCredentials: () => {
    return <PostCredentialsDialog />;
  },
  movie: () => {
    const movie = getDialogData("movie");
    return <MovieDialog movie={movie} />;
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
