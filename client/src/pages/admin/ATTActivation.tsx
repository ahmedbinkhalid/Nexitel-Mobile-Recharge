import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attActivationSchema, type AttActivationRequest, type Plan, type User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Smartphone, Globe, Wifi, Database, ArrowLeft, Upload, FileText, Users } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/AuthProvider";


const US_STATES = [
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" }, { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" }, { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" }, { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" }, { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" }, { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" }, { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" }, { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" }, { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" }, { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" }, { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" }, { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" }, { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" }, { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" }, { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" }
];

const INTERNATIONAL_COUNTRIES = [
  { value: "canada", label: "Canada (+$15/month)", cost: 15 },
  { value: "mexico", label: "Mexico (+$10/month)", cost: 10 },
  { value: "uk", label: "United Kingdom (+$20/month)", cost: 20 },
  { value: "france", label: "France (+$20/month)", cost: 20 },
  { value: "germany", label: "Germany (+$20/month)", cost: 20 },
  { value: "japan", label: "Japan (+$25/month)", cost: 25 },
  { value: "australia", label: "Australia (+$25/month)", cost: 25 },
];

const ROAMING_REGIONS = [
  { value: "north-america", label: "North America (+$10/month)", cost: 10 },
  { value: "europe", label: "Europe (+$25/month)", cost: 25 },
  { value: "asia", label: "Asia Pacific (+$30/month)", cost: 30 },
  { value: "worldwide", label: "Worldwide (+$45/month)", cost: 45 },
];

const DATA_ADDONS = [
  { value: "1GB", label: "1GB (+$10)", cost: 10 },
  { value: "3GB", label: "3GB (+$25)", cost: 25 },
  { value: "5GB", label: "5GB (+$35)", cost: 35 },
  { value: "10GB", label: "10GB (+$60)", cost: 60 },
];

export default function ATTActivation() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [activeTab, setActiveTab] = useState("individual");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkEmployeeId, setBulkEmployeeId] = useState("");
  const [bulkServiceType, setBulkServiceType] = useState("");

  // Fetch AT&T plans
  const { data: plans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ["/api/plans"],
  });

  const attPlans = plans.filter(plan => plan.serviceType === "att");

  // Dynamic schema based on user role
  const getDynamicSchema = () => {
    if (user?.role === 'admin') {
      return attActivationSchema.extend({
        employeeId: z.string().min(1, "Employee ID is required"),
      });
    }
    return attActivationSchema;
  };

  const form = useForm<AttActivationRequest>({
    resolver: zodResolver(getDynamicSchema()),
    defaultValues: {
      customerFirstName: "",
      customerLastName: "",
      customerEmail: "",
      customerAddress: "",
      customerCity: "",
      customerState: "",
      customerZipCode: "",
      iccid: "",
      simType: "physical",
      planId: 0,
      hasInternational: false,
      internationalCountries: [],
      internationalCost: 0,
      hasRoaming: false,
      roamingRegions: [],
      roamingCost: 0,
      hasDataAddon: false,
      dataAddonAmount: "",
      dataAddonCost: 0,
      isPortIn: false,
      portInPhoneNumber: "",
      portInCarrier: "",
      portInAccountNumber: "",
      portInPin: "",
      portInZipCode: "",
      hasWifiCalling: false,
      wifiEmergencyAddress: "",
      wifiEmergencyCity: "",
      wifiEmergencyState: "",
      wifiEmergencyZipCode: "",
      employeeId: "",
      notes: "",
    },
  });

  // Calculate total cost when form values change
  const watchedValues = form.watch();
  
  const calculateTotalCost = () => {
    let total = 0;
    
    if (selectedPlan) {
      total += Number(selectedPlan.retailerPrice);
    }
    

    
    if (watchedValues.hasRoaming && watchedValues.roamingRegions) {
      watchedValues.roamingRegions.forEach(regionCode => {
        const region = ROAMING_REGIONS.find(r => r.value === regionCode);
        if (region) total += region.cost;
      });
    }
    
    if (watchedValues.hasDataAddon && watchedValues.dataAddonAmount) {
      const addon = DATA_ADDONS.find(a => a.value === watchedValues.dataAddonAmount);
      if (addon) total += addon.cost;
    }
    
    setTotalCost(total);
  };

  // Recalculate cost when relevant values change
  React.useEffect(() => {
    calculateTotalCost();
  }, [
    selectedPlan,

    watchedValues.hasRoaming,
    watchedValues.roamingRegions,
    watchedValues.hasDataAddon,
    watchedValues.dataAddonAmount
  ]);

  const activationMutation = useMutation({
    mutationFn: async (data: AttActivationRequest) => {
      return apiRequest("/api/att/activation", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "AT&T activation completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/att/activations"] });
      form.reset();
      setSelectedPlan(null);
      setTotalCost(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkActivationMutation = useMutation({
    mutationFn: async (data: { batchName: string; serviceType: string; employeeId: string }) => {
      return apiRequest("/api/att/bulk-activation", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "AT&T bulk activation initiated successfully",
      });
      setBulkFile(null);
      setBulkEmployeeId("");
      setBulkServiceType("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBulkSubmit = () => {
    // Check required fields based on user role
    if (!bulkFile || !bulkServiceType) {
      toast({
        title: "Error",
        description: "Please provide file and service type",
        variant: "destructive",
      });
      return;
    }

    // Check employee ID only for admin users
    if (user?.role === 'admin' && !bulkEmployeeId) {
      toast({
        title: "Error",
        description: "Employee ID is required for admin users",
        variant: "destructive",
      });
      return;
    }

    bulkActivationMutation.mutate({
      batchName: bulkFile.name,
      serviceType: bulkServiceType,
      employeeId: user?.role === 'admin' ? bulkEmployeeId : '',
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBulkFile(file);
    }
  };

  const onSubmit = (data: AttActivationRequest) => {
    activationMutation.mutate({
      ...data,

      roamingCost: watchedValues.hasRoaming ?
        (watchedValues.roamingRegions || []).reduce((sum, regionCode) => {
          const region = ROAMING_REGIONS.find(r => r.value === regionCode);
          return sum + (region ? region.cost : 0);
        }, 0) : 0,
      dataAddonCost: watchedValues.hasDataAddon && watchedValues.dataAddonAmount ?
        (DATA_ADDONS.find(a => a.value === watchedValues.dataAddonAmount)?.cost || 0) : 0,
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={user?.role === 'retailer' ? '/retailer/dashboard' : '/admin'}>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AT&T Activation</h1>
            <p className="text-gray-600 dark:text-gray-400">Activate your new AT&T wireless service</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Individual Activation
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Bulk Activation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form - Left Side */}
              <div className="lg:col-span-2 space-y-4">

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Employee Verification - Only for admin users */}
          {user?.role === 'admin' && (
            <Card className="border-red-200">
              <CardHeader className="pb-1 pt-2">
                <CardTitle className="flex items-center gap-1 text-sm">
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  Employee Verification Required
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
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
              </CardContent>
            </Card>
          )}

          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-1 pt-2">
              <CardTitle className="flex items-center gap-1 text-sm">
                <Smartphone className="h-3 w-3" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="customerFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} className="h-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} className="h-8" />
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
                    <FormLabel className="text-xs">Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@email.com" type="email" {...field} className="h-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Street Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} className="h-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">City *</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} className="h-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">State *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select state..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
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
                name="customerZipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">ZIP Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="12345" {...field} className="h-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
            </CardContent>
          </Card>

          {/* SIM Information */}
          <Card>
            <CardHeader className="pb-1 pt-2">
              <CardTitle className="flex items-center gap-1 text-sm">
                <Database className="h-3 w-3" />
                SIM Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="iccid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">ICCID *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="89014103211118510720" 
                        {...field}
                        className="font-mono h-8"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="simType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">SIM Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8">
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
              </div>
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <Card>
            <CardHeader className="pb-1 pt-2">
              <CardTitle className="flex items-center gap-1 text-sm">
                <Smartphone className="h-3 w-3" />
                Plan Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <FormField
                control={form.control}
                name="planId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">AT&T Plan *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                        const plan = attPlans.find(p => p.id === Number(value));
                        setSelectedPlan(plan || null);
                      }} 
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select AT&T plan..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {attPlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            <div className="flex justify-between items-center w-full">
                              <span>{plan.name} - {plan.denomination}</span>
                              <Badge variant="outline">${plan.retailerPrice}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedPlan && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-sm">{selectedPlan.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{selectedPlan.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge>{selectedPlan.planType}</Badge>
                    <Badge variant="outline">${selectedPlan.retailerPrice}</Badge>
                    {selectedPlan.durationMonths > 1 && (
                      <Badge variant="secondary">{selectedPlan.durationMonths} months</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">

            {/* Roaming Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wifi className="h-4 w-4" />
                  Roaming Options
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <FormField
                  control={form.control}
                  name="hasRoaming"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 text-sm">Enable Roaming</FormLabel>
                    </FormItem>
                  )}
                />

                {watchedValues.hasRoaming && (
                  <div className="space-y-2">
                    <FormLabel className="text-sm">Select Regions</FormLabel>
                    {ROAMING_REGIONS.map((region) => (
                      <FormField
                        key={region.value}
                        control={form.control}
                        name="roamingRegions"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(region.value) || false}
                                onCheckedChange={(checked) => {
                                  const currentRegions = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentRegions, region.value]);
                                  } else {
                                    field.onChange(currentRegions.filter(r => r !== region.value));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">{region.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Add-ons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Add-ons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasDataAddon"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Add Extra Data</FormLabel>
                    </FormItem>
                  )}
                />

                {watchedValues.hasDataAddon && (
                  <FormField
                    control={form.control}
                    name="dataAddonAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Amount</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select data amount..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DATA_ADDONS.map((addon) => (
                              <SelectItem key={addon.value} value={addon.value}>
                                {addon.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* WiFi Calling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  WiFi Calling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasWifiCalling"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Enable WiFi Calling</FormLabel>
                    </FormItem>
                  )}
                />

                {watchedValues.hasWifiCalling && (
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="wifiEmergencyAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Emergency St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="wifiEmergencyCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="wifiEmergencyState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="State..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {US_STATES.map((state) => (
                                  <SelectItem key={state.value} value={state.value}>
                                    {state.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="wifiEmergencyZipCode"
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Port-in Information */}
          <Card>
            <CardHeader>
              <CardTitle>Port-in Information (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="isPortIn"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Port existing number</FormLabel>
                  </FormItem>
                )}
              />

              {watchedValues.isPortIn && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="portInPhoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number to Port</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="portInCarrier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Carrier</FormLabel>
                        <FormControl>
                          <Input placeholder="Verizon, T-Mobile, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="portInAccountNumber"
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

                  <FormField
                    control={form.control}
                    name="portInPin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account PIN/Password</FormLabel>
                        <FormControl>
                          <Input placeholder="PIN or password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="portInZipCode"
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
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes or special instructions..."
                        className="min-h-[60px]"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Link href="/admin/att-services">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={activationMutation.isPending || totalCost === 0}
                    className="min-w-[200px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    {activationMutation.isPending ? (
                      "Processing..."
                    ) : (
                      `Activate AT&T Service - $${totalCost.toFixed(2)}`
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Plan Summary Card - Right Side */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 sticky top-6">
              <CardContent className="p-6">
                {selectedPlan ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        ${selectedPlan.retailerPrice}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        /month
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                        {selectedPlan.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {selectedPlan.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                          {selectedPlan.planType}
                        </Badge>
                        {selectedPlan.durationMonths > 1 && (
                          <Badge variant="secondary">
                            {selectedPlan.durationMonths} months
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">What's Included</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          AT&T Network Access
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          5G Coverage
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Customer Support
                        </div>

                        {watchedValues.hasRoaming && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Roaming Access
                          </div>
                        )}
                        {watchedValues.hasWifiCalling && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            WiFi Calling
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedPlan && totalCost > parseFloat(selectedPlan.retailerPrice || '0') && (
                      <div className="border-t pt-4 space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">Additional Costs</h4>

                        {watchedValues.hasRoaming && watchedValues.roamingRegions?.length && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Roaming</span>
                            <span className="text-gray-900 dark:text-white">
                              +${watchedValues.roamingRegions.reduce((sum, code) => {
                                const region = ROAMING_REGIONS.find(r => r.value === code);
                                return sum + (region ? region.cost : 0);
                              }, 0)}/month
                            </span>
                          </div>
                        )}
                        {watchedValues.hasDataAddon && watchedValues.dataAddonAmount && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Data Add-on</span>
                            <span className="text-gray-900 dark:text-white">
                              +${DATA_ADDONS.find(a => a.value === watchedValues.dataAddonAmount)?.cost}
                            </span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-medium">
                          <span className="text-gray-900 dark:text-white">Total</span>
                          <span className="text-gray-900 dark:text-white">${totalCost.toFixed(2)}/month</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Smartphone className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Select a Plan</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose an AT&T plan to see pricing and details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bulk">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    AT&T Bulk Activation
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload a CSV file to activate multiple AT&T services at once
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Employee Verification - Only for admin users */}
                  {user?.role === 'admin' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Employee ID *</label>
                      <Input
                        placeholder="Enter your employee ID"
                        value={bulkEmployeeId}
                        onChange={(e) => setBulkEmployeeId(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  )}

                  {/* Service Type Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Service Type *</label>
                    <Select value={bulkServiceType} onValueChange={setBulkServiceType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prepaid">AT&T Prepaid</SelectItem>
                        <SelectItem value="postpaid">AT&T Postpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CSV File *</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                      <div className="text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                              {bulkFile ? bulkFile.name : "Drop a CSV file here, or click to select"}
                            </span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept=".csv"
                              className="sr-only"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleBulkSubmit}
                    disabled={!bulkFile || !bulkEmployeeId || !bulkServiceType || bulkActivationMutation.isPending}
                    className="w-full"
                  >
                    {bulkActivationMutation.isPending ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Start Bulk Activation
                      </>
                    )}
                  </Button>

                  {/* Instructions */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>CSV Format Requirements:</strong><br />
                      Your CSV file should include columns: CustomerFirstName, CustomerLastName, CustomerEmail, ICCID, PlanID
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}