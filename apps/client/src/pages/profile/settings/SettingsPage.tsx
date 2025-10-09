import { Separator } from "@/components/ui/separator";
import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { OAuthLinkButtons } from "./components/OAuthLinkButtons";
import { ProfilePictureUpdate } from "./components/ProfilePictureUpdate";
import { UserInfoUpdate } from "./components/UserInfoUpdate";

export const SettingsPage = () => {
  return (
    <Layout>
      <LayoutContent className="flex flex-col items-center gap-2">
        <ProfilePictureUpdate />
        <Separator className="md:hidden" />
        <UserInfoUpdate />
        <Separator className="md:hidden" />
        <OAuthLinkButtons />
      </LayoutContent>
    </Layout>
  );
};
