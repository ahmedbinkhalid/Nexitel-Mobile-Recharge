import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { forgotUsernameSchema, forgotPasswordSchema, type ForgotUsernameRequest, type ForgotPasswordRequest } from "@shared/schema";
import { ArrowLeft, Mail, User, KeyRound, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("username");
  const [response, setResponse] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const forgotUsernameForm = useForm<ForgotUsernameRequest>({
    resolver: zodResolver(forgotUsernameSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const forgotUsernameMutation = useMutation({
    mutationFn: async (data: ForgotUsernameRequest) => {
      return await apiRequest("/api/auth/forgot-username", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (data) => {
      setResponse(data.message);
      toast({
        title: "Success",
        description: "Check your email for username recovery instructions",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process username recovery",
        variant: "destructive",
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      return await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (data) => {
      setResponse(data.message);
      if (data.tempPassword) {
        setTempPassword(data.tempPassword);
      }
      toast({
        title: "Success",
        description: "Temporary password has been generated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process password reset",
        variant: "destructive",
      });
    },
  });

  const handleForgotUsername = (data: ForgotUsernameRequest) => {
    forgotUsernameMutation.mutate(data);
  };

  const handleForgotPassword = (data: ForgotPasswordRequest) => {
    forgotPasswordMutation.mutate(data);
  };

  const resetForms = () => {
    setResponse(null);
    setTempPassword(null);
    forgotUsernameForm.reset();
    forgotPasswordForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Back to Login Link */}
        <div className="mb-6">
          <Link href="/login">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Account Recovery</CardTitle>
            <CardDescription>
              Recover your retailer account username or password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{response}</AlertDescription>
                </Alert>
                
                {tempPassword && (
                  <Alert>
                    <KeyRound className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Temporary Password:</strong> {tempPassword}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        Please save this and change it after logging in
                      </span>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button onClick={resetForms} variant="outline" className="flex-1">
                    Try Again
                  </Button>
                  <Link href="/login" className="flex-1">
                    <Button className="w-full">
                      Go to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="username" className="gap-2">
                    <User className="h-4 w-4" />
                    Username
                  </TabsTrigger>
                  <TabsTrigger value="password" className="gap-2">
                    <KeyRound className="h-4 w-4" />
                    Password
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="username" className="space-y-4 mt-6">
                  <div className="text-center mb-4">
                    <Mail className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                    <h3 className="font-semibold">Forgot Username?</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your email address to recover your username
                    </p>
                  </div>

                  <form onSubmit={forgotUsernameForm.handleSubmit(handleForgotUsername)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your registered email"
                        {...forgotUsernameForm.register("email")}
                      />
                      {forgotUsernameForm.formState.errors.email && (
                        <p className="text-sm text-red-500">
                          {forgotUsernameForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={forgotUsernameMutation.isPending}
                    >
                      {forgotUsernameMutation.isPending ? "Sending..." : "Recover Username"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="password" className="space-y-4 mt-6">
                  <div className="text-center mb-4">
                    <KeyRound className="h-12 w-12 mx-auto text-green-500 mb-2" />
                    <h3 className="font-semibold">Forgot Password?</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your username and email to get a temporary password
                    </p>
                  </div>

                  <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter your username"
                        {...forgotPasswordForm.register("username")}
                      />
                      {forgotPasswordForm.formState.errors.username && (
                        <p className="text-sm text-red-500">
                          {forgotPasswordForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-password">Email Address</Label>
                      <Input
                        id="email-password"
                        type="email"
                        placeholder="Enter your registered email"
                        {...forgotPasswordForm.register("email")}
                      />
                      {forgotPasswordForm.formState.errors.email && (
                        <p className="text-sm text-red-500">
                          {forgotPasswordForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={forgotPasswordMutation.isPending}
                    >
                      {forgotPasswordMutation.isPending ? "Sending..." : "Get Temporary Password"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            <div className="mt-6 pt-4 border-t">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>For Retailers Only:</strong> This recovery system is available only for retailer accounts. 
                  Admins and employees should contact system administrators for password assistance.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}