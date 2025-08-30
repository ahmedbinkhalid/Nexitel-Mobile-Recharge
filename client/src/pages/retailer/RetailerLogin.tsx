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
import { Store, ArrowRight, ArrowLeft, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import nexitelLogo from "@assets/logo_1752374863163.jpg";

export default function RetailerLogin() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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
      if (data.user.role !== "retailer") {
        toast({
          title: "Access Denied",
          description: "This portal is for retailers only. Please use the appropriate portal for your role.",
          variant: "destructive",
        });
        return;
      }
      
      login(data.user);
      toast({
        title: "Welcome to Retailer Portal",
        description: `Access granted for ${data.user.username}!`,
      });
      // Redirect to retailer dashboard
      setLocation("/retailer/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid retailer credentials",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  // Demo retailer for quick testing
  const handleDemoLogin = () => {
    form.setValue("username", "retailer1");
    form.setValue("password", "retailer123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Retailer Portal
          </h1>
          <p className="text-gray-600 mt-2">Manage your business operations and customer services</p>
        </div>

        {/* Security Notice */}
        <Card className="mb-6 border-purple-200 bg-purple-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center text-purple-700 text-sm">
              <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Secure Retailer Access</p>
                <p className="text-xs text-purple-600 mt-1">
                  Use credentials provided by your administrator
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Access Card */}
        <Card className="mb-6 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800 text-sm flex items-center">
              <Store className="w-4 h-4 mr-2" />
              Demo Access
            </CardTitle>
            <CardDescription className="text-xs text-blue-600">
              Click to auto-fill demo retailer credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full text-blue-700 border-blue-300 hover:bg-blue-100"
              onClick={handleDemoLogin}
            >
              <div className="text-left">
                <div className="font-medium">Demo Retailer</div>
                <div className="text-xs opacity-75">retailer1</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card className="shadow-lg border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center text-purple-800">
              <Store className="w-5 h-5 mr-2" />
              Retailer Login
            </CardTitle>
            <CardDescription>
              Enter your retailer credentials provided by administration
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
                      <FormLabel>Retailer Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your retailer username" {...field} />
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
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing In..." : "Access Retailer Portal"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </Form>

            {/* Forgot Password Link for Retailers */}
            <div className="mt-4 text-center">
              <Link href="/forgot-password">
                <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                  Forgot username or password?
                </Button>
              </Link>
            </div>

            {/* Back to main portal link */}
            <div className="mt-4 text-center">
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
          <p>Need help with your retailer account?</p>
          <p className="text-xs mt-1">Contact your administrator or support@nexitel.com</p>
        </div>
      </div>
    </div>
  );
}