import { Button } from "@/components/ui/button";
import { test } from "@hypertube/libs";

const App = () => {
  return (
    <div className="size-full flex justify-center items-center">
      <Button>{test()}</Button>
    </div>
  );
};

export default App;
