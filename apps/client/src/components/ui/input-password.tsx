import { useState, type ComponentProps } from "react";
import { Input } from "./input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./button";

const InputPassword: React.FC<Omit<ComponentProps<typeof Input>, "type">> = (
  field
) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Input
        type={showPassword ? "text" : "password"}
        autoComplete="password"
        {...field}
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
