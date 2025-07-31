import { create } from "zustand";

interface AlertDialogStore {
  isOpen: boolean;
  cb: (() => void) | null;
  open: (cb: () => void) => void;
  close: () => void;
}

export const useAlertDialogStore = create<AlertDialogStore>((set) => ({
  isOpen: false,
  cb: null,
  open: (cb: () => void) => set({ isOpen: true, cb }),
  close: () => set({ isOpen: false, cb: null }),
}));

export const openAlertDialog = (cb: () => void) => {
  useAlertDialogStore.getState().open(cb);
};

export const closeAlertDialog = () => {
  useAlertDialogStore.getState().close();
};
