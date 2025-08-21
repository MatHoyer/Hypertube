import { useState, type ComponentProps } from "react";
import { Input } from "./input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./button";
import { Link } from "react-router-dom";

const InputPassword: React.FC<
  Omit<ComponentProps<typeof Input>, "type"> & {
    forgetPasswordOption?: boolean;
  }
> = ({ forgetPasswordOption = false, ...field }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
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
      {forgetPasswordOption && (
        <Button
          type="button"
          variant={"link"}
          className="flex justify-end text-neutral-600"
          asChild
        >
          <Link to={"/"}>Forget password ?</Link>
        </Button>
      )}
    </div>
  );
};

export default InputPassword;
