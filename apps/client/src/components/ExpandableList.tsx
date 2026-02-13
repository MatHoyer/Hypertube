import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

export const ExpandableList = <T,>({
  initialDisplayCount = 4,
  incrementation = 4,
  list,
  renderChild,
}: {
  initialDisplayCount?: number;
  incrementation?: number;
  list: T[];
  renderChild: (list: T) => React.ReactNode;
}) => {
  const { t } = useTranslation();
  const [total, setTotal] = useState(initialDisplayCount);
  const setTotalWithInc = () => {
    setTotal((prev) => Math.min(prev + incrementation, list.length));
  };

  return (
    <div className="flex flex-col gap-2">
      {list.slice(0, total).map((item) => renderChild(item))}
      {total < list.length && (
        <Button variant={"outline"} onClick={setTotalWithInc}>
          {t("global.seeMore", { count: list.length - total })}
          <ChevronDown />
        </Button>
      )}
      {total > initialDisplayCount && (
        <Button variant={"ghost"} onClick={() => setTotal(initialDisplayCount)}>
          {t("global.seeLess")}
          <ChevronUp />
        </Button>
      )}
    </div>
  );
};
