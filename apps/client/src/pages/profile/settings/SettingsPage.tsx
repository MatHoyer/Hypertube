import { Card } from "@/components/ui/card";
import { ProfilePictureUpdate } from "./components/ProfilePictureUpdate";
import { UpdateInfo } from "./components/SettingsForm";

export const SettingsPage = () => {
  return (
    <Card>
      <ProfilePictureUpdate />
      <UpdateInfo />
    </Card>
  );
};
