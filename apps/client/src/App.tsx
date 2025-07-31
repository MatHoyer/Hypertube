import { Button } from "@/components/ui/button";
import { getUrl, testSchemas } from "@hypertube/libs";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import ReversibleCard, {
  ReversibleCardPattern,
} from "./components/animated/reversible-card/ReversibleCard";
import useReversibleCardState from "./components/animated/reversible-card/useReversibleCardState";
import { openDialog } from "./components/dialogs/dialog.store";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { LoadingButton } from "./components/LoadingButton";
import { ThemeToggle } from "./components/theme/ThemeToggle";
import { axiosFetch } from "./lib/fetch/axiosFetch";

const App = () => {
  const { t } = useTranslation();
  const testMutate = useMutation({
    mutationFn: async () => {
      return await axiosFetch({
        method: "POST",
        url: getUrl("api-test", { id: 1 }),
        schemas: testSchemas,
        data: { id: 1 },
        handleEnding: {
          successMessage: "Reussi",
          errorMessage: "Rate",
          cb: (data) => {
            console.log(data);
          },
        },
      });
    },
  });
  const { flip, setIsAnimating, isFlipped, isAnimating } =
    useReversibleCardState();

  return (
    <div className="size-full flex justify-center items-center">
      <Button onClick={() => testMutate.mutate()}>{t("global.hello")}</Button>
      <Button
        onClick={() =>
          toast.success("test toast", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          })
        }
      >
        test toast
      </Button>
      <LanguageSwitcher />
      <ThemeToggle />
      <ReversibleCard
        className="size-32"
        isFlipped={isFlipped}
        setIsAnimating={setIsAnimating}
        FrontComponent={() => (
          <ReversibleCardPattern className="bg-red-500">
            front
          </ReversibleCardPattern>
        )}
        BackComponent={() => (
          <ReversibleCardPattern className="bg-blue-500">
            back
          </ReversibleCardPattern>
        )}
      />
      <LoadingButton onClick={() => flip()} loading={isAnimating}>
        flip
      </LoadingButton>
      <Button
        onClick={() =>
          openDialog("example", {
            id: "1",
          })
        }
      >
        open
      </Button>
    </div>
  );
};

export default App;
