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
import { Smartphone, Crown, TrendingUp, Users } from "lucide-react";

const PRESET_AMOUNTS = [
  { value: 10, label: "$10", description: "Basic" },
  { value: 25, label: "$25", description: "Standard" },
  { value: 50, label: "$50", description: "Premium" },
  { value: 100, label: "$100", description: "Super" },
];

export default function AdminRecharge() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>("");

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
      setSelectedAmount(25);
      setCustomAmount("");
      toast({
        title: "Admin Recharge Successful",
        description: `Transaction #TXN-${String(data.id).padStart(6, "0")} has been processed with admin privileges.`,
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
    
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    rechargeTransactionMutation.mutate({
      ...data,
      amount: finalAmount,
      userId: user.id,
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

  const getDisplayAmount = () => {
    return customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  };

  const getServiceFee = () => {
    return (getDisplayAmount() * 0.05).toFixed(2); // Admin gets better rates
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Crown className="w-6 h-6 text-red-600 mr-2" />
          Admin Mobile Recharge
        </h1>
        <p className="text-gray-600">Full access international mobile phone recharge with admin privileges</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(analytics as any)?.totalRevenue || "0.00"}
                  </p>
                  <p className="text-sm text-red-600">Total earnings</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {todayTransactions.length}
                  </p>
                  <p className="text-sm text-blue-600">System-wide</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${todayRevenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">Daily earnings</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recharge Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="w-5 h-5 text-red-600 mr-2" />
                Admin Recharge Console
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Country</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a country..." />
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

                  <div>
                    <FormLabel className="text-sm font-medium text-gray-700 mb-3 block">
                      Recharge Amount
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {PRESET_AMOUNTS.map((preset) => (
                        <Button
                          key={preset.value}
                          type="button"
                          variant={selectedAmount === preset.value && !customAmount ? "default" : "outline"}
                          className={`p-3 text-center ${
                            selectedAmount === preset.value && !customAmount
                              ? "bg-red-600 hover:bg-red-700"
                              : "hover:border-red-600 hover:bg-red-50"
                          }`}
                          onClick={() => handleAmountSelect(preset.value)}
                        >
                          <div className="font-medium">{preset.label}</div>
                          <div className="text-xs opacity-75">{preset.description}</div>
                        </Button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="focus:ring-red-600 focus:border-red-600"
                    />
                  </div>

                  <div className="bg-red-50 p-4 rounded-md border border-red-200">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Recharge Amount:</span>
                      <span>${getDisplayAmount().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Admin Service Fee (5):</span>
                      <span>${getServiceFee()}</span>
                    </div>
                    <div className="border-t border-red-200 pt-2 flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${getTotalAmount()}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={rechargeTransactionMutation.isPending}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {rechargeTransactionMutation.isPending ? "Processing..." : "Process Admin Recharge"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Recent System Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {safeAllTransactions.slice(0, 5).map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.phoneNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.carrier} - ${transaction.amount}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : transaction.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {transaction.status}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        #{String(transaction.id).padStart(6, "0")}
                      </div>
                    </div>
                  </div>
                ))}
                {!safeAllTransactions.length && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No transactions yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}