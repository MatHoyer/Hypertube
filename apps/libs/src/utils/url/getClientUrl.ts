export const getClientUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.CLIENT_URL;
};
