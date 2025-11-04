import { Card } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// const [query, setQuery] = useQueryState("query", { defaultValue: "" });
// const [input, setInput] = useState("");
// const navigate = useNavigate();

// useEffect(() => {
//   const timeout = setTimeout(() => console.log(""), 500);
//   return () => clearTimeout(timeout);
// }, [input]);

{
  /* <Input
  placeholder={t("navbar.placeholder")}
  onKeyDown={({ code }) => {
    if (code === "Enter")
      navigate(
        getUrl("client-home", { searchParams: { query: input } })
      );
  }}
  onChange={({ currentTarget }) => {
    setInput(currentTarget.value);
  }}
/> */
}

export const SearchCard: React.FC<{
  setQuery: (value: string) => void;
}> = ({ setQuery }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");

  return (
    <Card>
      <InputGroup>
        <InputGroupInput
          placeholder={t("navbar.placeholder")}
          onKeyDown={({ code }) => {
            if (code === "Enter") setQuery(input);
          }}
          onChange={({ currentTarget }) => setInput(currentTarget.value)}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
    </Card>
  );
};
