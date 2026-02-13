import { ChevronDown, ChevronUp } from "lucide-react";
import { Fragment, useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

type TExpandableList<T> = {
  initialDisplayCount?: number;
  incrementation?: number;
  list: T[];
  renderChild: (list: T) => React.ReactNode;
  getKey: (list: T) => Key;
};

export const ExpandableList = <T,>({
  initialDisplayCount = 4,
  incrementation = 4,
  list,
  renderChild,
  getKey,
}: TExpandableList<T>) => {
  const { t } = useTranslation();
  const [total, setTotal] = useState(initialDisplayCount);
  const setTotalWithInc = () => {
    setTotal((prev) => Math.min(prev + incrementation, list.length));
  };

  return (
    <div className="flex flex-col gap-2">
      {list.slice(0, total).map((item) => (
        <Fragment key={getKey(item)}>{renderChild(item)}</Fragment>
      ))}
      {total < list.length && (
        <Button variant={"outline"} onClick={setTotalWithInc}>
          {t("expandablelist.seeMore", { count: list.length - total })}
          <ChevronDown />
        </Button>
      )}
      {total > initialDisplayCount && (
        <Button variant={"ghost"} onClick={() => setTotal(initialDisplayCount)}>
          {t("expandablelist.seeLess")}
          <ChevronUp />
        </Button>
      )}
    </div>
  );
};
