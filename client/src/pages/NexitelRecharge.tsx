import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Smartphone, ArrowLeft, CreditCard, Zap } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Plan } from "@shared/schema";
import { NEXITEL_CARRIERS } from "@shared/nexitel-carriers";

const nexitelRechargeSchema = z.object({
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  carrier: z.enum(["nexitel-purple", "nexitel-blue"], { required_error: "Carrier is required" }),
  amount: z.number().min(5, "Minimum recharge amount is $5").max(500, "Maximum recharge amount is $500"),
});

type NexitelRechargeRequest = z.infer<typeof nexitelRechargeSchema>;

export default function NexitelRecharge() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Fetch Nexitel Recharge plans with commission pricing from database
  const { data: allPlans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: user?.role === "retailer" ? ["/api/retailer/plans"] : ["/api/plans"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  const getBackUrl = () => {
    if (user?.role === "retailer") {
      return "/retailer/dashboard";
    }
    return "/";
  };

  const handleBackNavigation = () => {
    if (user?.role === "retailer") {
      window.location.href = "/retailer/dashboard";
    } else if (user?.role === "employee") {
      window.location.href = "/employee/dashboard";
    } else if (user?.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/";
    }
  };

  const form = useForm<NexitelRechargeRequest>({
    resolver: zodResolver(nexitelRechargeSchema),
    defaultValues: {
      phoneNumber: "",
      carrier: undefined,
      amount: 0,
    },
  });

  const rechargeMutation = useMutation({
    mutationFn: async (data: NexitelRechargeRequest) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const serviceFee = (data.amount * 0.1).toFixed(2); // 10 service fee
      
      return apiRequest("/api/recharge/process", {
        method: "POST",
        body: {
          userId: user.id,
          phoneNumber: data.phoneNumber,
          country: "us", // Nexitel is US-based
          carrier: data.carrier,
          planPrice: data.amount.toString(),
          serviceFee: serviceFee,
          planId: null // Can be linked to specific Nexitel plans later
        }
      });
    },
    onSuccess: (result) => {
      toast({
        title: "Recharge Successful!",
        description: `Commission earned: $${result.commission}. New balance: $${result.newBalance}`,
        variant: "default",
      });
      
      // Reset form
      form.reset();
      
      // Refresh balance data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/user/${user?.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Recharge Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter for Nexitel Recharge plans based on selected carrier
  const selectedCarrierValue = form.watch('carrier');
  const nexitelRechargePlans = allPlans.filter(plan => 
    plan.serviceType === "nexitel_recharge" && 
    plan.carrier === selectedCarrierValue
  );

  const onSubmit = (data: NexitelRechargeRequest) => {
    rechargeMutation.mutate(data);
  };

  const selectedCarrier = NEXITEL_CARRIERS.find(c => c.value === form.watch("carrier"));

  // Add error boundary check
  if (plansLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Nexitel Recharge...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={handleBackNavigation}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {user?.role === "retailer" ? "Back to Dashboard" : user?.role === "admin" ? "Back to Dashboard" : user?.role === "employee" ? "Back to Dashboard" : "Back to Home"}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Smartphone className="w-8 h-8 text-purple-600 mr-3" />
            Nexitel Recharge
          </h1>
          <p className="text-gray-600 mt-2">Top up your Nexitel phone instantly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recharge Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 text-purple-600 mr-2" />
                  Recharge Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Phone Number */}
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Carrier Selection */}
                    <FormField
                      control={form.control}
                      name="carrier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nexitel Network</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your Nexitel network..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NEXITEL_CARRIERS.map((carrier) => (
                                <SelectItem key={carrier.value} value={carrier.value}>
                                  {carrier.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Plan Selection */}
                    <div>
                      <FormLabel className="text-sm font-medium text-gray-700 mb-3 block">
                        Select Recharge Plan
                      </FormLabel>
                      
                      {plansLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Loading plans...</p>
                        </div>
                      ) : !form.watch('carrier') ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Please select a Nexitel network first</p>
                          <p className="text-sm text-gray-400">Choose Purple or Blue network to see available plans</p>
                        </div>
                      ) : nexitelRechargePlans.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          {nexitelRechargePlans.map((plan) => (
                            <Button
                              key={plan.id}
                              type="button"
                              variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                              className={`h-auto p-4 flex flex-col items-start ${
                                selectedPlan?.id === plan.id 
                                  ? "bg-purple-600 hover:bg-purple-700 text-white" 
                                  : "hover:bg-purple-50"
                              }`}
                              onClick={() => {
                                setSelectedPlan(plan);
                                
                                // Calculate the correct price based on promotional pricing
                                let planPrice;
                                if (plan.isPromotional && plan.originalPrice && plan.discountPercentage) {
                                  // Use promotional price for promotional plans (both admin and retailer)
                                  const originalPrice = parseFloat(plan.originalPrice);
                                  const discount = parseFloat(plan.discountPercentage) / 100;
                                  planPrice = originalPrice * (1 - discount);
                                } else if (user?.role === "retailer") {
                                  // Use retailer price or fall back to our cost for non-promotional plans
                                  planPrice = parseFloat(plan.retailerPrice || plan.ourCost);
                                } else {
                                  // Admin sees our cost for non-promotional plans
                                  planPrice = parseFloat(plan.ourCost);
                                }
                                
                                setSelectedAmount(planPrice);
                                form.setValue("amount", planPrice);
                                form.setValue("carrier", plan.carrier as "nexitel-purple" | "nexitel-blue");
                              }}
                            >
                              <div className="flex justify-between items-start w-full">
                                <div className="text-left">
                                  <div className="font-semibold">{plan.name.replace(/-\$\d+/, '').replace(/\$\d+/, '').trim()}</div>
                                  <div className="text-sm opacity-75">
                                    {plan.durationMonths && plan.durationMonths > 1 ? `${plan.durationMonths} month plan` : '1 month plan'}
                                  </div>
                                  {plan.isPromotional && plan.promotionalLabel && (
                                    <div className="text-xs text-green-600 font-medium mt-1">🎉 {plan.promotionalLabel}</div>
                                  )}
                                  {plan.description && (
                                    <div className="text-xs opacity-60 mt-1">{plan.description}</div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="flex flex-col items-end">
                                    {plan.isPromotional && plan.originalPrice && (
                                      <div className="text-xs text-gray-500 line-through">
                                        ${parseFloat(plan.originalPrice).toFixed(2)}
                                      </div>
                                    )}
                                    <div className="font-bold">
                                      ${(() => {
                                        if (plan.isPromotional && plan.originalPrice && plan.discountPercentage) {
                                          // Show promotional price for promotional plans (both admin and retailer)
                                          const originalPrice = parseFloat(plan.originalPrice);
                                          const discount = parseFloat(plan.discountPercentage) / 100;
                                          return (originalPrice * (1 - discount)).toFixed(2);
                                        } else if (user?.role === "retailer") {
                                          // Use retailer price or fall back to our cost for non-promotional plans
                                          return (plan.retailerPrice ? parseFloat(plan.retailerPrice).toFixed(2) : parseFloat(plan.ourCost).toFixed(2));
                                        } else {
                                          // Admin sees our cost for non-promotional plans
                                          return parseFloat(plan.ourCost).toFixed(2);
                                        }
                                      })()}
                                    </div>
                                  </div>
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs mt-1 ${
                                      plan.carrier === "nexitel-purple" 
                                        ? "bg-purple-100 text-purple-800" 
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {plan.carrier === "nexitel-purple" ? "Purple" : "Blue"}
                                  </Badge>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No recharge plans available</p>
                          <p className="text-sm text-gray-400">Please contact admin to add recharge plans</p>
                        </div>
                      )}
                      
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recharge Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Amount will be set by selected plan..."
                                value={selectedAmount || field.value || ''}
                                disabled={true}
                                className="text-lg bg-gray-50"
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500 mt-1">Amount is determined by the selected plan</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
                      disabled={rechargeMutation.isPending}
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      {rechargeMutation.isPending ? "Processing..." : form.watch("amount") > 0 ? `Recharge $${form.watch("amount")}` : "Enter Amount to Recharge"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div>
            <Card className="bg-white shadow-lg mb-6">
              <CardHeader>
                <CardTitle>Recharge Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Phone Number:</span>
                    <span className="font-medium">
                      {form.watch("phoneNumber") || "Not entered"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Network:</span>
                    <div>
                      {selectedCarrier ? (
                        <Badge className={selectedCarrier.color}>
                          {selectedCarrier.label}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Not selected</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      ${form.watch("amount")}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-purple-600">${form.watch("amount")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Why Choose Nexitel?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-green-600">
                    <Zap className="w-4 h-4 mr-2" />
                    <span className="text-sm">Instant Top-up</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Zap className="w-4 h-4 mr-2" />
                    <span className="text-sm">24/7 Availability</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Zap className="w-4 h-4 mr-2" />
                    <span className="text-sm">Secure Payments</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Zap className="w-4 h-4 mr-2" />
                    <span className="text-sm">No Hidden Fees</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}