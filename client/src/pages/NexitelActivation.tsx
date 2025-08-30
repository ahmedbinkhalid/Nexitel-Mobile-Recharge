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
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Zap, ArrowLeft, User, Phone, CreditCard, Check, Wifi, MapPin, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useEmployeeVerification } from "@/hooks/useEmployeeVerification";
import { EmployeeVerificationDialog } from "@/components/EmployeeVerificationDialog";
import { CustomerReceipt } from "@/components/CustomerReceipt";
import { US_STATES, DEVICE_TYPES, US_CARRIERS, handleBackNavigation } from "@shared/constants";

// Create base schema without employeeId
const baseNexitelActivationSchema = z.object({
  iccid: z.string().min(19, "ICCID must be at least 19 digits").max(22, "ICCID must be at most 22 digits"),
  simType: z.enum(["physical", "esim"], { required_error: "SIM type is required" }),
  nexitelNetwork: z.enum(["nexitel-purple", "nexitel-blue"], { required_error: "Nexitel network is required" }),
  plan: z.string().min(1, "Plan selection is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
  email: z.string().email("Valid email is required"),
  portNumber: z.boolean().optional(),
  existingPhoneNumber: z.string().optional(),
  accountNumber: z.string().optional(),
  pinNumber: z.string().optional(),
  portingZipCode: z.string().optional(),
  // WiFi Calling fields
  enableWifiCalling: z.boolean().optional(),
  useDifferentEmergencyAddress: z.boolean().optional(),
  emergencyAddress: z.string().optional(),
  emergencyCity: z.string().optional(),
  emergencyState: z.string().optional(),
  emergencyZipCode: z.string().optional(),
  employeeId: z.string().optional(),
}).refine((data) => {
  // If WiFi calling is enabled and user wants different emergency address, all emergency fields are required
  if (data.enableWifiCalling && data.useDifferentEmergencyAddress) {
    return data.emergencyAddress && data.emergencyCity && data.emergencyState && data.emergencyZipCode;
  }
  return true;
}, {
  message: "All emergency address fields are required when using different address for WiFi calling",
  path: ["emergencyAddress"]
});

// Create schema with conditional employeeId requirement based on user role
const createNexitelActivationSchema = (userRole: string) => {
  const baseSchema = z.object({
    iccid: z.string().min(19, "ICCID must be at least 19 digits").max(22, "ICCID must be at most 22 digits"),
    simType: z.enum(["physical", "esim"], { required_error: "SIM type is required" }),
    nexitelNetwork: z.enum(["nexitel-purple", "nexitel-blue"], { required_error: "Nexitel network is required" }),
    plan: z.string().min(1, "Plan selection is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    address: z.string().min(1, "Address is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "Valid ZIP code is required"),
    email: z.string().email("Valid email is required"),
    portNumber: z.boolean().optional(),
    existingPhoneNumber: z.string().optional(),
    accountNumber: z.string().optional(),
    pinNumber: z.string().optional(),
    portingZipCode: z.string().optional(),
    // WiFi Calling fields
    enableWifiCalling: z.boolean().optional(),
    useDifferentEmergencyAddress: z.boolean().optional(),
    emergencyAddress: z.string().optional(),
    emergencyCity: z.string().optional(),
    emergencyState: z.string().optional(),
    emergencyZipCode: z.string().optional(),
    employeeId: userRole === 'admin' ? z.string().min(1, "Employee ID is required") : z.string().optional(),
  });

  return baseSchema.refine((data) => {
    // If WiFi calling is enabled and user wants different emergency address, all emergency fields are required
    if (data.enableWifiCalling && data.useDifferentEmergencyAddress) {
      return data.emergencyAddress && data.emergencyCity && data.emergencyState && data.emergencyZipCode;
    }
    return true;
  }, {
    message: "All emergency address fields are required when using different address for WiFi calling",
    path: ["emergencyAddress"]
  });
};

const nexitelActivationSchema = baseNexitelActivationSchema;

type NexitelActivationRequest = z.infer<typeof nexitelActivationSchema>;

// Plans are now fetched from API instead of hardcoded
// Constants moved to shared/constants.ts



export default function NexitelActivation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [wantPorting, setWantPorting] = useState<boolean>(false);
  const [enableWifiCalling, setEnableWifiCalling] = useState<boolean>(false);
  const [useDifferentEmergencyAddress, setUseDifferentEmergencyAddress] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [activationData, setActivationData] = useState<any>(null);

  // Fetch Nexitel plans from API
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/plans", "nexitel"],
    queryFn: () => apiRequest("/api/plans?serviceType=nexitel"),
  });

  // Employee verification hook
  const employeeVerification = useEmployeeVerification({
    operationType: "nexitel_activation",
    operationDetails: "Processing Nexitel activation with customer information and plan details"
  });

  const handleBackNavigationClick = () => {
    handleBackNavigation(user?.role);
  };

  const form = useForm<NexitelActivationRequest>({
    resolver: zodResolver(createNexitelActivationSchema(user?.role || 'retailer')),
    defaultValues: {
      iccid: "",
      simType: undefined,
      nexitelNetwork: undefined,
      plan: "",
      firstName: "",
      lastName: "",
      address: "",
      state: "",
      zipCode: "",
      email: "",
      portNumber: false,
      existingPhoneNumber: "",
      accountNumber: "",
      pinNumber: "",
      portingZipCode: "",
      enableWifiCalling: false,
      useDifferentEmergencyAddress: false,
      emergencyAddress: "",
      emergencyCity: "",
      emergencyState: "",
      emergencyZipCode: "",
      employeeId: "",
    },
  });

  // Activation mutation
  const activationMutation = useMutation({
    mutationFn: async (data: NexitelActivationRequest) => {
      // First, submit the main activation
      const activationResponse = await apiRequest('/api/nexitel/activate', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // If WiFi calling is enabled, activate it
      if (data.enableWifiCalling) {
        const emergencyAddress = data.useDifferentEmergencyAddress
          ? {
              street: data.emergencyAddress!,
              city: data.emergencyCity!,
              state: data.emergencyState!,
              zipCode: data.emergencyZipCode!,
            }
          : {
              street: data.address,
              city: "", // Extract from address if needed
              state: data.state,
              zipCode: data.zipCode,
            };

        const wifiCallingRequest = {
          iccid: data.iccid,
          customerName: `${data.firstName} ${data.lastName}`,
          phoneNumber: "", // Will be assigned after activation
          emergencyAddress: emergencyAddress,
        };

        await apiRequest('/api/nexitel/wifi-calling/enable', {
          method: 'POST',
          body: JSON.stringify(wifiCallingRequest),
        });
      }

      return activationResponse;
    },
    onSuccess: (data, variables) => {
      const selectedPlanDetails = plans.find((p: any) => p.id === parseInt(variables.plan));
      
      // Prepare receipt data
      const receiptData = {
        id: `ACT-${Date.now()}`,
        customerName: `${variables.firstName} ${variables.lastName}`,
        phoneNumber: data.phoneNumber || "To be assigned",
        iccid: variables.iccid,
        planName: selectedPlanDetails?.name || "Selected Plan",
        planPrice: selectedPlanDetails?.denomination?.toString().startsWith('$') 
          ? selectedPlanDetails.denomination 
          : `$${selectedPlanDetails?.denomination}`,
        carrier: variables.nexitelNetwork,
        activationDate: new Date().toLocaleDateString(),
        retailerName: user?.username || "System",
        address: variables.address,
        city: "", // Could be extracted from address if needed
        state: variables.state,
        zipCode: variables.zipCode,
      };
      
      setActivationData(receiptData);
      setShowReceipt(true);
      
      toast({
        title: "Activation Successful",
        description: `Nexitel activation completed${enableWifiCalling ? ' with WiFi Calling enabled' : ''}`,
      });
    },
    onError: (error: any) => {
      console.error("Activation error:", error);
      toast({
        title: "Activation Failed",
        description: error.message || "Failed to complete Nexitel activation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NexitelActivationRequest) => {
    // Address validation for WiFi Calling
    if (data.enableWifiCalling) {
      if (data.useDifferentEmergencyAddress) {
        if (!data.emergencyAddress || !data.emergencyCity || !data.emergencyState || !data.emergencyZipCode) {
          toast({
            title: "Emergency Address Required",
            description: "Please provide a complete emergency address for WiFi calling activation",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Validate that activation address is complete
        if (!data.address || !data.state || !data.zipCode) {
          toast({
            title: "Address Required",
            description: "A valid address is required for WiFi calling activation",
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Use employee verification only for admin users
    if (user?.role === 'admin') {
      employeeVerification.requireEmployeeVerification(() => {
        activationMutation.mutate(data);
      });
    } else {
      // For retailers, submit directly without employee verification
      activationMutation.mutate(data);
    }
  };

  const selectedPlanDetails = plans.find((plan: any) => plan.id.toString() === selectedPlan);

  // Print function for customer receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  // Close receipt and reset form
  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setActivationData(null);
    
    // Reset form after receipt is closed
    form.reset();
    setSelectedPlan("");
    setWantPorting(false);
    setEnableWifiCalling(false);
    setUseDifferentEmergencyAddress(false);
  };

  if (!user) {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={handleBackNavigationClick}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {user?.role === "retailer" ? "Back to Dashboard" : "Back to Home"}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Zap className="w-8 h-8 text-blue-600 mr-3" />
            Nexitel Activation
          </h1>
          <p className="text-gray-600 mt-2">Activate your new Nexitel wireless service</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activation Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 text-blue-600 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Employee Verification Required - Only for admin users */}
                    {user?.role === 'admin' ? (
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
                    ) : null}

                    {/* ICCID and SIM Information */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Phone className="w-5 h-5 text-blue-600 mr-2" />
                        SIM Card Information
                      </h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="iccid"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ICCID Number</FormLabel>
                              <FormControl>
                                <Input placeholder="89014103211118510720" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="simType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SIM Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select SIM type..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="physical">Physical SIM</SelectItem>
                                    <SelectItem value="esim">eSIM</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="nexitelNetwork"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nexitel Network</FormLabel>
                                <Select onValueChange={(value) => {
                                  field.onChange(value);
                                  // Clear plan selection when network changes
                                  form.setValue('plan', '');
                                  setSelectedPlan('');
                                }} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select network..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="nexitel-purple">Nexitel Purple</SelectItem>
                                    <SelectItem value="nexitel-blue">Nexitel Blue</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Plan Selection */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                        Plan Selection
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="plan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Plan</FormLabel>
                            <Select onValueChange={(value) => { field.onChange(value); setSelectedPlan(value); }} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a plan..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {plansLoading ? (
                                  <SelectItem value="loading" disabled>Loading plans...</SelectItem>
                                ) : !form.watch('nexitelNetwork') ? (
                                  <SelectItem value="no-network" disabled>Please select Nexitel network first</SelectItem>
                                ) : (() => {
                                  const filteredPlans = plans.filter((plan: any) => 
                                    plan.carrier === form.watch('nexitelNetwork')
                                  );
                                  return filteredPlans.length === 0 ? (
                                    <SelectItem value="no-plans" disabled>No plans available for selected network</SelectItem>
                                  ) : (
                                    filteredPlans.map((plan: any) => (
                                      <SelectItem key={plan.id} value={plan.id.toString()}>
                                        {plan.name.replace(/-\$\d+/, '').replace(/\$\d+/, '').trim()} - ${plan.denomination.replace('$', '')} ({plan.durationMonths && plan.durationMonths > 1 ? `${plan.durationMonths} months` : '1 month'})
                                      </SelectItem>
                                    ))
                                  );
                                })()}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Customer Information */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 text-blue-600 mr-2" />
                        Customer Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main Street" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select state..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {US_STATES.map((state) => (
                                      <SelectItem key={state} value={state}>
                                        {state}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="12345" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="john.doe@email.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* WiFi Calling Section */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Wifi className="w-5 h-5 text-blue-600 mr-2" />
                        WiFi Calling (Optional)
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="enableWifiCalling"
                            checked={enableWifiCalling}
                            onCheckedChange={(checked) => {
                              setEnableWifiCalling(!!checked);
                              form.setValue("enableWifiCalling", !!checked);
                              if (!checked) {
                                // Reset emergency address options if WiFi calling is disabled
                                setUseDifferentEmergencyAddress(false);
                                form.setValue("useDifferentEmergencyAddress", false);
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <label htmlFor="enableWifiCalling" className="text-sm font-medium text-gray-700">
                            Enable WiFi Calling for this activation
                          </label>
                        </div>
                        
                        {enableWifiCalling && (
                          <div className="ml-6 space-y-4 p-4 bg-blue-50 rounded-lg border">
                            <div className="flex items-start space-x-3">
                              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900 mb-2">
                                  Emergency Address Required for WiFi Calling
                                </p>
                                <p className="text-xs text-blue-700 mb-3">
                                  WiFi calling requires a valid emergency address for E911 services. By default, we'll use the activation address you provided above.
                                </p>
                                
                                <div className="flex items-center space-x-3 mb-4">
                                  <Checkbox
                                    id="useDifferentEmergencyAddress"
                                    checked={useDifferentEmergencyAddress}
                                    onCheckedChange={(checked) => {
                                      setUseDifferentEmergencyAddress(!!checked);
                                      form.setValue("useDifferentEmergencyAddress", !!checked);
                                    }}
                                    className="h-4 w-4"
                                  />
                                  <label htmlFor="useDifferentEmergencyAddress" className="text-sm text-blue-800">
                                    Use a different emergency address
                                  </label>
                                </div>

                                {useDifferentEmergencyAddress && (
                                  <div className="space-y-4 p-3 bg-white rounded border border-blue-200">
                                    <p className="text-xs font-medium text-gray-700 mb-2">
                                      Emergency Address (All fields required)
                                    </p>
                                    
                                    <FormField
                                      control={form.control}
                                      name="emergencyAddress"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs">Street Address</FormLabel>
                                          <FormControl>
                                            <Input placeholder="123 Emergency Street" {...field} className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <div className="grid grid-cols-3 gap-3">
                                      <FormField
                                        control={form.control}
                                        name="emergencyCity"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-xs">City</FormLabel>
                                            <FormControl>
                                              <Input placeholder="City" {...field} className="text-sm" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="emergencyState"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-xs">State</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                              <FormControl>
                                                <SelectTrigger className="text-sm">
                                                  <SelectValue placeholder="State" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {US_STATES.map((state) => (
                                                  <SelectItem key={state} value={state}>
                                                    {state}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="emergencyZipCode"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-xs">ZIP Code</FormLabel>
                                            <FormControl>
                                              <Input placeholder="12345" {...field} className="text-sm" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </div>
                                )}

                                {!useDifferentEmergencyAddress && (
                                  <div className="p-3 bg-green-50 rounded border border-green-200">
                                    <div className="flex items-center">
                                      <Check className="w-4 h-4 text-green-600 mr-2" />
                                      <p className="text-sm text-green-800">
                                        Using activation address as emergency address
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Number Porting */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Number Porting (Optional)
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="portNumber"
                            checked={wantPorting}
                            onChange={(e) => {
                              setWantPorting(e.target.checked);
                              form.setValue("portNumber", e.target.checked);
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <label htmlFor="portNumber" className="text-sm text-gray-700">
                            I want to keep my existing phone number
                          </label>
                        </div>

                        {wantPorting && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="existingPhoneNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Current Phone Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="+1 (555) 123-4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="accountNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Account Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Account number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="pinNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>PIN Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="PIN" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="portingZipCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Billing ZIP Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="12345" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 pb-8">
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                        disabled={activationMutation.isPending}
                      >
                        {activationMutation.isPending ? (
                          <>Processing Activation...</>
                        ) : (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            Complete Activation
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Plan Details Sidebar */}
          <div>
            {selectedPlanDetails && (
              <Card className="bg-white shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-center">
                    {selectedPlanDetails.name}
                  </CardTitle>
                  <div className="text-center">
                    {selectedPlanDetails.isPromotional && selectedPlanDetails.originalPrice ? (
                      <div>
                        <span className="text-3xl font-bold text-green-600">
                          {selectedPlanDetails.denomination.toString().startsWith('$') ? selectedPlanDetails.denomination : `$${selectedPlanDetails.denomination}`}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="line-through">${selectedPlanDetails.originalPrice}</span>
                          {selectedPlanDetails.discountPercentage && (
                            <span className="text-green-600 ml-2">Save {selectedPlanDetails.discountPercentage}%!</span>
                          )}
                        </div>
                        {selectedPlanDetails.durationMonths && selectedPlanDetails.durationMonths > 1 && (
                          <div className="text-sm text-gray-600 mt-1">
                            {selectedPlanDetails.durationMonths} month plan
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-blue-600">
                          {selectedPlanDetails.denomination.toString().startsWith('$') ? selectedPlanDetails.denomination : `$${selectedPlanDetails.denomination}`}
                        </span>
                        {selectedPlanDetails.durationMonths && selectedPlanDetails.durationMonths > 1 ? (
                          <span className="text-gray-600">/{selectedPlanDetails.durationMonths} months</span>
                        ) : (
                          <span className="text-gray-600">/month</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Carrier:</span>
                      <Badge variant="secondary">{selectedPlanDetails.carrier}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Type:</span>
                      <Badge variant="secondary">{selectedPlanDetails.planType}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Duration:</span>
                      <Badge variant="outline" className={
                        selectedPlanDetails.durationMonths === 1 ? "bg-gray-100 text-gray-800" :
                        selectedPlanDetails.durationMonths === 3 ? "bg-blue-100 text-blue-800" :
                        selectedPlanDetails.durationMonths === 6 ? "bg-purple-100 text-purple-800" :
                        selectedPlanDetails.durationMonths === 12 ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }>
                        {selectedPlanDetails.durationMonths || 1} Month{(selectedPlanDetails.durationMonths || 1) > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Customer Price:</span>
                      <div className="flex flex-col items-end">
                        {selectedPlanDetails.isPromotional && selectedPlanDetails.originalPrice ? (
                          <>
                            <Badge variant="secondary" className="text-green-600">
                              {selectedPlanDetails.denomination.toString().startsWith('$') ? selectedPlanDetails.denomination : `$${selectedPlanDetails.denomination}`}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="line-through">${selectedPlanDetails.originalPrice}</span>
                              {selectedPlanDetails.discountPercentage && (
                                <span className="text-green-600 ml-1">({selectedPlanDetails.discountPercentage}% off)</span>
                              )}
                            </div>
                            {selectedPlanDetails.promotionalLabel && (
                              <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs mt-1">
                                {selectedPlanDetails.promotionalLabel}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Badge variant="secondary">{selectedPlanDetails.denomination.toString().startsWith('$') ? selectedPlanDetails.denomination : `$${selectedPlanDetails.denomination}`}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Your Cost:</span>
                      <Badge variant="outline">${selectedPlanDetails.retailerPrice}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-semibold">Your Commission:</span>
                      <Badge variant="default" className="bg-green-600 text-white">${selectedPlanDetails.profit}</Badge>
                    </div>
                    {selectedPlanDetails.description && (
                      <div className="mt-3">
                        <span className="text-gray-700 text-sm">{selectedPlanDetails.description}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    <span className="text-sm">5G Network Access</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    <span className="text-sm">No Contract Required</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    <span className="text-sm">Nationwide Coverage</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    <span className="text-sm">Free Number Porting</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    <span className="text-sm">24/7 Customer Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Extra bottom spacing to ensure form is fully visible */}
        <div className="h-20"></div>
      </div>

      {/* Employee Verification Dialog - Only for admin users */}
      {user?.role === 'admin' && (
        <EmployeeVerificationDialog
          isOpen={employeeVerification.isVerificationOpen}
          onClose={employeeVerification.handleVerificationCancel}
          onVerified={employeeVerification.handleVerificationSuccess}
          operationType={employeeVerification.operationType}
          operationDetails={employeeVerification.operationDetails}
        />
      )}

      {/* Customer Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Customer Receipt</DialogTitle>
          </DialogHeader>
          {activationData && (
            <CustomerReceipt
              activation={activationData}
              onPrint={handlePrintReceipt}
            />
          )}
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handleCloseReceipt}>
              Close
            </Button>
            <Button onClick={handlePrintReceipt} className="bg-blue-600 hover:bg-blue-700">
              Print Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}