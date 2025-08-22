import { useState, type ComponentProps } from "react";
import { Input } from "./input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const InputPassword: React.FC<
  Omit<ComponentProps<typeof Input>, "type"> & {
    forgetPasswordOption?: boolean;
  }
> = ({ forgetPasswordOption = false, ...field }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-center gap-2">
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
      {forgetPasswordOption && (
        <Button
          type="button"
          variant={"link"}
          className="flex justify-end text-neutral-600"
          asChild
        >
          <Link to={"/"}>{t("sign.forgetPassword")}</Link>
        </Button>
      )}
    </div>
  );
};

export default InputPassword;
