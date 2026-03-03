import { useErrorToastHandler } from "@/hooks/use-api";
import useAuth from "@/hooks/use-auth";
import { useNavigate } from "@/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(0, "Password is required"),
});

type UserFormData = z.infer<typeof userSchema>;

const LoginForm = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const errorHandler = useErrorToastHandler();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      await auth.login(data.email, data.password);
    } catch (error) {
      errorHandler(error as any);
    }
  };

  return (
    <div className="flex flex-col">
      <Card className="flex flex-col gap-8">
        <CardHeader>
          <CardTitle>Welcome to GEA News & Ads CMS</CardTitle>
          <CardDescription>
            Please enter your email and password to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        placeholder="Enter your email"
                        type="email"
                        autoComplete="email"
                        {...field}
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
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    !form.watch("email") ||
                    !form.watch("password") ||
                    form.formState.isSubmitting
                  }
                  variant={"default"}
                >
                  {form.formState.isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </div>

              <div className="text-muted-foreground text-center text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-primary cursor-pointer font-medium hover:underline"
                >
                  Register here
                </button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
