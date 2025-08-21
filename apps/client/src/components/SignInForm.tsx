import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import InputPassword from "./ui/input-password";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

const formSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(8).max(50),
});

export const SignInForm = () => {
  const [authError, setAuthError] = useState({ error: false, message: "" });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (userData: z.infer<typeof formSchema>) => {
    await authClient.signIn.username(
      {
        username: userData.username,
        password: userData.password,
      },
      {
        onSuccess: () => {
          setAuthError({ error: false, message: "" });
          console.log("Redirection on Profile page");
        },
        onError: (ctx) => {
          setAuthError({ error: true, message: ctx.error.message });
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Username"
                  autoComplete="username"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <InputPassword
                  {...field}
                  placeholder="Password"
                  forgetPasswordOption
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className={cn("flex text-red-500", authError.error || "hidden")}>
          <TriangleAlert />
          <p>{authError.message}</p>
        </div>
        <div className="flex justify-between">
          <Button type="button" variant={"link"} asChild>
            <Link to={"/register"}>Register</Link>
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
};
