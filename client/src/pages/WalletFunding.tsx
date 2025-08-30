import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addFundsSchema, type AddFundsRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Wallet, CreditCard, DollarSign, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

import { useAuth } from "@/components/AuthProvider";
import { useEmployeeVerification } from "@/hooks/useEmployeeVerification";
import { EmployeeVerificationDialog } from "@/components/EmployeeVerificationDialog";

interface WalletFundingProps {
  userId?: number;
  currentBalance?: string;
  onBalanceUpdate?: () => void;
}

const CheckoutForm = ({ userId, amount, paymentMethod, onSuccess }: {
  userId: number;
  amount: number;
  paymentMethod: string;
  onSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await apiRequest(`/api/wallet/create-payment-intent?userId=${userId}`, {
        method: "POST",
        body: { amount, paymentMethod }
      });

      const responseData = await response.json();
      const { clientSecret, transactionId } = responseData;

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        toast({
          title: "Payment Failed",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        // Confirm payment on backend
        await apiRequest("/api/wallet/confirm-payment", {
          method: "POST",
          body: {
            transactionId,
            paymentIntentId: result.paymentIntent.id,
          }
        });

        toast({
          title: "Payment Successful",
          description: `$${amount.toFixed(2)} has been added to your wallet`,
        });

        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
            },
          }}
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? "Processing..." : `Add $${amount.toFixed(2)} to Wallet`}
      </Button>
    </form>
  );
};

export default function WalletFunding({ userId: propUserId, currentBalance: propCurrentBalance, onBalanceUpdate }: WalletFundingProps) {
  const { user } = useAuth();
  const userId = propUserId || user?.id;
  const currentBalance = propCurrentBalance || user?.balance || "0.00";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [fundingData, setFundingData] = useState<AddFundsRequest | null>(null);

  // Employee verification hook
  const employeeVerification = useEmployeeVerification({
    operationType: "fund_transfer",
    operationDetails: propUserId ? `Adding funds to retailer account (ID: ${propUserId})` : "Adding funds to own wallet"
  });

  const form = useForm<AddFundsRequest>({
    resolver: zodResolver(addFundsSchema),
    defaultValues: {
      amount: 50,
      paymentMethod: "credit_card",
    },
  });

  // Fetch wallet permissions
  const { data: permissions = { canAddFunds: false, maxDailyFunding: 0, maxMonthlyFunding: 0 }, isLoading: permissionsLoading } = useQuery({
    queryKey: [`/api/wallet/permissions/${userId}`],
    enabled: !!userId,
  });

  // Fetch payment transactions  
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: [`/api/wallet/transactions/${userId}`],
    enabled: !!userId,
  });
  
  // Ensure transactions is always an array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  
  // Ensure permissions has proper defaults and types
  const safePermissions = {
    canAddFunds: (permissions as any)?.canAddFunds ?? false,
    maxDailyFunding: (permissions as any)?.maxDailyFunding ?? 0,
    maxMonthlyFunding: (permissions as any)?.maxMonthlyFunding ?? 0
  };

  const onSubmit = (data: AddFundsRequest) => {
    if (!safePermissions.canAddFunds) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to add funds to your wallet",
        variant: "destructive",
      });
      return;
    }

    // Use employee verification if required (especially for employees managing retailer funds)
    employeeVerification.requireEmployeeVerification(() => {
      setFundingData(data);
      setShowPaymentForm(true);
    });
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setFundingData(null);
    form.reset();
    queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions", userId] });
    if (onBalanceUpdate) {
      onBalanceUpdate();
    }
  };

  if (permissionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Funding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading wallet permissions...</div>
        </CardContent>
      </Card>
    );
  }

  if (!safePermissions.canAddFunds) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Funding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to add funds to your wallet. Please contact your administrator.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Funding
          </CardTitle>
          <CardDescription>
            Add funds to your wallet using your debit or credit card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Balance:</span>
              <span className="text-lg font-bold text-green-600">
                ${parseFloat(currentBalance).toFixed(2)}
              </span>
            </div>
          </div>

          {safePermissions.maxDailyFunding && (
            <div className="mb-4 text-sm text-muted-foreground">
              Daily funding limit: ${parseFloat(safePermissions.maxDailyFunding.toString()).toFixed(2)}
            </div>
          )}

          {safePermissions.maxMonthlyFunding && (
            <div className="mb-4 text-sm text-muted-foreground">
              Monthly funding limit: ${parseFloat(safePermissions.maxMonthlyFunding.toString()).toFixed(2)}
            </div>
          )}

          {!showPaymentForm ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="5" 
                          max="5000" 
                          step="0.01"
                          placeholder="Enter amount"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="debit_card">Debit Card</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Continue to Payment
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Amount:</span>
                  <span className="font-bold">${fundingData?.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Payment Method:</span>
                  <span className="capitalize">{fundingData?.paymentMethod.replace("_", " ")}</span>
                </div>
              </div>

              <Elements stripe={stripePromise}>
                <CheckoutForm
                  userId={userId || 0}
                  amount={fundingData?.amount || 0}
                  paymentMethod={fundingData?.paymentMethod || "credit_card"}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>

              <Button 
                variant="outline" 
                onClick={() => setShowPaymentForm(false)}
                className="w-full"
              >
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div>Loading transactions...</div>
          ) : !safeTransactions || safeTransactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No transactions found
            </div>
          ) : (
            <div className="space-y-2">
              {safeTransactions.slice(0, 5).map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-3 bg-muted rounded-lg"
                >
                  <div>
                    <div className="font-medium">${parseFloat(transaction.amount).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      transaction.status === "completed" ? "text-green-600" :
                      transaction.status === "failed" ? "text-red-600" :
                      "text-yellow-600"
                    }`}>
                      {transaction.status.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Verification Dialog */}
      <EmployeeVerificationDialog
        isOpen={employeeVerification.isVerificationOpen}
        onClose={employeeVerification.handleVerificationCancel}
        onVerified={employeeVerification.handleVerificationSuccess}
        operationType={employeeVerification.operationType}
        operationDetails={employeeVerification.operationDetails}
      />
    </div>
  );
}