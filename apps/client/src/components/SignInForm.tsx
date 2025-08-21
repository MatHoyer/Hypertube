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

export const SignInForm = () => {
  const [wrongCredential, setWrongCredential] = useState(false);
  const formSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(50),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (userData: z.infer<typeof formSchema>) => {
    await authClient.signIn.email(
      {
        email: userData.email,
        password: userData.password,
      },
      {
        onSuccess: () => {
          setWrongCredential(false);
          console.log("Redirection on Profile page");
        },
        onError: () => {
          setWrongCredential(true);
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center relative h-full w-full md:h-fit md:w-fit md:rounded-2xl p-8 bg-black/40 overflow-y-scroll md:overflow-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" autoComplete="email" {...field} />
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
                  <InputPassword placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className={cn("flex text-red-500", wrongCredential || "hidden")}>
            <TriangleAlert />
            <p>Incorrect email or password.</p>
          </div>
          <div className="flex justify-between">
            <Button type="button" variant={"link"} asChild>
              <Link to={"/register"}>Register</Link>
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
