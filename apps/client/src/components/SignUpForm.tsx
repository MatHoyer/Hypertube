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
  email: z.email(),
  username: z.string().min(1).max(50),
  password: z.string().min(8).max(50),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});

export const SignUpForm = () => {
  const [authError, setAuthError] = useState({ error: false, message: "" });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = async (userData: z.infer<typeof formSchema>) => {
    await authClient.signUp.email(
      {
        email: userData.email,
        username: userData.username,
        name: userData.firstName + " " + userData.lastName,
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 items-start w-full">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="First Name"
                    autoComplete="given-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Last Name"
                    autoComplete="family-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="w-full">
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
            <FormItem className="w-full">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <InputPassword {...field} placeholder="Password" />
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
            <Link to={"/login"}>Login</Link>
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
};
