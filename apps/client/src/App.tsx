import { Button } from "@/components/ui/button";
import { getUrl, test, testSchemas } from "@hypertube/libs";
import { useMutation } from "@tanstack/react-query";
import { axiosFetch } from "./lib/fetch/axiosFetch";

const App = () => {
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

  return (
    <div className="size-full flex justify-center items-center">
      <Button onClick={() => testMutate.mutate()}>{test()}</Button>
    </div>
  );
};

export default App;
