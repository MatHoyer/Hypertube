import { getUrl } from "@hypertube/libs";

export const notifyServer = async ({
  movieId,
  resolution,
  success,
}: {
  movieId: string;
  resolution: string;
  success: boolean;
}) => {
  console.log(
    getUrl("internal-movie-download-job-end", {
      withServerUrl: true,
    })
  );
  const response = await fetch(
    getUrl("internal-movie-download-job-end", {
      withServerUrl: true,
    }),
    {
      method: "POST",
      body: JSON.stringify({ movieId, resolution, success }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
};
