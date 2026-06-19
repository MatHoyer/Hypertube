import { Layout, LayoutContent } from "@/layouts/PageLayout";
import { DeleteButton } from "./components/DeleteButton";
import { OAuthLinkButtons } from "./components/OAuthLinkButtons";
import { ProfilePictureUpdate } from "./components/ProfilePictureUpdate";
import { UserEmailUpdate } from "./components/UserEmailUpdate";
import { UserInfoUpdate } from "./components/UserInfoUpdate";
import { UserPasswordUpdate } from "./components/UserPasswordUpdate";

export const SettingsPage = () => {
  return (
    <Layout>
      <LayoutContent className="flex flex-col items-center gap-2">
        <ProfilePictureUpdate />
        <UserInfoUpdate />
        <UserEmailUpdate />
        <UserPasswordUpdate />
        <OAuthLinkButtons />
        <DeleteButton />
      </LayoutContent>
    </Layout>
  );
};
