import { Separator } from "@/components/ui/separator";
import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { ProfilePictureUpdate } from "./components/ProfilePictureUpdate";
import { UserInfoUpdate } from "./components/UserInfoUpdate";

export const SettingsPage = () => {
  return (
    <Layout>
      <LayoutContent className="flex flex-col items-center gap-2">
        <ProfilePictureUpdate />
        <Separator className="md:hidden" />
        <UserInfoUpdate />
      </LayoutContent>
    </Layout>
  );
};
