import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { planManagementSchema, type PlanManagementRequest, type Plan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Plus, Edit, Trash2, DollarSign, Zap, Globe, Phone, ArrowLeft, BarChart3 } from "lucide-react";
import { COUNTRIES, getCarriers } from "@shared/countries";
import PlanPerformanceSparkline from "@/components/PlanPerformanceSparkline";

import { NEXITEL_CARRIERS } from "@shared/nexitel-carriers";

const PLAN_TYPES = [
  { value: "prepaid", label: "Prepaid" },
  { value: "data", label: "Data Only" },
  { value: "voice", label: "Voice Only" }, 
  { value: "unlimited", label: "Unlimited" },
];

const DURATION_OPTIONS = [
  { value: 1, label: "1 Month", color: "bg-green-100 text-green-800" },
  { value: 3, label: "3 Months", color: "bg-blue-100 text-blue-800" },
  { value: 6, label: "6 Months", color: "bg-purple-100 text-purple-800" },
  { value: 12, label: "12 Months", color: "bg-orange-100 text-orange-800" },
];

export default function ComprehensivePlanManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("nexitel");

  const form = useForm<PlanManagementRequest>({
    resolver: zodResolver(planManagementSchema),
    defaultValues: {
      name: "",
      carrier: "",
      country: "",
      denomination: "",
      ourCost: "0",
      serviceType: "nexitel",
      planType: "prepaid",
      description: "",
      durationMonths: 1,
      isPromotional: false,
      originalPrice: undefined,
      discountPercentage: undefined,
      promotionalLabel: "",
    },
  });

  // Fetch all plans
  const { data: plans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ["/api/plans"],
  });

  // Filter plans by service type
  const nexitelPlans = plans.filter(plan => plan.serviceType === "nexitel");
  const attPlans = plans.filter(plan => plan.serviceType === "att");
  const nexitelRechargePlans = plans.filter(plan => plan.serviceType === "nexitel_recharge");
  const attRechargePlans = plans.filter(plan => plan.serviceType === "att_recharge");
  const globalRechargePlans = plans.filter(plan => plan.serviceType === "global_recharge");
  const voipPlans = plans.filter(plan => plan.serviceType === "voip");

  // Create/Update plan mutation
  const planMutation = useMutation({
    mutationFn: async (data: PlanManagementRequest) => {
      console.log("MUTATION: Starting plan mutation with data:", data);
      const url = editingPlan ? `/api/plans/${editingPlan.id}` : "/api/plans";
      const method = editingPlan ? "PATCH" : "POST";
      console.log(`MUTATION: Making ${method} request to ${url}`);
      
      try {
        const result = await apiRequest(url, { method, body: data });
        console.log("MUTATION: API request successful:", result);
        return result;
      } catch (error) {
        console.error("MUTATION: API request failed:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: editingPlan ? "Plan updated" : "Plan created",
        description: `Plan ${editingPlan ? "updated" : "created"} successfully`,
      });
      resetForm();
    },
    onError: (error: any) => {
      console.error("Plan mutation error:", error);
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        response: error?.response,
        stack: error?.stack
      });
      
      // Show more specific error in toast
      let errorMessage = "Failed to save plan";
      if (typeof error.message === 'string') {
        if (error.message.includes('401')) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (error.message.includes('400')) {
          errorMessage = "Invalid form data. Please check all fields.";
        } else if (error.message.includes('500')) {
          errorMessage = "Server error. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Delete plan mutation
  const deleteMutation = useMutation({
    mutationFn: async (planId: number) => {
      return await apiRequest(`/api/plans/${planId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: "Plan deleted",
        description: "Plan deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    form.reset();
    setEditingPlan(null);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      carrier: plan.carrier,
      country: plan.country || "United States",
      denomination: plan.denomination,
      ourCost: plan.ourCost,
      serviceType: plan.serviceType as "nexitel" | "nexitel_recharge" | "att" | "att_recharge" | "global_recharge" | "voip",
      planType: plan.planType as "prepaid" | "data" | "voice" | "unlimited",
      description: plan.description || "",
      durationMonths: plan.durationMonths || 1,
      isPromotional: plan.isPromotional || false,
      originalPrice: plan.originalPrice || undefined,
      discountPercentage: plan.discountPercentage || undefined,
      promotionalLabel: plan.promotionalLabel || "",
    });
    setActiveTab(plan.serviceType === "nexitel_recharge" ? "nexitel-recharge" : 
                plan.serviceType === "att_recharge" ? "att-recharge" : 
                plan.serviceType);
  };

  const handleDelete = (planId: number) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      deleteMutation.mutate(planId);
    }
  };

  const onSubmit = (data: PlanManagementRequest) => {
    // Auto-set country based on service type if not provided
    const submissionData = {
      ...data,
      country: data.serviceType === "nexitel" ? "United States" : 
               data.serviceType === "nexitel_recharge" ? "United States" :
               data.serviceType === "att" ? "United States" :
               data.serviceType === "att_recharge" ? "United States" :
               data.serviceType === "voip" ? "United States" : 
               data.country || "United States"
    };
    
    console.log("Form submitted with data:", data);
    console.log("Processed submission data:", submissionData);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    
    planMutation.mutate(submissionData);
  };

  // Our cost for reference
  const ourCost = form.watch("ourCost") || 0;

  const PlanTable = ({ plans, serviceType }: { plans: Plan[], serviceType: string }) => {
    const isRechargeService = serviceType === "nexitel_recharge" || serviceType === "att_recharge";
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {serviceType === "nexitel" && "Nexitel Activation Plans"}
            {serviceType === "att" && "AT&T Activation Plans"}
            {serviceType === "nexitel_recharge" && "Nexitel Recharge Plans"}
            {serviceType === "att_recharge" && "AT&T Recharge Plans"}
            {serviceType === "global_recharge" && "Global Recharge Plans"}
            {serviceType === "voip" && "VoIP Plans"}
          </h3>
          {isRechargeService && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              No retailer commission - direct service pricing
            </div>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Denomination</TableHead>
              <TableHead>Duration</TableHead>
              {!isRechargeService && <TableHead>Retailer Price</TableHead>}
              <TableHead>Service Cost</TableHead>
              {!isRechargeService && <TableHead>Profit</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {plans.map((plan) => {
            const durationOption = DURATION_OPTIONS.find(d => d.value === (plan.durationMonths || 1));
            return (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{plan.name}</div>
                    {plan.isPromotional && plan.promotionalLabel && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs mt-1">
                        {plan.promotionalLabel}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{plan.carrier}</TableCell>
                <TableCell>
                  <div>
                    <div>{plan.denomination}</div>
                    {plan.isPromotional && plan.originalPrice && (
                      <div className="text-xs text-gray-500">
                        <span className="line-through">${plan.originalPrice}</span>
                        {plan.discountPercentage && (
                          <span className="text-green-600 ml-1">
                            ({plan.discountPercentage}% off)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={durationOption?.color || "bg-gray-100 text-gray-800"}>
                    {durationOption?.label || `${plan.durationMonths || 1} Month${(plan.durationMonths || 1) > 1 ? 's' : ''}`}
                  </Badge>
                </TableCell>
                {!isRechargeService && (
                  <TableCell className="text-green-600 font-semibold">${plan.retailerPrice}</TableCell>
                )}
                <TableCell className="text-red-600 font-semibold">${plan.ourCost}</TableCell>
                {!isRechargeService && (
                  <TableCell className="text-blue-600 font-semibold">${plan.profit}</TableCell>
                )}
                <TableCell>
                  <Badge variant="outline">{plan.planType}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <Badge variant={plan.isActive ? "default" : "destructive"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {plan.isPromotional && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                        Promo
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => window.location.href = "/admin"}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Plan Management</h1>
          <p className="text-gray-600">Manage pricing for all services with automatic profit calculation</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add/Edit Plan Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {editingPlan ? (
                  <>
                    <Edit className="w-5 h-5 text-blue-600 mr-2" />
                    Edit Plan
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-green-600 mr-2" />
                    Create New Plan
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={(e) => {
                  console.log("Form onSubmit triggered");
                  form.handleSubmit(onSubmit)(e);
                }} className="space-y-4">
                  {/* Service Type */}
                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nexitel">
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-purple-600" />
                                Nexitel Activation
                              </div>
                            </SelectItem>
                            <SelectItem value="nexitel_recharge">
                              <div className="flex items-center">
                                <Zap className="w-4 h-4 mr-2 text-blue-600" />
                                Nexitel Recharge
                              </div>
                            </SelectItem>
                            <SelectItem value="att">
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-red-600" />
                                AT&T Activation
                              </div>
                            </SelectItem>
                            <SelectItem value="att_recharge">
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-2 text-orange-600" />
                                AT&T Recharge
                              </div>
                            </SelectItem>
                            <SelectItem value="global_recharge">
                              <div className="flex items-center">
                                <Globe className="w-4 h-4 mr-2 text-green-600" />
                                Global Recharge
                              </div>
                            </SelectItem>
                            <SelectItem value="voip">
                              <div className="flex items-center">
                                <Zap className="w-4 h-4 mr-2 text-gray-600" />
                                VoIP Services
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Plan Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Unlimited 30, Prepaid 25" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Carrier Selection - Show Nexitel options for Nexitel services */}
                  {(form.watch("serviceType") === "nexitel" || form.watch("serviceType") === "nexitel_recharge") && (
                    <FormField
                      control={form.control}
                      name="carrier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nexitel Network</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Nexitel carrier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NEXITEL_CARRIERS.map((carrier) => (
                                <SelectItem key={carrier.value} value={carrier.value}>
                                  <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${carrier.color.split(' ')[0]}`}></div>
                                    {carrier.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Carrier Selection - Show AT&T options for AT&T services */}
                  {(form.watch("serviceType") === "att" || form.watch("serviceType") === "att_recharge") && (
                    <FormField
                      control={form.control}
                      name="carrier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AT&T Service Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select AT&T service type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="att-prepaid">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full mr-2 bg-orange-600"></div>
                                  AT&T Prepaid
                                </div>
                              </SelectItem>
                              <SelectItem value="att-postpaid">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full mr-2 bg-orange-400"></div>
                                  AT&T Postpaid
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Auto-set country for recharge services */}
                  {(form.watch("serviceType") === "nexitel_recharge" || form.watch("serviceType") === "att_recharge") && (
                    <input type="hidden" {...form.register("country")} value="United States" />
                  )}

                  {/* Country Selection for Global Recharge */}
                  {form.watch("serviceType") === "global_recharge" && (
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter country name (e.g., Canada, Mexico, Brazil)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Carrier Selection for Global Recharge */}
                  {form.watch("serviceType") === "global_recharge" && (
                    <FormField
                      control={form.control}
                      name="carrier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Carrier</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter carrier name (e.g., Rogers, Telcel, Claro)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Plan Type */}
                  <FormField
                    control={form.control}
                    name="planType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select plan type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PLAN_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Denomination */}
                  <FormField
                    control={form.control}
                    name="denomination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Denomination</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., $30, $40, $50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pricing Fields - Different for Recharge vs Activation */}
                  {(form.watch("serviceType") === "nexitel_recharge" || form.watch("serviceType") === "att_recharge") ? (
                    <div className="space-y-4">
                      {/* Our Cost for Recharge Plans */}
                      <FormField
                        control={form.control}
                        name="ourCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Our Cost ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Service Cost (Customer Price) for Recharge Plans */}
                      <FormField
                        control={form.control}
                        name="denomination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Cost - Customer Price ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    // Our Cost for Activation Plans
                    <FormField
                      control={form.control}
                      name="ourCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Our Cost ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Pricing Note for Activation Plans */}
                  {form.watch("serviceType") !== "nexitel_recharge" && form.watch("serviceType") !== "att_recharge" && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-start">
                        <div className="w-4 h-4 text-blue-600 mt-0.5 mr-2">ℹ️</div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">Retailer Pricing</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Retailer prices are set in Commission Management for each commission group. 
                            This allows different pricing tiers for different retailer categories.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Commission Groups for Activation Plans */}
                  {(form.watch("serviceType") === "nexitel" || form.watch("serviceType") === "att") && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-start">
                          <div className="w-4 h-4 text-blue-600 mt-0.5 mr-2">👥</div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Commission Groups for Activation Plans</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Set different pricing for different retailer groups. Create commission groups in Commission Management.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Commission Groups for Recharge Plans */}
                  {(form.watch("serviceType") === "nexitel_recharge" || form.watch("serviceType") === "att_recharge") && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-start">
                          <div className="w-4 h-4 text-blue-600 mt-0.5 mr-2">👥</div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Commission Groups for Recharge Plans</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Assign commission groups to give different retailers different pricing on this recharge plan.
                              Use Commission Management to set up retailer-specific prices.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="flex items-start">
                          <div className="w-4 h-4 text-orange-600 mt-0.5 mr-2">💰</div>
                          <div>
                            <p className="text-sm font-medium text-orange-900">Base Recharge Pricing</p>
                            <p className="text-xs text-orange-700 mt-1">
                              This is the base pricing that applies when no commission group overrides are set.
                            </p>
                            <div className="bg-white p-2 rounded border border-orange-200 mt-2">
                              <div className="text-sm text-orange-800 space-y-1">
                                {(() => {
                                  const ourCostValue = form.watch("ourCost");
                                  const denominationValue = form.watch("denomination");
                                  
                                  const ourCost = typeof ourCostValue === 'number' ? ourCostValue : parseFloat(String(ourCostValue || "0"));
                                  const customerPrice = typeof denominationValue === 'number' ? denominationValue : parseFloat(String(denominationValue || "0"));
                                  const profit = Math.max(0, customerPrice - ourCost);
                                  
                                  return (
                                    <>
                                      <div><strong>Our Cost:</strong> ${ourCost.toFixed(2)}</div>
                                      <div><strong>Customer Price:</strong> ${customerPrice.toFixed(2)}</div>
                                      <div className="text-green-600 font-medium">
                                        <strong>Profit:</strong> ${profit.toFixed(2)}
                                        {customerPrice > 0 && (
                                          <span className="text-xs ml-1">
                                            ({Math.round((profit / customerPrice) * 100)}% margin)
                                          </span>
                                        )}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Duration (Multi-month Plans) */}
                  <FormField
                    control={form.control}
                    name="durationMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Duration</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DURATION_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                <div className="flex items-center">
                                  <Badge variant="outline" className={option.color}>
                                    {option.label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Promotional Pricing Toggle */}
                  <FormField
                    control={form.control}
                    name="isPromotional"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Promotional Pricing</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Enable discounted pricing for this plan
                          </div>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Promotional Fields (shown when promotional is enabled) */}
                  {form.watch("isPromotional") && (
                    <div className="space-y-4 border-l-4 border-orange-200 pl-4 bg-orange-50 p-3 rounded-r-lg">
                      <h4 className="text-sm font-medium text-orange-800">Promotional Details</h4>
                      
                      {/* Original Price */}
                      <FormField
                        control={form.control}
                        name="originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Price ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="60.00 (e.g., 3 months @ $20 each)"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Discount Percentage */}
                      <FormField
                        control={form.control}
                        name="discountPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Percentage (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                min="0"
                                max="100"
                                placeholder="16.67 (customer saves $10)"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Promotional Label */}
                      <FormField
                        control={form.control}
                        name="promotionalLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Promotional Label</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Save $10 on 3-month plan!"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Pricing Preview */}
                      {form.watch("originalPrice") && form.watch("discountPercentage") && (
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="text-sm font-medium text-gray-800">Pricing Preview:</div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-gray-600">Original Price:</span>
                            <span className="line-through text-red-600">${form.watch("originalPrice")}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Sale Price:</span>
                            <span className="text-green-600 font-semibold">
                              ${((parseFloat(form.watch("originalPrice") || "0")) * (1 - (parseFloat(form.watch("discountPercentage") || "0")) / 100)).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Customer Saves:</span>
                            <span className="text-blue-600 font-semibold">
                              ${((parseFloat(form.watch("originalPrice") || "0")) * (parseFloat(form.watch("discountPercentage") || "0")) / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Plan features, data allowance, etc." 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Buttons */}
                  <div className="flex space-x-2 pt-4">
                    <Button
                      type="button"
                      disabled={planMutation.isPending}
                      className="flex-1"
                      onClick={(e) => {
                        try {
                          console.log("=== CREATE PLAN BUTTON CLICKED ===");
                          
                          // Get current form values
                          const formValues = form.getValues();
                          console.log("Form values:", formValues);
                          
                          // Create submission data with auto-country logic
                          const submissionData = {
                            ...formValues,
                            country: formValues.serviceType === "nexitel" ? "United States" : 
                                   formValues.serviceType === "nexitel_recharge" ? "United States" :
                                   formValues.serviceType === "att" ? "United States" :
                                   formValues.serviceType === "att_recharge" ? "United States" :
                                   formValues.serviceType === "voip" ? "United States" : 
                                   formValues.country || "United States"
                          };
                          
                          console.log("Submission data:", submissionData);
                          console.log("Calling planMutation.mutate...");
                          
                          // Direct mutation call
                          planMutation.mutate(submissionData);
                          
                        } catch (error) {
                          console.error("Button click error:", error);
                          const errorMessage = error instanceof Error ? error.message : String(error);
                          alert("Button click error: " + errorMessage);
                        }
                      }}
                    >
                      {planMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingPlan ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          {editingPlan ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                          {editingPlan ? "Update Plan" : "Create Plan"}
                        </>
                      )}
                    </Button>
                    
                    {editingPlan && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Plans Overview */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="nexitel" className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Nexitel</span> ({nexitelPlans.length})
                </TabsTrigger>
                <TabsTrigger value="att" className="flex items-center">
                  <Phone className="w-4 h-4 mr-1 text-red-600" />
                  <span className="hidden sm:inline">AT&T</span> ({attPlans.length})
                </TabsTrigger>
                <TabsTrigger value="nexitel_recharge" className="flex items-center">
                  <Zap className="w-4 h-4 mr-1 text-blue-600" />
                  <span className="hidden sm:inline">N-Recharge</span> ({nexitelRechargePlans.length})
                </TabsTrigger>
                <TabsTrigger value="att_recharge" className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-orange-600" />
                  <span className="hidden sm:inline">AT&T-R</span> ({attRechargePlans.length})
                </TabsTrigger>
                <TabsTrigger value="global_recharge" className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Global</span> ({globalRechargePlans.length})
                </TabsTrigger>
                <TabsTrigger value="voip" className="flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">VoIP</span> ({voipPlans.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="nexitel" className="mt-6">
                <PlanTable plans={nexitelPlans} serviceType="nexitel" />
              </TabsContent>

              <TabsContent value="att" className="mt-6">
                <PlanTable plans={attPlans} serviceType="att" />
              </TabsContent>

              <TabsContent value="nexitel_recharge" className="mt-6">
                <PlanTable plans={nexitelRechargePlans} serviceType="nexitel_recharge" />
              </TabsContent>

              <TabsContent value="att_recharge" className="mt-6">
                <PlanTable plans={attRechargePlans} serviceType="att_recharge" />
              </TabsContent>

              <TabsContent value="global_recharge" className="mt-6">
                <PlanTable plans={globalRechargePlans} serviceType="global_recharge" />
              </TabsContent>

              <TabsContent value="voip" className="mt-6">
                <PlanTable plans={voipPlans} serviceType="voip" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}