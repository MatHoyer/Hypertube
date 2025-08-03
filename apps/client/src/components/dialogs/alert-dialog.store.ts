import { create } from "zustand";

interface AlertDialogOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTextToType?: string;
  doubleConfirm?: boolean;
}

interface AlertDialogStore {
  isOpen: boolean;
  cb: (() => void) | null;
  options: AlertDialogOptions | null;
  open: (cb: () => void, options?: AlertDialogOptions) => void;
  close: () => void;
}

export const useAlertDialogStore = create<AlertDialogStore>((set) => ({
  isOpen: false,
  cb: null,
  options: null,
  open: (cb, options) => set({ isOpen: true, cb, options }),
  close: () => set({ isOpen: false, cb: null, options: null }),
}));

export const openAlertDialog = (
  cb: () => void,
  options?: AlertDialogOptions
) => {
  useAlertDialogStore.getState().open(cb, options);
};

export const closeAlertDialog = () => {
  useAlertDialogStore.getState().close();
};
