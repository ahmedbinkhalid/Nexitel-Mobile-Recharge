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
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, ArrowLeft, AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Base schema for Nexitel SIM swap
const baseNexitelSimSwapSchema = z.object({
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  oldIccid: z.string().min(19, "Valid old ICCID is required"),
  newIccid: z.string().min(19, "Valid new ICCID is required"),
  reason: z.enum(["damaged", "lost", "stolen", "defective"], { required_error: "Reason is required" }),
  customerEmail: z.string().email("Valid email is required").optional(),
  notes: z.string().optional(),
  employeeId: z.string().optional(),
});

// Create schema with conditional employeeId requirement based on user role
const createNexitelSimSwapSchema = (userRole: string) => {
  return baseNexitelSimSwapSchema.extend({
    employeeId: userRole === 'admin' ? z.string().min(1, "Employee ID is required") : z.string().optional(),
  });
};

type NexitelSimSwapRequest = z.infer<typeof baseNexitelSimSwapSchema>;

const SWAP_REASONS = [
  { value: "damaged", label: "SIM Card Damaged", description: "Physical damage to SIM card" },
  { value: "lost", label: "SIM Card Lost", description: "Customer lost their SIM card" },
  { value: "stolen", label: "SIM Card Stolen", description: "SIM card was stolen" },
  { value: "defective", label: "SIM Card Defective", description: "SIM card not working properly" },
];

export default function NexitelSimSwap() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedReason, setSelectedReason] = useState<typeof SWAP_REASONS[0] | null>(null);

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

  const form = useForm<NexitelSimSwapRequest>({
    resolver: zodResolver(createNexitelSimSwapSchema(user?.role || 'retailer')),
    defaultValues: {
      phoneNumber: "",
      oldIccid: "",
      newIccid: "",
      reason: undefined,
      customerEmail: "",
      notes: "",
      employeeId: "",
    },
  });

  const simSwapMutation = useMutation({
    mutationFn: async (data: NexitelSimSwapRequest) => {
      return apiRequest('/api/nexitel/sim-swap', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (result) => {
      toast({
        title: "SIM Swap Successful!",
        description: `SIM swap completed for ${form.getValues('phoneNumber')}. Service transferred to new SIM.`,
        variant: "default",
      });
      form.reset();
      setSelectedReason(null);
    },
    onError: (error: Error) => {
      toast({
        title: "SIM Swap Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleReasonChange = (reason: string) => {
    const selectedReason = SWAP_REASONS.find(r => r.value === reason);
    setSelectedReason(selectedReason || null);
    form.setValue('reason', reason as any);
  };

  const onSubmit = (data: NexitelSimSwapRequest) => {
    simSwapMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackNavigation}
              className="hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <RefreshCw className="w-8 h-8 text-orange-600 mr-3" />
                Nexitel SIM Swap
              </h1>
              <p className="text-gray-600 mt-2">Replace damaged or lost SIM cards for Nexitel customers</p>
            </div>
          </div>
          
          {/* Balance Display */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Your Balance</div>
            <div className="text-2xl font-bold text-orange-600">${user?.balance || "0.00"}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SIM Swap Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 text-orange-600 mr-2" />
                  SIM Swap Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Employee Verification Required - Only for admin users */}
                    {user?.role === 'admin' && (
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
                    )}

                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
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
                            <FormLabel>Customer Email (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="customer@example.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* SIM Card Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="oldIccid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Old ICCID</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Current SIM ICCID" 
                                {...field} 
                                className="font-mono"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="newIccid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New ICCID</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="New SIM ICCID" 
                                {...field} 
                                className="font-mono"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Swap Reason */}
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for SIM Swap</FormLabel>
                          <Select onValueChange={handleReasonChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reason for swap" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SWAP_REASONS.map((reason) => (
                                <SelectItem key={reason.value} value={reason.value}>
                                  {reason.label} - {reason.description}
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
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional notes about the SIM swap..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Reason Preview */}
                    {selectedReason && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h3 className="font-semibold text-orange-900 mb-2">Swap Reason</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-orange-700">Reason:</span>
                            <span className="font-medium text-orange-900">{selectedReason.label}</span>
                          </div>
                          <div className="text-sm text-orange-600">{selectedReason.description}</div>
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      disabled={simSwapMutation.isPending}
                    >
                      {simSwapMutation.isPending ? "Processing..." : "Process SIM Swap"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Information Sidebar */}
          <div>
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">SIM Swap Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      Service transferred immediately to new SIM
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      Old SIM will be deactivated automatically
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      Phone number and plan remain unchanged
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      Confirmation SMS sent to customer
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      • Valid phone number and old ICCID
                    </div>
                    <div className="text-sm text-gray-600">
                      • New SIM card ICCID
                    </div>
                    <div className="text-sm text-gray-600">
                      • Reason for replacement
                    </div>
                    <div className="text-sm text-gray-600">
                      • Employee ID verification
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    No Additional Cost
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">
                    SIM swap service is free for existing customers
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