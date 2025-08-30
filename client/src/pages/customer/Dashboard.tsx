import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rechargeSchema, type RechargeRequest } from "@shared/schema";
import { REGIONS, COUNTRIES, getCountriesByRegion, getCarriers } from "@shared/countries";
import { useAuth } from "@/components/AuthProvider";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, BookOpen, Plus, ChevronRight, CreditCard, Check, Globe, Zap } from "lucide-react";
import { Link } from "wouter";
import { CommissionDisplay } from "@/components/CommissionDisplay";

const PRESET_AMOUNTS = [
  { value: 10, label: "$10", description: "Quick top-up" },
  { value: 25, label: "$25", description: "Most popular" },
  { value: 50, label: "$50", description: "Value pack" },
  { value: 100, label: "$100", description: "Super saver" },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [activeService, setActiveService] = useState<'global' | 'nexitel'>('global');

  const form = useForm<RechargeRequest>({
    resolver: zodResolver(rechargeSchema),
    defaultValues: {
      phoneNumber: "",
      country: "",
      carrier: "",
      amount: 25,
    },
  });

  const selectedCountry = form.watch("country");
  const availableCarriers = selectedCountry ? getCarriers(selectedCountry) : [];

  const { data: userTransactions } = useQuery({
    queryKey: ["/api/transactions/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: savedNumbers } = useQuery({
    queryKey: ["/api/saved-numbers", user?.id],
    enabled: !!user?.id,
  });

  const rechargeTransactionMutation = useMutation({
    mutationFn: async (data: RechargeRequest & { userId: number }) => {
      const serviceFee = (data.amount * 0.1).toFixed(2); // 10 service fee
      
      return apiRequest("/api/recharge/process", {
        method: "POST",
        body: {
          userId: data.userId,
          phoneNumber: data.phoneNumber,
          country: data.country,
          carrier: data.carrier,
          planPrice: data.amount.toString(),
          serviceFee: serviceFee,
          planId: null
        }
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/user", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      form.reset({
        phoneNumber: "",
        country: "",
        carrier: "",
        amount: 25,
      });
      setSelectedAmount(25);
      toast({
        title: "Recharge Successful!",
        description: `Commission earned: $${result.commission}. New balance: $${result.newBalance}`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Recharge Failed",
        description: error.message || "Failed to process recharge",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RechargeRequest) => {
    if (!user) return;
    
    rechargeTransactionMutation.mutate({
      ...data,
      userId: user.id,
    });
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    form.setValue("amount", amount);
  };

  const handleSavedNumberSelect = (savedNumber: any) => {
    form.setValue("phoneNumber", savedNumber.phoneNumber);
    form.setValue("country", savedNumber.country);
    form.setValue("carrier", savedNumber.carrier);
  };

  const getServiceFee = () => {
    return (selectedAmount * 0.08).toFixed(2);
  };

  const getTotalAmount = () => {
    return (selectedAmount + parseFloat(getServiceFee())).toFixed(2);
  };

  // Ensure userTransactions is always an array
  const safeUserTransactions = Array.isArray(userTransactions) ? userTransactions : [];
  const recentTransactions = safeUserTransactions.slice(0, 2);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
            <p className="text-gray-600">International mobile recharge services</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Account Balance</div>
            <div className="text-2xl font-bold text-green-600">${user?.balance || "0.00"}</div>
          </div>
        </div>
      </div>

      {/* Commission Display */}
      <CommissionDisplay />

      {/* Service Selection */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Nexitel Activation */}
          <Link href="/nexitel-activation">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Nexitel Activation</CardTitle>
                <p className="text-sm text-gray-600">Activate new wireless service</p>
                <Badge className="mt-2">1 Commission</Badge>
              </CardHeader>
            </Card>
          </Link>

          {/* Global Recharge */}
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Global Recharge Service</CardTitle>
              <p className="text-sm text-gray-600">International mobile phone top-ups</p>
              <Badge className="mt-2">1 Commission</Badge>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Recharge Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recharge Your Phone</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <FormLabel>Phone Number</FormLabel>
                    <div className="flex space-x-2">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="outline" size="icon">
                        <BookOpen className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Country</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-80">
                            {REGIONS.map((region) => {
                              const regionCountries = getCountriesByRegion(region);
                              return (
                                <div key={region}>
                                  <div className="px-2 py-1.5 text-sm font-semibold text-gray-900 bg-gray-100 sticky top-0">
                                    {region}
                                  </div>
                                  {regionCountries.map((country) => (
                                    <SelectItem key={country.code} value={country.code}>
                                      <span className="flex items-center">
                                        <span className="mr-2">{country.flag}</span>
                                        {country.name}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </div>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="carrier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Carrier</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select carrier..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableCarriers.map((carrier) => (
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

                  <div>
                    <FormLabel className="text-sm font-medium text-gray-700 mb-3 block">
                      Choose Amount
                    </FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {PRESET_AMOUNTS.map((preset) => (
                        <Button
                          key={preset.value}
                          type="button"
                          variant={selectedAmount === preset.value ? "default" : "outline"}
                          className={`p-4 text-center ${
                            selectedAmount === preset.value
                              ? "bg-orange-600 hover:bg-orange-700 border-2 border-orange-600"
                              : "hover:border-orange-600 hover:bg-orange-50"
                          }`}
                          onClick={() => handleAmountSelect(preset.value)}
                        >
                          <div className="text-lg font-bold">{preset.label}</div>
                          <div className="text-xs opacity-75">{preset.description}</div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Recharge Amount:</span>
                      <span className="text-sm font-medium">${selectedAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Processing Fee:</span>
                      <span className="text-sm font-medium">${getServiceFee()}</span>
                    </div>
                    <div className="border-t border-orange-200 pt-2 flex items-center justify-between">
                      <span className="font-medium text-gray-900">Total Amount:</span>
                      <span className="text-lg font-bold text-orange-600">${getTotalAmount()}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={rechargeTransactionMutation.isPending}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {rechargeTransactionMutation.isPending ? "Processing..." : "Pay & Recharge Now"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Saved Numbers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saved Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(Array.isArray(savedNumbers) ? savedNumbers : []).slice(0, 2).map((savedNumber: any) => (
                  <Button
                    key={savedNumber.id}
                    variant="ghost"
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
                    onClick={() => handleSavedNumberSelect(savedNumber)}
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {savedNumber.phoneNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {savedNumber.label} ({savedNumber.carrier})
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Button>
                ))}
                {!(Array.isArray(savedNumbers) && savedNumbers.length) && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No saved numbers yet
                  </p>
                )}
                <Button variant="ghost" className="w-full text-orange-600 hover:text-orange-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Add New Number
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        ${transaction.amount} Recharge
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.phoneNumber} • {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {!recentTransactions.length && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
                <Button variant="ghost" className="w-full text-orange-600 hover:text-orange-700">
                  View All Transactions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
