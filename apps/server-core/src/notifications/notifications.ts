export const notifications = {
  TEST: "test",
} as const;

export type TNotification = (typeof notifications)[keyof typeof notifications];
