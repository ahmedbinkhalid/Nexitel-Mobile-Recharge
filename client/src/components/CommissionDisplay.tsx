import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, DollarSign } from "lucide-react";

export function CommissionDisplay() {
  const { user } = useAuth();
  
  // Fetch user's commission transactions
  const { data: transactions } = useQuery({
    queryKey: [`/api/transactions/user/${user?.id}`],
    enabled: !!user?.id,
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  if (!user || user.role === "admin") {
    return null;
  }

  // Filter commission transactions
  const commissionTransactions = Array.isArray(transactions) 
    ? transactions.filter((t: any) => t.phoneNumber === "COMMISSION")
    : [];

  // Calculate total commission earned today
  const today = new Date().toDateString();
  const todayCommissions = commissionTransactions.filter(
    (t: any) => new Date(t.createdAt).toDateString() === today
  );
  const todayTotal = todayCommissions.reduce(
    (sum: number, t: any) => sum + parseFloat(t.totalAmount || "0"), 0
  ).toFixed(2);

  // Calculate total commission earned all time
  const totalCommission = commissionTransactions.reduce(
    (sum: number, t: any) => sum + parseFloat(t.totalAmount || "0"), 0
  ).toFixed(2);

  // Commission rate removed per user request

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Commission</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${todayTotal}</div>
          <p className="text-xs text-muted-foreground">
            {todayCommissions.length} transactions today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">${totalCommission}</div>
          <p className="text-xs text-muted-foreground">
            {commissionTransactions.length} total earnings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}