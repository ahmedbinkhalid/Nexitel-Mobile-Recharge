import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Wallet, Zap, Plus, CreditCard, FileText, Smartphone, Phone, Users, Globe, Wifi, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function EmployeeDashboard() {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics/overview"],
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  
  const todayCommission = safeTransactions
    .filter((t: any) => {
      const today = new Date();
      const transactionDate = new Date(t.createdAt);
      return (
        transactionDate.toDateString() === today.toDateString() &&
        t.status === "completed"
      );
    })
    .reduce((sum: number, t: any) => sum + (parseFloat(t.serviceFee) || 0), 0);

  const newCommission = safeTransactions
    .filter((t: any) => t.status === "completed")
    .reduce((sum: number, t: any) => sum + (parseFloat(t.serviceFee) || 0), 0);

  const pendingReconciliation = safeTransactions.filter(
    (t: any) => t.status === "pending"
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.employeeRole === "accountant" ? "Accountant" : "Employee"} Dashboard
          </h1>
          <p className="text-gray-600">Financial oversight and transaction management</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Account Balance</div>
          <div className="text-2xl font-bold text-green-600">${user?.balance || "0.00"}</div>
        </div>
      </div>

      {/* Commission Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Commission</p>
                <p className="text-2xl font-bold text-gray-900">${todayCommission.toFixed(2)}</p>
                <p className="text-xs text-gray-500">From completed transactions</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Commission</p>
                <p className="text-2xl font-bold text-gray-900">${newCommission.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Total earnings</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(analytics as any)?.totalRevenue || "0.00"}
                </p>
                <p className="text-xs text-gray-500">Available funds</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Categories Grid - Admin Layout Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Nexitel Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Nexitel</h3>
              <p className="text-blue-100 text-sm">Complete wireless service management</p>
            </div>
            <Phone className="w-12 h-12 text-blue-200" />
          </div>
          <div className="space-y-6">
            <Link href="/nexitel-activation">
              <div className="flex items-center text-sm hover:text-blue-200 cursor-pointer mb-3">
                <Plus className="w-4 h-4 mr-2" />
                New Activation
              </div>
            </Link>
            <Link href="/nexitel-recharge">
              <div className="flex items-center text-sm hover:text-blue-200 cursor-pointer mb-3">
                <CreditCard className="w-4 h-4 mr-2" />
                Recharge
              </div>
            </Link>
            <Link href="/nexitel-activation-report">
              <div className="flex items-center text-sm hover:text-blue-200 cursor-pointer mb-3">
                <FileText className="w-4 h-4 mr-2" />
                Activation Report
              </div>
            </Link>
            <Link href="/nexitel-recharge-report">
              <div className="flex items-center text-sm hover:text-blue-200 cursor-pointer mb-3">
                <FileText className="w-4 h-4 mr-2" />
                Recharge Report
              </div>
            </Link>
            <Link href="/nexitel-sim-swap">
              <div className="flex items-center text-sm hover:text-blue-200 cursor-pointer mb-3">
                <Smartphone className="w-4 h-4 mr-2" />
                SIM Swap
              </div>
            </Link>
            <Link href="/nexitel-port-status">
              <div className="flex items-center text-sm hover:text-blue-200 cursor-pointer mb-3">
                <Zap className="w-4 h-4 mr-2" />
                Port-In Status
              </div>
            </Link>
            <Link href="/wifi-calling-activation">
              <div className="flex items-center text-sm hover:text-blue-200 cursor-pointer mb-3">
                <Wifi className="w-4 h-4 mr-2" />
                WiFi Calling Feature
              </div>
            </Link>
            <Link href="/nexitel-bulk-activation">
              <div className="flex items-center text-sm hover:text-blue-200 cursor-pointer">
                <Users className="w-4 h-4 mr-2" />
                Bulk Activation
              </div>
            </Link>
          </div>
        </div>

        {/* NexiPhone Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">NexiPhone</h3>
              <p className="text-purple-100 text-sm">VoIP and calling applications</p>
            </div>
            <Phone className="w-12 h-12 text-purple-200" />
          </div>
          <div className="space-y-6">
            <Link href="/voip-activation">
              <div className="flex items-center text-sm hover:text-purple-200 cursor-pointer mb-3">
                <Phone className="w-4 h-4 mr-2" />
                VoIP Activation
              </div>
            </Link>
            <Link href="/voip-bulk-activation">
              <div className="flex items-center text-sm hover:text-purple-200 cursor-pointer mb-3">
                <Users className="w-4 h-4 mr-2" />
                Bulk VoIP Activation
              </div>
            </Link>
            <Link href="/nexiphone-apps">
              <div className="flex items-center text-sm hover:text-purple-200 cursor-pointer">
                <Smartphone className="w-4 h-4 mr-2" />
                NexiPhone Apps
              </div>
            </Link>
          </div>
        </div>

        {/* USA Carriers Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">USA Carriers</h3>
              <p className="text-indigo-100 text-sm">Domestic mobile carriers & analytics</p>
            </div>
            <Phone className="w-12 h-12 text-indigo-200" />
          </div>
          <div className="space-y-6">
            <Link href="/admin/usa-recharge">
              <div className="flex items-center text-sm hover:text-indigo-200 cursor-pointer mb-3">
                <Phone className="w-4 h-4 mr-2" />
                USA Recharge
              </div>
            </Link>
            <div className="flex items-center text-sm hover:text-indigo-200 cursor-pointer mb-3">
              <TrendingUp className="w-4 h-4 mr-2" />
              USA Analytics
            </div>
            <div className="flex items-center text-sm hover:text-indigo-200 cursor-pointer mb-3">
              <FileText className="w-4 h-4 mr-2" />
              USA Reports
            </div>
            <div className="flex items-center text-sm hover:text-indigo-200 cursor-pointer">
              <BarChart3 className="w-4 h-4 mr-2" />
              Transaction History
            </div>
          </div>
        </div>

        {/* Global Recharge Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Global Recharge</h3>
              <p className="text-green-100 text-sm">International mobile top-up services</p>
            </div>
            <Globe className="w-12 h-12 text-green-200" />
          </div>
          <div className="space-y-6">
            <Link href="/global-menu">
              <div className="flex items-center text-sm hover:text-green-200 cursor-pointer mb-3">
                <Globe className="w-4 h-4 mr-2" />
                International Recharge
              </div>
            </Link>
            <Link href="/global-recharge">
              <div className="flex items-center text-sm hover:text-green-200 cursor-pointer mb-3">
                <CreditCard className="w-4 h-4 mr-2" />
                Quick Global Recharge
              </div>
            </Link>
            <div className="flex items-center text-sm hover:text-green-200 cursor-pointer mb-3">
              <BarChart3 className="w-4 h-4 mr-2" />
              Country Analytics
            </div>
            <div className="flex items-center text-sm hover:text-green-200 cursor-pointer mb-3">
              <FileText className="w-4 h-4 mr-2" />
              Global Reports
            </div>
            <div className="flex items-center text-sm hover:text-green-200 cursor-pointer">
              <TrendingUp className="w-4 h-4 mr-2" />
              Transaction History
            </div>
          </div>
        </div>
      </div>

      {/* Employee Management and System Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Tasks */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Employee Management</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/activity-management">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </Button>
              </Link>
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                <Wallet className="w-4 h-4 mr-2" />
                Fund Management
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Analytics */}
        <Card className="bg-gradient-to-r from-teal-600 to-cyan-600">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Analytics</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                <FileText className="w-4 h-4 mr-2" />
                System Reports
              </Button>
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                <TrendingUp className="w-4 h-4 mr-2" />
                Audit Logs
              </Button>
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {safeTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeTransactions.slice(0, 10).map((transaction: any) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        #TXN-{String(transaction.id).padStart(6, "0")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        ${transaction.totalAmount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {transaction.phoneNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
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
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
