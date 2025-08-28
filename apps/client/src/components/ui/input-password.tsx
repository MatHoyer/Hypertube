import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Button } from "./button";
import { Input } from "./input";

const InputPassword: React.FC<Omit<ComponentProps<typeof Input>, "type">> = ({
  ...field
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex gap-2">
      <Input
        {...field}
        type={showPassword ? "text" : "password"}
        autoComplete="password"
      />
      <Button
        type="button"
        variant={"outline"}
        onClick={() => {
          setShowPassword((prev) => !prev);
        }}
      >
        {showPassword ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
};

export default InputPassword;
