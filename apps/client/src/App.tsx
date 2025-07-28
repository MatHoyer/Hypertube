import { Button } from "@/components/ui/button";
import { getUrl, testSchemas } from "@hypertube/libs";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
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

  return (
    <div className="size-full flex justify-center items-center">
      <Button onClick={() => testMutate.mutate()}>{t("global.hello")}</Button>
      <LanguageSwitcher />
    </div>
  );
};

export default App;
