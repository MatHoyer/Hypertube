import { languageCodes, languageCodesArray } from "@hypertube/libs";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { type JSX } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Combobox } from "../ui/combobox";
import { FlagEn } from "./en";
import { FlagEs } from "./es";
import { FlagFr } from "./fr";

const flags: Record<(typeof languageCodesArray)[number], () => JSX.Element> = {
  en: FlagEn,
  fr: FlagFr,
  es: FlagEs,
};

export const FlagCombobox = () => {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  return (
    <Combobox
      elements={Object.entries(languageCodes).map(([value, label]) => ({
        value,
        label,
      }))}
      value={i18n.language}
      setValue={(value) => {
        i18n.changeLanguage(value);
        queryClient.invalidateQueries();
      }}
      placeholderType="language"
      popoverContentAlign="end"
      renderTrigger={(value) => (
        <Button variant="ghost" size="icon">
          {flags[value as (typeof languageCodesArray)[number]]()}
        </Button>
      )}
      renderValue={(value, label, isSelected) => (
        <>
          {flags[value as (typeof languageCodesArray)[number]]()} {label}
          {isSelected && <Check className="ml-auto" />}
        </>
      )}
    />
  );
};
