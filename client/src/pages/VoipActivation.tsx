import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Phone, Users, Mail, Download, FileText, Zap, AlertCircle } from "lucide-react";
import { voipActivationSchema, type VoipActivationRequest, type VoipPlan } from "@shared/schema";

export default function VoipActivation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<VoipPlan | null>(null);

  const handleBackNavigation = () => {
    if (user?.role === "retailer") {
      window.location.href = "/retailer/dashboard";
    } else if (user?.role === "employee") {
      window.location.href = "/employee/dashboard";
    } else if (user?.role === "admin") {
      window.location.href = "/admin/dashboard";
    } else {
      window.location.href = "/";
    }
  };

  // Fetch VoIP plans
  const { data: voipPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/voip/plans"],
  });
  
  // Ensure voipPlans is always an array
  const safeVoipPlans = Array.isArray(voipPlans) ? voipPlans : [];

  // Fetch recent activations
  const { data: recentActivations = [] } = useQuery({
    queryKey: ["/api/voip/activations", user?.id],
    enabled: !!user?.id,
  });
  
  // Ensure recentActivations is always an array
  const safeRecentActivations = Array.isArray(recentActivations) ? recentActivations : [];

  const form = useForm<VoipActivationRequest>({
    resolver: zodResolver(voipActivationSchema),
    defaultValues: {
      planId: 0,
      customerEmail: "",
      customerName: "",
      customerPhone: "",
      notes: "",
      employeeId: "",
    },
  });

  const activationMutation = useMutation({
    mutationFn: async (data: VoipActivationRequest) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      return apiRequest("/api/voip/activate", {
        method: "POST",
        body: {
          ...data,
          userId: user.id,
        }
      });
    },
    onSuccess: (result) => {
      toast({
        title: "VoIP Activation Successful!",
        description: `VoIP number ${result.voipNumber} activated for ${result.customerName}. Setup email sent automatically.`,
        variant: "default",
      });
      
      form.reset();
      setSelectedPlan(null);
      queryClient.invalidateQueries({ queryKey: ["/api/voip/activations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Activation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (format: 'csv' | 'excel') => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const response = await fetch(`/api/voip/export/${format}?userId=${user.id}`);
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voip-activations-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: (_, format) => {
      toast({
        title: "Export Successful",
        description: `VoIP activations exported as ${format.toUpperCase()} file.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VoipActivationRequest) => {
    activationMutation.mutate(data);
  };

  const handlePlanChange = (planId: string) => {
    const plan = safeVoipPlans.find((p: VoipPlan) => p.id === parseInt(planId));
    setSelectedPlan(plan || null);
    form.setValue("planId", parseInt(planId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={handleBackNavigation}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Phone className="w-8 h-8 text-blue-600 mr-3" />
                VoIP Activation
              </h1>
              <p className="text-gray-600 mt-2">Activate VoIP phone numbers with automatic setup instructions</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => exportMutation.mutate('csv')}
                disabled={exportMutation.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => exportMutation.mutate('excel')}
                disabled={exportMutation.isPending}
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activation Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 text-blue-600 mr-2" />
                  VoIP Number Activation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Employee Verification Required */}
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <h3 className="text-sm font-semibold text-red-800 mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        Employee Verification Required
                      </h3>
                      <FormField
                        control={form.control}
                        name="employeeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Employee ID *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your employee ID" 
                                {...field} 
                                className="font-mono h-8"
                                size={20}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Plan Selection */}
                    <FormField
                      control={form.control}
                      name="planId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VoIP Plan</FormLabel>
                          <Select onValueChange={handlePlanChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a VoIP plan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {plansLoading ? (
                                <SelectItem value="loading" disabled>Loading plans...</SelectItem>
                              ) : (
                                safeVoipPlans.map((plan: VoipPlan) => (
                                  <SelectItem key={plan.id} value={plan.id.toString()}>
                                    {plan.name} - ${plan.monthlyPrice}/month
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter customer name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="customer@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Customer contact number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional notes or instructions" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={activationMutation.isPending}
                    >
                      {activationMutation.isPending ? "Activating..." : "Activate VoIP Number"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Plan Details & Recent Activations */}
          <div className="space-y-6">
            {/* Selected Plan Details */}
            {selectedPlan && (
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Plan Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-blue-600">{selectedPlan.name}</h3>
                      <p className="text-2xl font-bold text-green-600">${selectedPlan.monthlyPrice}/month</p>
                    </div>
                    {selectedPlan.description && (
                      <p className="text-gray-600">{selectedPlan.description}</p>
                    )}
                    {selectedPlan.features && selectedPlan.features.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedPlan.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      Max Users: {selectedPlan.maxUsers}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activations */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activations</CardTitle>
              </CardHeader>
              <CardContent>
                {safeRecentActivations && safeRecentActivations.length > 0 ? (
                  <div className="space-y-3">
                    {safeRecentActivations.slice(0, 5).map((activation: any) => (
                      <div key={activation.id} className="border-l-4 border-blue-500 pl-3 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{activation.customerName}</p>
                            <p className="text-xs text-gray-500">{activation.voipNumber}</p>
                            <p className="text-xs text-gray-500">{activation.customerEmail}</p>
                          </div>
                          <Badge variant={activation.status === 'active' ? 'default' : 'secondary'}>
                            {activation.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recent activations</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}