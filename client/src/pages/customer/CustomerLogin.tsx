import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, type LoginRequest } from "@shared/schema";
import { useAuth } from "@/components/AuthProvider";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Smartphone, User, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import nexitelLogo from "@assets/logo_1752374863163.jpg";

export default function CustomerLogin() {
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiRequest("/api/auth/login", { method: "POST", body: data });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user.role !== "customer") {
        toast({
          title: "Access Denied",
          description: "This portal is for customers only. Staff please use the main portal.",
          variant: "destructive",
        });
        return;
      }
      
      login(data.user);
      toast({
        title: "Welcome back!",
        description: `Login successful, ${data.user.username}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  // Demo customer for quick testing
  const handleDemoLogin = () => {
    form.setValue("username", "customer1");
    form.setValue("password", "customer123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <img 
              src={nexitelLogo} 
              alt="Nexitel Logo" 
              className="w-20 h-20 mx-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
            Customer Portal
          </h1>
          <p className="text-gray-600 mt-2">Access your account and manage services</p>
        </div>

        {/* Demo Access Card */}
        <Card className="mb-6 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800 text-sm flex items-center">
              <User className="w-4 h-4 mr-2" />
              Demo Access
            </CardTitle>
            <CardDescription className="text-xs text-blue-600">
              Click to auto-fill demo customer credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full text-blue-700 border-blue-300 hover:bg-blue-100"
              onClick={handleDemoLogin}
            >
              <div className="text-left">
                <div className="font-medium">Demo Customer</div>
                <div className="text-xs opacity-75">customer1</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card className="shadow-lg border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="flex items-center text-green-800">
              <Smartphone className="w-5 h-5 mr-2" />
              Customer Login
            </CardTitle>
            <CardDescription>
              Enter your customer credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
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
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </Form>

            {/* Back to main portal link */}
            <div className="mt-6 text-center">
              <Link href="/">
                <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Main Portal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Support Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Need help? Contact customer support</p>
          <p className="text-xs mt-1">support@nexitel.com</p>
        </div>
      </div>
    </div>
  );
}