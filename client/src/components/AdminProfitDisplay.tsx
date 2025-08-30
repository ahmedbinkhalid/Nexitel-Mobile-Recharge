import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, Activity } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function AdminProfitDisplay() {
  const { user } = useAuth();

  // Only show for admin users
  if (!user || user.role !== "admin") {
    return null;
  }

  const { data: allTransactions } = useQuery({
    queryKey: ["/api/transactions"],
  });

  // Calculate admin profits from retailer transactions
  const profitTransactions = Array.isArray(allTransactions) 
    ? allTransactions.filter((t: any) => t.phoneNumber === "ADMIN_PROFIT")
    : [];

  const totalProfit = profitTransactions.reduce(
    (sum: number, t: any) => sum + parseFloat(t.totalAmount || "0"), 0
  ).toFixed(2);

  const profitCount = profitTransactions.length;

  // Get recent profit transactions
  const recentProfits = profitTransactions
    .slice(-5)
    .reverse();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Admin Profit */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Admin Profit</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${totalProfit}</div>
          <div className="flex items-center mt-1">
            <Badge variant="outline" className="text-xs">
              From Retailer Transactions
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Profit Transactions Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit Transactions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{profitCount}</div>
          <div className="flex items-center mt-1">
            <Badge variant="outline" className="text-xs">
              Total Count
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Profit Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Admin Profit Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">2</div>
          <div className="flex items-center mt-1">
            <Badge variant="outline" className="text-xs">
              Retailer Transactions
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}