import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Wifi, Phone, Smartphone, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { z } from "zod";

// WiFi Calling activation schema
const wifiCallingActivationSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().min(1, "Phone number is required"),
  deviceType: z.string().min(1, "Device type is required"),
  carrierName: z.string().min(1, "Carrier name is required"),
  planType: z.string().min(1, "Plan type is required"),
  emergencyAddress: z.string().min(1, "Emergency address is required"),
  emergencyCity: z.string().min(1, "Emergency city is required"),
  emergencyState: z.string().min(1, "Emergency state is required"),
  emergencyZip: z.string().min(1, "Emergency ZIP code is required"),
  notes: z.string().optional(),
});

type WifiCallingActivationRequest = z.infer<typeof wifiCallingActivationSchema>;

export default function WifiCallingActivation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Fetch recent WiFi calling activations
  const { data: recentActivations = [] } = useQuery({
    queryKey: ["/api/wifi-calling/activations", user?.id],
    enabled: !!user?.id,
  });

  const form = useForm<WifiCallingActivationRequest>({
    resolver: zodResolver(wifiCallingActivationSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      deviceType: "",
      carrierName: "",
      planType: "",
      emergencyAddress: "",
      emergencyCity: "",
      emergencyState: "",
      emergencyZip: "",
      notes: "",
    },
  });

  const activationMutation = useMutation({
    mutationFn: async (data: WifiCallingActivationRequest) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      return apiRequest("/api/wifi-calling/activate", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          userId: user.id,
        })
      });
    },
    onSuccess: (result: any) => {
      toast({
        title: "WiFi Calling Activated!",
        description: `Setup instructions sent to customer. WiFi calling is now enabled.`,
        variant: "default",
      });
      
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/wifi-calling/activations"] });
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

  const onSubmit = async (data: WifiCallingActivationRequest) => {
    setIsProcessing(true);
    try {
      await activationMutation.mutateAsync(data);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || !["admin", "employee", "retailer"].includes(user.role)) {
    return <div>Access denied</div>;
  }

  const deviceTypes = [
    "iPhone (iOS 9+)",
    "Samsung Galaxy",
    "Google Pixel",
    "OnePlus",
    "Android (Generic)",
    "Windows Phone",
    "Other Smartphone"
  ];

  const carriers = [
    "Nexitel Purple",
    "Nexitel Blue", 
    "AT&T",
    "Verizon",
    "T-Mobile",
    "Sprint",
    "US Cellular",
    "Other Carrier"
  ];

  const planTypes = [
    "Unlimited Voice & Data",
    "Voice + 5GB Data",
    "Voice + 10GB Data", 
    "Voice Only Plan",
    "Business Plan",
    "Family Plan",
    "Custom Plan"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-4" 
                type="button"
                onClick={handleBackNavigation}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center">
                <Wifi className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">WiFi Calling Activation</h1>
                  <p className="text-sm text-gray-600">Enable voice calls over WiFi networks</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">User: {user.username}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Activation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                  WiFi Calling Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Customer Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} />
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
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="customer@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1-555-0123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deviceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Device Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select device type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {deviceTypes.map((device) => (
                                  <SelectItem key={device} value={device}>
                                    {device}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Service Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="carrierName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carrier</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select carrier" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {carriers.map((carrier) => (
                                  <SelectItem key={carrier} value={carrier}>
                                    {carrier}
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
                        name="planType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plan Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select plan type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {planTypes.map((plan) => (
                                  <SelectItem key={plan} value={plan}>
                                    {plan}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Emergency Address */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Emergency Address (Required for WiFi Calling)</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="emergencyAddress"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main Street" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="emergencyCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="City name" {...field} />
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
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="State" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="emergencyZip"
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
                    </div>

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Input placeholder="Any special requirements or notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={isProcessing || activationMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessing || activationMutation.isPending ? (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Activating WiFi Calling...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Wifi className="w-4 h-4 mr-2" />
                          Activate WiFi Calling
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            {/* WiFi Calling Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">WiFi Calling Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Better Indoor Coverage</p>
                    <p className="text-sm text-gray-600">Make calls in areas with poor cellular signal</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">International Calling</p>
                    <p className="text-sm text-gray-600">Avoid roaming charges when traveling</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">HD Voice Quality</p>
                    <p className="text-sm text-gray-600">Crystal clear call quality over broadband</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Seamless Handoff</p>
                    <p className="text-sm text-gray-600">Smooth transition between WiFi and cellular</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Setup Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                  Setup Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="font-medium text-orange-900">Emergency Address</p>
                  <p className="text-orange-700">Required by law for 911 location services</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">Compatible Device</p>
                  <p className="text-blue-700">Device must support WiFi calling feature</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900">Broadband Internet</p>
                  <p className="text-green-700">Stable WiFi connection recommended</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activations */}
            {Array.isArray(recentActivations) && recentActivations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentActivations.slice(0, 3).map((activation: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{activation.customerName}</p>
                          <p className="text-xs text-gray-600">{activation.deviceType}</p>
                        </div>
                        <Badge variant="secondary">{activation.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}