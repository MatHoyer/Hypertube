import { languageCodes } from "@hypertube/libs";
import { useTranslation } from "react-i18next";
import { Combobox } from "./ui/combobox";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <Combobox
      elements={Object.entries(languageCodes).map(([value, label]) => ({
        value,
        label,
      }))}
      value={i18n.language}
      setValue={(value) => i18n.changeLanguage(value)}
      placeholderType="language"
    />
  );
};
