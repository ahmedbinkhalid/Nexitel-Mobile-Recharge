import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertProfitPayoutSchema } from "@shared/schema";
import { z } from "zod";
import { DollarSign, TrendingUp, Wallet, Plus, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type ProfitPayout = {
  id: number;
  amount: string;
  payoutMethod: string;
  recipientDetails: any;
  reference: string | null;
  status: string;
  notes: string | null;
  profitBalanceBefore: string;
  profitBalanceAfter: string;
  mainBalanceBefore: string;
  mainBalanceAfter: string;
  requestedAt: string;
  processedAt: string | null;
  completedAt: string | null;
  processedBy: number;
  employeeId: string;
};

const payoutFormSchema = insertProfitPayoutSchema.extend({
  recipientDetails: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    recipientName: z.string().optional(),
    checkNumber: z.string().optional(),
    zelleEmail: z.string().email().optional(),
    zellePhone: z.string().optional(),
    usdtWalletAddress: z.string().optional(),
    networkType: z.string().optional(),
  }).optional(),
});

type PayoutFormData = z.infer<typeof payoutFormSchema>;

export default function ProfitPayouts() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch profit balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/profit/balance"],
  });

  // Fetch profit payouts
  const { data: payouts = [], isLoading: payoutsLoading, refetch } = useQuery<ProfitPayout[]>({
    queryKey: ["/api/profit/payouts"],
  });

  // Form setup
  const form = useForm<PayoutFormData>({
    resolver: zodResolver(payoutFormSchema),
    defaultValues: {
      amount: "",
      payoutMethod: "",
      reference: "",
      notes: "",
      employeeId: "",
      recipientDetails: {},
    },
  });

  const selectedMethod = form.watch("payoutMethod");

  // Create payout mutation
  const createPayoutMutation = useMutation({
    mutationFn: async (data: PayoutFormData) => {
      return apiRequest("/api/profit/payouts", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profit payout request created successfully",
      });
      form.reset();
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/profit/payouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profit/balance"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create payout request",
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      return apiRequest(`/api/profit/payouts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payout status updated successfully",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payout status",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PayoutFormData) => {
    createPayoutMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "processing":
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Processing</Badge>;
      case "completed":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "wire_transfer":
        return "🏦";
      case "check":
        return "📄";
      case "zelle":
        return "💸";
      case "usdt":
        return "₿";
      default:
        return "💰";
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profit Payouts</h1>
          <p className="text-muted-foreground">
            Manage profit withdrawals and payout requests
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm}>
          <Plus className="w-4 h-4 mr-2" />
          New Payout
        </Button>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balanceLoading ? "..." : formatCurrency((balanceData as any)?.totalProfit?.toString() || "0")}
            </div>
            <p className="text-xs text-muted-foreground">
              Accumulated profit from operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balanceLoading ? "..." : formatCurrency((balanceData as any)?.availableBalance?.toString() || "0")}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balanceLoading ? "..." : formatCurrency((balanceData as any)?.profitBalance?.toString() || "0")}
            </div>
            <p className="text-xs text-muted-foreground">
              Current profit balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Payout Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Payout Request</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payout Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payoutMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payout Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payout method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="wire_transfer">🏦 Wire Transfer</SelectItem>
                            <SelectItem value="check">📄 Check</SelectItem>
                            <SelectItem value="zelle">💸 Zelle</SelectItem>
                            <SelectItem value="usdt">₿ USDT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Method-specific fields */}
                {selectedMethod === "wire_transfer" && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium">Wire Transfer Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recipientDetails.bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Bank Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="recipientDetails.routingNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Routing Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Routing Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="recipientDetails.accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Account Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="recipientDetails.recipientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipient Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Full Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === "check" && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium">Check Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recipientDetails.recipientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payable To</FormLabel>
                            <FormControl>
                              <Input placeholder="Full Name or Business" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="recipientDetails.checkNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check Number (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Check Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === "zelle" && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium">Zelle Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recipientDetails.zelleEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zelle Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="recipientDetails.zellePhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zelle Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === "usdt" && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium">USDT Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recipientDetails.usdtWalletAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>USDT Wallet Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Wallet Address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="recipientDetails.networkType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Network</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select network" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="trc20">TRC20 (Tron)</SelectItem>
                                <SelectItem value="erc20">ERC20 (Ethereum)</SelectItem>
                                <SelectItem value="bep20">BEP20 (BSC)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID (Required)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your Employee ID"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Reference number or ID"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about this payout"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createPayoutMutation.isPending}
                  >
                    {createPayoutMutation.isPending ? "Creating..." : "Create Payout"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Payouts History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {payoutsLoading ? (
            <div className="text-center py-8">Loading payouts...</div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payouts found. Create your first payout request above.
            </div>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div key={payout.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getMethodIcon(payout.payoutMethod)}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(payout.amount)}
                        </span>
                        {getStatusBadge(payout.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Method: {payout.payoutMethod.replace("_", " ").toUpperCase()}</p>
                        <p>Requested: {new Date(payout.requestedAt).toLocaleString()}</p>
                        {payout.reference && <p>Reference: {payout.reference}</p>}
                        {payout.notes && <p>Notes: {payout.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {payout.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: payout.id,
                                status: "processing",
                              })
                            }
                          >
                            Process
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: payout.id,
                                status: "cancelled",
                              })
                            }
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {payout.status === "processing" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: payout.id,
                                status: "completed",
                              })
                            }
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: payout.id,
                                status: "failed",
                              })
                            }
                          >
                            Mark Failed
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}