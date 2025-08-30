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
import { ArrowLeft, RefreshCw, Phone, CreditCard, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { NEXITEL_NETWORKS } from "@shared/nexitel-carriers";

const simSwapSchema = z.object({
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  currentIccid: z.string().min(19, "Current ICCID must be at least 19 digits").max(22, "Current ICCID must be at most 22 digits"),
  newIccid: z.string().min(19, "New ICCID must be at least 19 digits").max(22, "New ICCID must be at most 22 digits"),
  network: z.enum(["nexitel-purple", "nexitel-blue"], { required_error: "Network is required" }),
  reason: z.enum(["damaged", "lost", "stolen", "upgrade"], { required_error: "Reason is required" }),
});

type SimSwapRequest = z.infer<typeof simSwapSchema>;

const SWAP_REASONS = [
  { value: "damaged", label: "SIM Card Damaged" },
  { value: "lost", label: "SIM Card Lost" },
  { value: "stolen", label: "SIM Card Stolen" },
  { value: "upgrade", label: "Upgrade to eSIM" },
];

export default function NexitelSimSwap() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const form = useForm<SimSwapRequest>({
    resolver: zodResolver(simSwapSchema),
    defaultValues: {
      phoneNumber: "",
      currentIccid: "",
      newIccid: "",
      network: undefined,
      reason: undefined,
    },
  });

  const onSubmit = async (data: SimSwapRequest) => {
    setIsSubmitting(true);
    console.log("SIM Swap Request:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    // Handle success/error states here
  };

  const selectedNetwork = NEXITEL_NETWORKS.find(n => n.value === form.watch("network"));
  const selectedReason = SWAP_REASONS.find(r => r.value === form.watch("reason"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={handleBackNavigation}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {user?.role === "retailer" ? "Back to Dashboard" : "Back to Home"}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <RefreshCw className="w-8 h-8 text-orange-600 mr-3" />
            Nexitel SIM Swap
          </h1>
          <p className="text-gray-600 mt-2">Replace your SIM card and transfer your service</p>
        </div>

        {/* Warning Alert */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-orange-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800 mb-2">Important Notice</h3>
                <p className="text-orange-700 text-sm">
                  SIM swap will temporarily interrupt your service. Please ensure you have access to your new SIM card before proceeding. 
                  The process typically takes 5-10 minutes to complete.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SIM Swap Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 text-orange-600 mr-2" />
                  SIM Swap Request
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

                    {/* Network Selection */}
                    <FormField
                      control={form.control}
                      name="network"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nexitel Network</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your network..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NEXITEL_NETWORKS.map((network) => (
                                <SelectItem key={network.value} value={network.value}>
                                  {network.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Current ICCID */}
                    <FormField
                      control={form.control}
                      name="currentIccid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current SIM ICCID</FormLabel>
                          <FormControl>
                            <Input placeholder="89014103211118510720" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* New ICCID */}
                    <FormField
                      control={form.control}
                      name="newIccid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New SIM ICCID</FormLabel>
                          <FormControl>
                            <Input placeholder="89014103211118510721" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Reason for Swap */}
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for SIM Swap</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reason..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SWAP_REASONS.map((reason) => (
                                <SelectItem key={reason.value} value={reason.value}>
                                  {reason.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Processing Swap...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2" />
                          Request SIM Swap
                        </>
                      )}
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
                <CardTitle>Swap Summary</CardTitle>
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
                    <span className="text-gray-600">Network:</span>
                    <div>
                      {selectedNetwork ? (
                        <Badge className={selectedNetwork.color}>
                          {selectedNetwork.label}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Not selected</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reason:</span>
                    <span className="font-medium">
                      {selectedReason?.label || "Not selected"}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold mb-2">Process Time:</p>
                      <p>5-10 minutes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-orange-600 font-bold text-xs">1</span>
                    </div>
                    <p>Have your new SIM card ready</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-orange-600 font-bold text-xs">2</span>
                    </div>
                    <p>Submit the swap request</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-orange-600 font-bold text-xs">3</span>
                    </div>
                    <p>Insert new SIM when notified</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-orange-600 font-bold text-xs">4</span>
                    </div>
                    <p>Restart your device</p>
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