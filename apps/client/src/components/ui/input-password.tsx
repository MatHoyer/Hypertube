import { useToggle } from "@/hooks/use-toggle";
import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps } from "react";
import { Input } from "./input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group";

const InputPassword: React.FC<Omit<ComponentProps<typeof Input>, "type">> = ({
  ...field
}) => {
  const { value: showPassword, toggle: toggleShowPassword } = useToggle(false);

  return (
    <InputGroup>
      <InputGroupInput
        {...field}
        type={showPassword ? "text" : "password"}
        autoComplete="password"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={toggleShowPassword}>
          {showPassword ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default InputPassword;
