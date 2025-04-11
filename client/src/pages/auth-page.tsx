import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heart, Loader2, User, MoveRight, Mail, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Extend the schema from shared/schema.ts
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["patient", "caretaker"]),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
  role: z.enum(["patient", "caretaker"]),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [activeRole, setActiveRole] = useState<"patient" | "caretaker">("patient");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "patient") {
        navigate("/patient/dashboard");
      } else if (user.role === "caretaker") {
        navigate("/caretaker/dashboard");
      }
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "patient",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      phone: "",
      role: "patient",
      acceptTerms: false,
    },
  });

  // Handle login submit
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
      role: data.role,
    });
  };

  // Handle register submit
  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { acceptTerms, ...userData } = data;
    registerMutation.mutate(userData);
  };

  // Update role in forms when changed
  useEffect(() => {
    loginForm.setValue("role", activeRole);
    registerForm.setValue("role", activeRole);
  }, [activeRole, loginForm, registerForm]);

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Heart className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2">
              Welcome to MemHeav
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Specialized care and support for dementia patients and their caretakers.
              Find care, manage medications, and stay on top of daily tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Auth Forms */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">
                  {activeTab === "login" ? "Sign In" : "Create Account"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "login"
                    ? "Sign in to access your account"
                    : "Register a new account to get started"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Role Selection */}
                <div className="flex gap-4 mb-6">
                  <Button
                    type="button"
                    className={`w-1/2 ${activeRole === "patient" ? "" : "bg-white border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-100"}`}
                    onClick={() => setActiveRole("patient")}
                  >
                    Patient
                  </Button>
                  <Button
                    type="button"
                    className={`w-1/2 ${activeRole === "caretaker" ? "" : "bg-white border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-100"}`}
                    onClick={() => setActiveRole("caretaker")}
                    variant={activeRole === "caretaker" ? "default" : "outline"}
                  >
                    Caretaker
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-5 w-5" />
                                  <Input
                                    placeholder="Enter your username"
                                    className="pl-10 py-6 text-lg"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between">
                                <FormLabel>Password</FormLabel>
                                <a href="#" className="text-sm text-primary-600 hover:underline">
                                  Forgot password?
                                </a>
                              </div>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="pl-10 py-6 text-lg"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-5 w-5" />
                                    ) : (
                                      <Eye className="h-5 w-5" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={loginForm.control}
                          name="rememberMe"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium cursor-pointer">
                                Remember me
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full py-6 text-lg font-medium"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          ) : null}
                          Sign In
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your full name"
                                  className="py-6 text-lg"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-5 w-5" />
                                  <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="pl-10 py-6 text-lg"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-5 w-5" />
                                  <Input
                                    placeholder="Choose a username"
                                    className="pl-10 py-6 text-lg"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your phone number"
                                  className="py-6 text-lg"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    className="pl-3 py-6 text-lg"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-5 w-5" />
                                    ) : (
                                      <Eye className="h-5 w-5" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="acceptTerms"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium cursor-pointer">
                                  I accept the{" "}
                                  <a href="#" className="text-primary-600 hover:underline">
                                    terms and conditions
                                  </a>
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full py-6 text-lg font-medium"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          ) : null}
                          Create Account
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Hero Section */}
            <div className="bg-primary-600 rounded-xl shadow-md p-8 flex flex-col justify-between text-white">
              <div>
                <h2 className="text-3xl font-bold mb-4">Care and Support for Dementia Patients</h2>
                <p className="mb-6 text-primary-50">
                  Our specialized platform helps dementia patients find the right caretakers,
                  manage medication reminders, and keep track of daily tasks with ease.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-500 p-3 rounded-full">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Find Qualified Caretakers</h3>
                      <p className="text-primary-50">
                        Search for caretakers based on experience, specialization, and pricing.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-500 p-3 rounded-full">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Medication Management</h3>
                      <p className="text-primary-50">
                        Set reminders for medications and track when they've been taken.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-500 p-3 rounded-full">
                      <MoveRight className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Daily Task Reminders</h3>
                      <p className="text-primary-50">
                        Never forget important daily activities with our task management system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-primary-500 pt-6">
                <p className="text-primary-50 italic">
                  "CareConnect has been a lifesaver for our family. My father's quality of life
                  has improved significantly since we started using the app."
                </p>
                <p className="mt-2 font-medium">— Sarah Thompson, Patient's Daughter</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
