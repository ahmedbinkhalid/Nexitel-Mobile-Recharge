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
import { Smartphone, ArrowLeft, Zap } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Plan } from "@shared/schema";

const attRechargeSchema = z.object({
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  carrier: z.enum(["att-prepaid", "att-postpaid"], { required_error: "Carrier is required" }),
  amount: z.number().min(5, "Minimum recharge amount is $5").max(500, "Maximum recharge amount is $500"),
});

type ATTRechargeRequest = z.infer<typeof attRechargeSchema>;

const ATT_CARRIERS = [
  { value: "att-prepaid", label: "AT&T Prepaid" },
  { value: "att-postpaid", label: "AT&T Postpaid" },
];

export default function ATTRechargeSimple() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Fetch AT&T Recharge plans with commission pricing from database
  const { data: allPlans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: user?.role === "retailer" ? ["/api/retailer/plans"] : ["/api/plans"],
  });

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

  const form = useForm<ATTRechargeRequest>({
    resolver: zodResolver(attRechargeSchema),
    defaultValues: {
      phoneNumber: "",
      carrier: undefined,
      amount: 0,
    },
  });

  const rechargeMutation = useMutation({
    mutationFn: async (data: ATTRechargeRequest) => {
      return await apiRequest("/api/transactions", {
        method: "POST",
        body: {
          ...data,
          country: "United States",
          transactionType: "recharge",
          userId: user?.id,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/overview"] });
      toast({
        title: "AT&T Recharge Successful",
        description: `Recharge of $${form.getValues("amount")} has been processed successfully.`,
      });
      form.reset();
      setSelectedAmount(0);
    },
    onError: (error: any) => {
      toast({
        title: "Recharge Failed",
        description: error.message || "Failed to process AT&T recharge",
        variant: "destructive",
      });
    },
  });

  // Filter for AT&T Recharge plans based on selected carrier
  const selectedCarrierValue = form.watch('carrier');
  const attRechargePlans = allPlans ? allPlans.filter(plan => 
    plan.serviceType === "att" && 
    plan.carrier === selectedCarrierValue
  ) : [];

  const onSubmit = (data: ATTRechargeRequest) => {
    rechargeMutation.mutate(data);
  };

  const selectedCarrier = ATT_CARRIERS.find(c => c.value === form.watch("carrier"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={handleBackNavigation}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Smartphone className="w-8 h-8 text-orange-600 mr-3" />
            AT&T Recharge
          </h1>
          <p className="text-gray-600 mt-2">Top up your AT&T phone instantly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recharge Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 text-orange-600 mr-2" />
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
                            <Input 
                              placeholder="Enter AT&T phone number..." 
                              {...field}
                              className="text-lg"
                            />
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
                          <FormLabel>AT&T Service Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your AT&T service type..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ATT_CARRIERS.map((carrier) => (
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
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Loading plans...</p>
                        </div>
                      ) : !form.watch('carrier') ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Please select an AT&T carrier first</p>
                          <p className="text-sm text-gray-400">Choose Prepaid or Postpaid to see available plans</p>
                        </div>
                      ) : attRechargePlans.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {attRechargePlans.map((plan) => (
                            <Button
                              key={plan.id}
                              type="button"
                              variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                              className={`h-auto p-4 flex items-center justify-between w-full ${
                                selectedPlan?.id === plan.id 
                                  ? "bg-orange-600 hover:bg-orange-700 text-white" 
                                  : "hover:bg-orange-50"
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
                                form.setValue("carrier", plan.carrier as "att-prepaid" | "att-postpaid");
                              }}
                            >
                              <div className="flex-1 text-left pr-4">
                                <div className="font-semibold text-sm leading-tight">
                                  {plan.name.replace(/-\$\d+/, '').replace(/\$\d+/, '').trim()}
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                  {plan.durationMonths && plan.durationMonths > 1 ? `${plan.durationMonths} month plan` : '1 month plan'}
                                </div>
                                {plan.isPromotional && plan.promotionalLabel && (
                                  <div className="text-xs text-green-600 font-medium mt-1">🎉 {plan.promotionalLabel}</div>
                                )}
                                {plan.description && (
                                  <div className="text-xs opacity-60 mt-1 line-clamp-2">{plan.description}</div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex flex-col items-end">
                                  {plan.isPromotional && plan.originalPrice && (
                                    <div className="text-xs text-gray-500 line-through">
                                      ${parseFloat(plan.originalPrice).toFixed(2)}
                                    </div>
                                  )}
                                  <div className="font-bold text-lg">
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
                                  className={`text-xs whitespace-nowrap ${
                                    plan.carrier === "att-prepaid" 
                                      ? "bg-orange-100 text-orange-800" 
                                      : "bg-orange-200 text-orange-900"
                                  }`}
                                >
                                  {plan.carrier === "att-prepaid" ? "Prepaid" : "Postpaid"}
                                </Badge>
                              </div>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No AT&T recharge plans available</p>
                          <p className="text-sm text-gray-400">Please create AT&T recharge plans in Plan Management</p>
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
                                {...field}
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
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg"
                      disabled={rechargeMutation.isPending}
                    >
                      {rechargeMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        `Complete Recharge - $${form.watch("amount") || 0}`
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Recharge Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">
                      {form.watch("phoneNumber") || "Not entered"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Carrier:</span>
                    <span className="font-medium">
                      {selectedCarrier?.label || "Not selected"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan:</span>
                    <div className="text-right">
                      {selectedPlan ? (
                        <span className="font-medium">{selectedPlan.name.replace(/-\$\d+/, '').replace(/\$\d+/, '').trim()}</span>
                      ) : (
                        <span className="text-gray-400">Not selected</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-lg font-semibold text-orange-600">
                      ${form.watch("amount") || 0}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-orange-600">${form.watch("amount") || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Why Choose AT&T?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-green-600">
                    <Zap className="w-4 h-4 mr-2" />
                    <span className="text-sm">Instant Top-up</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Smartphone className="w-4 h-4 mr-2" />
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