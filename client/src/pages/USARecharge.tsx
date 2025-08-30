import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { apiRequest } from "@/lib/queryClient";
import { DollarSign, Phone, CreditCard, Activity, CheckCircle, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { CommissionDisplay } from "@/components/CommissionDisplay";
import { USA_CARRIERS, getCarrierAmounts } from "@shared/usa-carriers";

const usaRechargeSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  carrier: z.string().min(1, "Please select a carrier"),
  amount: z.number().min(5, "Minimum recharge amount is $5"),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
});

type USARechargeRequest = z.infer<typeof usaRechargeSchema>;

export default function USARecharge() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCarrier, setSelectedCarrier] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Get back URL based on user role
  const getBackUrl = () => {
    if (user?.role === "retailer") {
      return "/retailer/dashboard";
    } else if (user?.role === "employee") {
      return "/employee/dashboard";
    } else if (user?.role === "admin") {
      return "/admin";
    }
    return "/";
  };

  const form = useForm<USARechargeRequest>({
    resolver: zodResolver(usaRechargeSchema),
    defaultValues: {
      phoneNumber: "",
      carrier: "",
      amount: 0,
      customerName: "",
      customerEmail: "",
    },
  });

  // Watch form values for dynamic updates
  const watchedCarrier = form.watch("carrier");
  const availableAmounts = getCarrierAmounts(watchedCarrier);

  // Fetch user's current balance
  const { data: currentUser } = useQuery({
    queryKey: [`/api/users/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch recent transactions for this user
  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions/user", user?.id],
    enabled: !!user?.id,
  });

  const rechargeTransactionMutation = useMutation({
    mutationFn: async (data: USARechargeRequest & { userId: number }) => {
      const response = await apiRequest("/api/usa-recharge", { 
        method: "POST", 
        body: data 
      });
      return response;
    },
    onSuccess: (response) => {
      // Reset form
      form.reset();
      setSelectedCarrier("");
      setSelectedAmount(0);
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/user", user?.id] });
      
      toast({
        title: "Recharge Successful",
        description: `USA carrier recharge processed successfully. Transaction ID: ${response.transactionId || 'N/A'}`,
      });
    },
    onError: (error: any) => {
      console.error("USA recharge error:", error);
      toast({
        title: "Recharge Failed",
        description: error.message || "Failed to process USA carrier recharge",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: USARechargeRequest) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    const selectedCarrierData = USA_CARRIERS.find(c => c.code === data.carrier);
    if (!selectedCarrierData) {
      toast({
        title: "Error",
        description: "Please select a valid carrier",
        variant: "destructive",
      });
      return;
    }

    rechargeTransactionMutation.mutate({
      ...data,
      userId: user.id,
    });
  };

  const currentBalance = parseFloat((currentUser as any)?.balance || user?.balance || "0");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link href={getBackUrl()}>
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center">
                <Phone className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">USA Carriers</h1>
                  <p className="text-sm text-gray-500">Domestic US mobile carrier recharge services</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Balance: ${currentBalance.toFixed(2)}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Commission Display - Only for retailers */}
        {user?.role === "retailer" && <CommissionDisplay />}
        
        {/* Recharge Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  USA Carrier Recharge
                </CardTitle>
                <CardDescription>
                  Recharge domestic US mobile carriers including T-Mobile, AT&T, Verizon and more
                </CardDescription>
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
                            <Input
                              placeholder="Enter USA phone number (e.g., 5551234567)"
                              {...field}
                              className="text-lg"
                            />
                          </FormControl>
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
                          <FormLabel>Carrier</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedCarrier(value);
                                form.setValue("amount", 0);
                                setSelectedAmount(0);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a USA carrier" />
                              </SelectTrigger>
                              <SelectContent>
                                {USA_CARRIERS.map((carrier) => (
                                  <SelectItem key={carrier.code} value={carrier.code}>
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-3 h-3 rounded-full ${carrier.color}`}></div>
                                      <span>{carrier.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Amount Selection */}
                    {selectedCarrier && availableAmounts.length > 0 && (
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recharge Amount</FormLabel>
                            <FormControl>
                              <div className="space-y-4">
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                  {availableAmounts.map((amount) => (
                                    <Button
                                      key={amount}
                                      type="button"
                                      variant={selectedAmount === amount ? "default" : "outline"}
                                      className="h-12"
                                      onClick={() => {
                                        setSelectedAmount(amount);
                                        field.onChange(amount);
                                      }}
                                    >
                                      ${amount}
                                    </Button>
                                  ))}
                                </div>
                                <Input
                                  type="number"
                                  placeholder="Or enter custom amount"
                                  min="5"
                                  max="500"
                                  onChange={(e) => {
                                    const amount = parseFloat(e.target.value) || 0;
                                    setSelectedAmount(amount);
                                    field.onChange(amount);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Customer Information - Optional */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter customer name" {...field} />
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
                                placeholder="Enter customer email" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={rechargeTransactionMutation.isPending || !selectedCarrier || !selectedAmount}
                    >
                      {rechargeTransactionMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Process Recharge - ${selectedAmount}
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
            {/* Selected Carrier Info */}
            {selectedCarrier && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Selected Carrier</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const carrier = USA_CARRIERS.find(c => c.code === selectedCarrier);
                    return carrier ? (
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full ${carrier.color} flex items-center justify-center`}>
                          <Phone className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{carrier.name}</p>
                          <p className="text-sm text-gray-500">
                            ${Math.min(...carrier.amounts)} - ${Math.max(...carrier.amounts)}
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{transaction.carrier || 'Unknown'}</p>
                          <p className="text-gray-500">{transaction.phoneNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${transaction.amount}</p>
                          <Badge 
                            variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {transaction.status || 'pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No recent transactions</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}