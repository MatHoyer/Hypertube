import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supportedOAuth } from "@/lib/better-auth/constants";

export const OAuthLinkButtons = () => {
  const { accounts } = useAuth();
  const linkedAccounts = accounts.map((account) => account.provider);

  return (
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5 md:m-2">
        {Object.entries(supportedOAuth).map(([oAuth, params], i) => (
          <Card className="p-5" key={i}>
            <img
              src={params.img}
              draggable={false}
              alt={params.name}
              title={params.name}
            />
            {linkedAccounts.includes(oAuth) ? (
              <Button variant={"destructive"}>Unlink</Button>
            ) : (
              <Button>Link</Button>
            )}
          </Card>
        ))}
      </div>
      {!linkedAccounts.includes("credential") && (
        <Button className="mt-2 ml-10 mr-10">Credential here</Button>
      )}
    </div>
  );
};
