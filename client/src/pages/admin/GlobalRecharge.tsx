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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, TrendingUp, Users, ArrowLeft, AlertCircle } from "lucide-react";
import { useEmployeeVerification } from "@/hooks/useEmployeeVerification";
import { EmployeeVerificationDialog } from "@/components/EmployeeVerificationDialog";

const PRESET_AMOUNTS = [
  { value: 5, label: "$5", description: "Basic" },
  { value: 10, label: "$10", description: "Standard" },
  { value: 20, label: "$20", description: "Popular" },
  { value: 25, label: "$25", description: "Premium" },
  { value: 50, label: "$50", description: "Super" },
  { value: 100, label: "$100", description: "Maximum" },
];

export default function GlobalRecharge() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAmount, setSelectedAmount] = useState<number>(20);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  // Employee verification for international recharge transactions
  const employeeVerification = useEmployeeVerification({
    operationType: "international_recharge",
    operationDetails: "Processing international mobile recharge"
  });

  const form = useForm<RechargeRequest>({
    resolver: zodResolver(rechargeSchema),
    defaultValues: {
      phoneNumber: "",
      country: "",
      carrier: "",
      amount: 20,
      employeeId: "",
    },
  });

  const selectedCountry = form.watch("country");
  const availableCarriers = selectedCountry ? getCarriers(selectedCountry) : [];
  const availableCountries = selectedRegion ? getCountriesByRegion(selectedRegion) : [];

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/overview"],
  });

  const { data: allTransactions } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const rechargeTransactionMutation = useMutation({
    mutationFn: async (data: RechargeRequest & { userId: number }) => {
      const response = await apiRequest("/api/transactions", { method: "POST", body: data });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/overview"] });
      form.reset();
      setSelectedAmount(20);
      setCustomAmount("");
      setSelectedRegion("");
      toast({
        title: "Global Recharge Successful",
        description: `International recharge #TXN-${String(data.id).padStart(6, "0")} has been processed successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Recharge Failed",
        description: error.message || "Failed to process international recharge",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RechargeRequest) => {
    if (!user) return;
    
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    const rechargeData = {
      ...data,
      amount: finalAmount,
      userId: user.id,
    };

    // Use employee verification for international recharge
    employeeVerification.requireEmployeeVerification(() => {
      rechargeTransactionMutation.mutate(rechargeData);
    });
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    form.setValue("amount", amount);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value) {
      const amount = parseFloat(value);
      if (!isNaN(amount)) {
        form.setValue("amount", amount);
      }
    }
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    form.setValue("country", "");
    form.setValue("carrier", "");
  };

  const handleCountryChange = (country: string) => {
    form.setValue("country", country);
    form.setValue("carrier", "");
  };

  const getDisplayAmount = () => {
    return customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  };

  const getServiceFee = () => {
    return (getDisplayAmount() * 0.03).toFixed(2); // Global recharge gets best admin rates
  };

  const getTotalAmount = () => {
    return (getDisplayAmount() + parseFloat(getServiceFee())).toFixed(2);
  };

  const safeAllTransactions = Array.isArray(allTransactions) ? allTransactions : [];
  const todayTransactions = safeAllTransactions.filter((t: any) => {
    const today = new Date();
    const transactionDate = new Date(t.createdAt);
    return transactionDate.toDateString() === today.toDateString();
  }) || [];

  const todayRevenue = todayTransactions
    .filter((t: any) => t.status === "completed")
    .reduce((sum: number, t: any) => sum + parseFloat(t.totalAmount), 0);

  const todayCount = todayTransactions.filter((t: any) => t.status === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => window.location.href = "/admin"}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mr-3" />
                Global Recharge
              </h1>
              <p className="text-gray-600 mt-2">International mobile phone top-up services with global coverage</p>
            </div>
            
            {/* Balance Display */}
            <div className="bg-white p-4 rounded-lg shadow-sm border min-w-[200px]">
              <div className="text-sm text-gray-500">Main Balance</div>
              <div className="text-2xl font-bold text-green-600">${user?.balance || "0.00"}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recharge Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 text-green-600 mr-2" />
                  International Mobile Recharge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Employee Verification Required */}
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

                    {/* Region & Country Selection */}
                    <Tabs defaultValue="regions" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="regions">By Region</TabsTrigger>
                        <TabsTrigger value="countries">All Countries</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="regions" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Region Selection */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Select Region</label>
                            <Select onValueChange={handleRegionChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose region" />
                              </SelectTrigger>
                              <SelectContent>
                                {REGIONS.map((region) => (
                                  <SelectItem key={region} value={region}>
                                    🌍 {region}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Country Selection */}
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <Select 
                                  onValueChange={handleCountryChange}
                                  disabled={!selectedRegion}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={!selectedRegion ? "Select region first" : "Choose country"} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {availableCountries.map((country) => (
                                      <SelectItem key={country.code} value={country.code}>
                                        {country.flag} {country.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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
                                <FormLabel>Mobile Carrier</FormLabel>
                                <Select 
                                  onValueChange={field.onChange}
                                  disabled={!selectedCountry}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={!selectedCountry ? "Select country first" : "Choose carrier"} />
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
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="countries" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Direct Country Selection */}
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <Select onValueChange={handleCountryChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Search and select country" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {COUNTRIES.map((country) => (
                                      <SelectItem key={country.code} value={country.code}>
                                        {country.flag} {country.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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
                                <FormLabel>Mobile Carrier</FormLabel>
                                <Select 
                                  onValueChange={field.onChange}
                                  disabled={!selectedCountry}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={!selectedCountry ? "Select country first" : "Choose carrier"} />
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
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Phone Number */}
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter international phone number (e.g., +1-555-123-4567)"
                              {...field}
                              className="text-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Amount Selection */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-gray-700">Recharge Amount</label>
                      
                      {/* Preset Amounts */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {PRESET_AMOUNTS.map((preset) => (
                          <Button
                            key={preset.value}
                            type="button"
                            variant={selectedAmount === preset.value && !customAmount ? "default" : "outline"}
                            className="h-auto p-3 flex-col"
                            onClick={() => handleAmountSelect(preset.value)}
                          >
                            <span className="font-bold">{preset.label}</span>
                            <span className="text-xs">{preset.description}</span>
                          </Button>
                        ))}
                      </div>

                      {/* Custom Amount */}
                      <div className="space-y-2">
                        <label className="text-sm text-gray-600">Or enter custom amount:</label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          min="1"
                          max="500"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Transaction Summary */}
                    <div className="bg-green-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Recharge Amount:</span>
                        <span className="font-medium">${getDisplayAmount().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service Fee (3%):</span>
                        <span className="font-medium">${getServiceFee()}</span>
                      </div>
                      <div className="border-t border-green-200 pt-2 flex justify-between font-bold">
                        <span>Total Amount:</span>
                        <span>${getTotalAmount()}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={rechargeTransactionMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                      size="lg"
                    >
                      {rechargeTransactionMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing Global Recharge...
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 mr-2" />
                          Process International Recharge
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Global Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Revenue</span>
                  </div>
                  <Badge variant="secondary">${todayRevenue.toFixed(2)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Transactions</span>
                  </div>
                  <Badge variant="secondary">{todayCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="text-sm text-gray-600">Coverage</span>
                  </div>
                  <Badge variant="outline">195+ Countries</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Global Coverage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>🌍 Regions Covered:</span>
                    <span className="font-medium">6</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🌐 Countries Available:</span>
                    <span className="font-medium">195+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>📱 Mobile Carriers:</span>
                    <span className="font-medium">1000+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>⚡ Processing Time:</span>
                    <span className="font-medium">Instant</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>💰 Admin Fee:</span>
                    <span className="font-medium text-green-600">3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Global Transactions */}
            {todayTransactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Global Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todayTransactions.slice(0, 3).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{transaction.phoneNumber}</p>
                          <p className="text-xs text-gray-600">{transaction.carrier}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                            ${transaction.amount}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Employee Verification Dialog */}
        <EmployeeVerificationDialog
          isOpen={employeeVerification.isVerificationOpen}
          onClose={employeeVerification.handleVerificationCancel}
          onVerified={employeeVerification.handleVerificationSuccess}
          operationType={employeeVerification.operationType}
          operationDetails={employeeVerification.operationDetails}
        />
      </div>
    </div>
  );
}