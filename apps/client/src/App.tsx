import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReversibleCard, {
  ReversibleCardPattern,
} from "./components/animated/reversible-card/ReversibleCard";
import useReversibleCardState from "./components/animated/reversible-card/useReversibleCardState";
import { openDialog } from "./components/dialogs/dialog.store";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { LoadingButton } from "./components/LoadingButton";
import { ThemeToggle } from "./components/theme/ThemeToggle";

const App = () => {
  const { flip, setIsAnimating, isFlipped, isAnimating } =
    useReversibleCardState();

  return (
    <div className="size-full flex justify-center items-center">
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
        transitionDuration={1}
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
      <LoadingButton
        onClick={() => flip()}
        loading={isAnimating}
        success={isAnimating === false}
      >
        flip with loading
      </LoadingButton>
      <LoadingButton onClick={() => flip()}>flip without loading</LoadingButton>
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
