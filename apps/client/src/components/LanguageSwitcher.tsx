import { languages } from "@/lib/i18n/constants";
import { useTranslation } from "react-i18next";
import { Combobox } from "./ui/combobox";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <Combobox
      elements={languages}
      value={i18n.language}
      setValue={(value) => i18n.changeLanguage(value)}
      placeholderType="language"
    />
  );
};
