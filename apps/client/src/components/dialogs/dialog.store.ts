import z from "zod";
import { create } from "zustand";

const dialogSchemas = {
  example: z.object({
    id: z.string(),
  }),
};

type TDialogDataMap = {
  example: z.infer<typeof dialogSchemas.example>;
};

export type TDialogType = keyof TDialogDataMap;

interface DialogStore {
  openDialog: TDialogType | null;
  data: TDialogDataMap[TDialogType] | null;
  open: <T extends TDialogType>(
    dialogType: T,
    data?: TDialogDataMap[T]
  ) => void;
  close: () => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  openDialog: null,
  data: null,
  open: (dialogType, data) => set({ openDialog: dialogType, data }),
  close: () => set({ openDialog: null }),
}));

export const openDialog = <T extends TDialogType>(
  dialogType: T,
  data?: TDialogDataMap[T] extends undefined ? never : TDialogDataMap[T]
) => {
  useDialogStore.getState().open(dialogType, data);
};

export const closeDialog = () => {
  useDialogStore.getState().close();
};

export const getDialogData = <T extends TDialogType>(
  dialogType: T
): TDialogDataMap[T] => {
  const data = useDialogStore.getState().data;
  const schema = dialogSchemas[dialogType];
  if (!schema) throw new Error("Dialog schema not found");

  return schema.parse(data) as TDialogDataMap[T];
};
