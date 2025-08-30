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
import { Database, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Base schema for Nexitel data add-on
const baseNexitelDataAddonSchema = z.object({
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  iccid: z.string().min(19, "Valid ICCID is required"),
  dataPackage: z.string().min(1, "Data package selection is required"),
  customerEmail: z.string().email("Valid email is required").optional(),
  employeeId: z.string().optional(),
});

// Create schema with conditional employeeId requirement based on user role
const createNexitelDataAddonSchema = (userRole: string) => {
  return baseNexitelDataAddonSchema.extend({
    employeeId: userRole === 'admin' ? z.string().min(1, "Employee ID is required") : z.string().optional(),
  });
};

type NexitelDataAddonRequest = z.infer<typeof baseNexitelDataAddonSchema>;

const DATA_PACKAGES = [
  { id: "1gb", name: "1GB Add-on", price: 15, description: "1GB additional data" },
  { id: "3gb", name: "3GB Add-on", price: 25, description: "3GB additional data" },
  { id: "5gb", name: "5GB Add-on", price: 35, description: "5GB additional data" },
  { id: "10gb", name: "10GB Add-on", price: 50, description: "10GB additional data" },
  { id: "unlimited", name: "Unlimited Add-on", price: 75, description: "Unlimited data for 30 days" },
];

export default function NexitelDataAddons() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<typeof DATA_PACKAGES[0] | null>(null);

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

  const form = useForm<NexitelDataAddonRequest>({
    resolver: zodResolver(createNexitelDataAddonSchema(user?.role || 'retailer')),
    defaultValues: {
      phoneNumber: "",
      iccid: "",
      dataPackage: "",
      customerEmail: "",
      employeeId: "",
    },
  });

  const dataAddonMutation = useMutation({
    mutationFn: async (data: NexitelDataAddonRequest) => {
      return apiRequest('/api/nexitel/data-addons', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (result) => {
      toast({
        title: "Data Add-on Successful!",
        description: `${selectedPackage?.name} added to ${form.getValues('phoneNumber')}. Confirmation sent via SMS.`,
        variant: "default",
      });
      form.reset();
      setSelectedPackage(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Data Add-on Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePackageChange = (packageId: string) => {
    const pkg = DATA_PACKAGES.find(p => p.id === packageId);
    setSelectedPackage(pkg || null);
    form.setValue('dataPackage', packageId);
  };

  const onSubmit = (data: NexitelDataAddonRequest) => {
    dataAddonMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
                <Database className="w-8 h-8 text-indigo-600 mr-3" />
                Nexitel Data Add-ons
              </h1>
              <p className="text-gray-600 mt-2">Purchase additional data packages for Nexitel customers</p>
            </div>
          </div>
          
          {/* Balance Display */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Your Balance</div>
            <div className="text-2xl font-bold text-indigo-600">${user?.balance || "0.00"}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Data Add-on Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 text-indigo-600 mr-2" />
                  Purchase Data Add-on
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
                        name="iccid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ICCID</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter ICCID" 
                                {...field} 
                                className="font-mono"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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

                    {/* Data Package Selection */}
                    <FormField
                      control={form.control}
                      name="dataPackage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Package</FormLabel>
                          <Select onValueChange={handlePackageChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a data package" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DATA_PACKAGES.map((pkg) => (
                                <SelectItem key={pkg.id} value={pkg.id}>
                                  {pkg.name} - ${pkg.price} - {pkg.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Package Preview */}
                    {selectedPackage && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <h3 className="font-semibold text-indigo-900 mb-2">Selected Package</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-indigo-700">Package:</span>
                            <span className="font-medium text-indigo-900">{selectedPackage.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-indigo-700">Cost:</span>
                            <span className="font-bold text-indigo-900">${selectedPackage.price}</span>
                          </div>
                          <div className="text-sm text-indigo-600">{selectedPackage.description}</div>
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      disabled={dataAddonMutation.isPending}
                    >
                      {dataAddonMutation.isPending ? "Processing..." : "Purchase Data Add-on"}
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
                <CardTitle className="text-lg">Data Add-on Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      Data add-ons are activated immediately upon purchase
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      SMS confirmation sent to customer
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      Compatible with both Nexitel Purple and Blue networks
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      30-day validity from purchase date
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Available Packages</h4>
                  <div className="space-y-2">
                    {DATA_PACKAGES.map((pkg) => (
                      <div key={pkg.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{pkg.name}</span>
                        <span className="font-medium">${pkg.price}</span>
                      </div>
                    ))}
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