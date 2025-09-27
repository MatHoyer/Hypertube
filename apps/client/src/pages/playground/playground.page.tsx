import { Button } from "@/components/ui/button";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/layouts/PageLayout";
import { getUrl } from "@hypertube/libs";
import { useNavigate } from "react-router-dom";

export const PlaygroundPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Playground</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <div className="p-4">
          <Button
            onClick={() => {
              navigate(
                getUrl("client-movie", {
                  tmdbId: 0,
                })
              );
            }}
          >
            Demo movie
          </Button>
        </div>
      </LayoutContent>
    </Layout>
  );
};
