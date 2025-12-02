import { useConvertParams } from "@/hooks/use-convert-params";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/layouts/PageLayout";
import { useState } from "react";
import { NotFoundPage } from "../notFound/NotFound.page";
import { Playlist } from "./components/Playlist";
import { PlaylistPageParamsSchema } from "./schemas/urlParams.schema";

export const PlaylistPage = () => {
  const { playlistName } = useConvertParams(PlaylistPageParamsSchema);
  const [isNotFound, setIsNotFound] = useState(false);

  if (isNotFound || !playlistName) return <NotFoundPage />;

  return (
    <Layout>
      <LayoutHeader className="items-center">
        <LayoutTitle>{playlistName}</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <Playlist playlistName={playlistName} setIsNotFound={setIsNotFound} />
      </LayoutContent>
    </Layout>
  );
};
