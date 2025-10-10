export const getServerUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.BETTER_AUTH_URL;
};
