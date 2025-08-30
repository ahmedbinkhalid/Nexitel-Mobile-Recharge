import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, ArrowLeft, Smartphone, AlertCircle, Check } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type User } from "@shared/schema";
import { useAuth } from "@/components/AuthProvider";

// Data add-on options
const DATA_ADDONS = [
  { value: "1gb", label: "1GB Data", cost: 10, description: "1GB additional data valid for 30 days" },
  { value: "5gb", label: "5GB Data", cost: 40, description: "5GB additional data valid for 30 days" },
  { value: "10gb", label: "10GB Data", cost: 70, description: "10GB additional data valid for 30 days" },
  { value: "25gb", label: "25GB Data", cost: 150, description: "25GB additional data valid for 30 days" },
  { value: "50gb", label: "50GB Data", cost:280, description: "50GB additional data valid for 30 days" }
];

// Create schema with conditional employeeId requirement based on user role
const createDataAddonSchema = (userRole: string) => {
  return z.object({
    phoneNumber: z.string().min(10, "Phone number is required"),
    dataAddonAmount: z.string().min(1, "Please select a data add-on"),
    employeeId: userRole === 'admin' ? z.string().min(1, "Employee ID is required") : z.string().optional(),
    notes: z.string().optional(),
  });
};

const dataAddonSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required"),
  dataAddonAmount: z.string().min(1, "Please select a data add-on"),
  employeeId: z.string().optional(),
  notes: z.string().optional(),
});

type DataAddonRequest = z.infer<typeof dataAddonSchema>;

export default function ATTDataAddons() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedAddon, setSelectedAddon] = useState<typeof DATA_ADDONS[0] | null>(null);

  const form = useForm<DataAddonRequest>({
    resolver: zodResolver(createDataAddonSchema(user?.role || 'retailer')),
    defaultValues: {
      phoneNumber: "",
      dataAddonAmount: "",
      employeeId: "",
      notes: "",
    },
  });

  const watchedValues = form.watch();
  const totalCost = selectedAddon ? selectedAddon.cost : 0;

  const dataAddonMutation = useMutation({
    mutationFn: async (data: DataAddonRequest) => {
      return apiRequest("/api/att/data-addon", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Data add-on has been successfully processed!",
      });
      form.reset();
      setSelectedAddon(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process data add-on",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DataAddonRequest) => {
    dataAddonMutation.mutate({
      ...data,
      dataAddonCost: selectedAddon?.cost || 0,
    } as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
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
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AT&T Data Add-ons</h1>
            <p className="text-gray-600 dark:text-gray-400">Add additional data to existing AT&T plans</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - Left Side */}
          <div className="lg:col-span-2 space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Employee Verification - Only for admin users */}
                {user?.role === 'admin' && (
                  <Card className="border-purple-200">
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Check className="h-4 w-4" />
                        Employee Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <FormField
                        control={form.control}
                        name="employeeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Employee ID *</FormLabel>
                            <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your employee ID..."
                              className="h-9"
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
                  <CardHeader className="pb-2 pt-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Smartphone className="h-4 w-4" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">AT&T Phone Number *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="(555) 123-4567"
                              className="h-9"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Data Add-on Selection */}
                <Card>
                  <CardHeader className="pb-2 pt-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Database className="h-4 w-4" />
                      Data Add-on Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FormField
                      control={form.control}
                      name="dataAddonAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Select Data Add-on *</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              const addon = DATA_ADDONS.find(a => a.value === value);
                              setSelectedAddon(addon || null);
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Choose data amount..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DATA_ADDONS.map((addon) => (
                                <SelectItem key={addon.value} value={addon.value}>
                                  <div className="flex justify-between items-center w-full">
                                    <span>{addon.label}</span>
                                    <Badge variant="outline" className="ml-2">${addon.cost}</Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedAddon && (
                      <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="font-medium text-sm">{selectedAddon.label}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{selectedAddon.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                            ${selectedAddon.cost}
                          </Badge>
                          <Badge variant="outline">30 days validity</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card>
                  <CardHeader className="pb-2 pt-3">
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
                            <Input 
                              {...field} 
                              placeholder="Additional information..."
                              className="h-9"
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
                  <Link href={user?.role === 'retailer' ? '/retailer/dashboard' : '/admin'}>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={dataAddonMutation.isPending || totalCost === 0}
                    className="min-w-[200px] bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  >
                    {dataAddonMutation.isPending ? (
                      "Processing..."
                    ) : (
                      `Add Data Package - $${totalCost.toFixed(2)}`
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Data Add-on Summary Card - Right Side */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 sticky top-6">
              <CardContent className="p-6">
                {selectedAddon ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        ${selectedAddon.cost}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        one-time
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                        {selectedAddon.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {selectedAddon.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                          {selectedAddon.label.split(' ')[0]} Data
                        </Badge>
                        <Badge variant="secondary">
                          30 Days
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Package Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          High-Speed AT&T Data
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          30-Day Validity Period
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Instant Activation
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          No Rollover
                        </div>
                      </div>
                    </div>

                    {watchedValues.phoneNumber && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Customer Phone</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {watchedValues.phoneNumber}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Select Data Add-on</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose a data package to see pricing and details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}