import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, Store, TrendingUp, Smartphone, Plus, Zap, CreditCard, FileText, Globe, Wallet, DollarSign, Phone, RefreshCw, Shield, Wifi, Settings, Database, ArrowRightLeft, BarChart3, Download } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { AdminProfitDisplay } from "@/components/AdminProfitDisplay";
import { DailyCarrierAnalytics } from "@/components/DailyCarrierAnalytics";
import nexitelLogo from "@assets/resize_1755316599807.jpg";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddFundDialogOpen, setIsAddFundDialogOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics/overview"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: totalRetailerBalance } = useQuery({
    queryKey: ["/api/balance/total-retailer"],
  });

  const addFundMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await fetch(`/api/admin/main-balance/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add funds");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Successfully added $${fundAmount} to main balance`,
      });
      setFundAmount("");
      setIsAddFundDialogOpen(false);
      // Refresh page to show updated balance
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add funds",
        variant: "destructive",
      });
    },
  });

  const handleAddFund = () => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    addFundMutation.mutate(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600">Complete system overview and management</p>
            </div>
            <div className="text-left sm:text-right min-w-0 flex-shrink-0">
              <div className="text-sm text-gray-500">Main Balance</div>
              <div className="flex items-center justify-start sm:justify-end gap-3">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">${user?.balance || "0.00"}</div>
                <Dialog open={isAddFundDialogOpen} onOpenChange={setIsAddFundDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white min-h-[36px]"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Fund
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Funds to Main Balance</DialogTitle>
                      <DialogDescription>
                        Enter the amount you want to add to the main system balance.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                          min="0.01"
                          step="0.01"
                          className="text-lg"
                        />
                      </div>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddFundDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddFund}
                        disabled={addFundMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {addFundMutation.isPending ? "Adding..." : "Add Fund"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Profit Display */}
        <div className="mb-8">
          <AdminProfitDisplay />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 truncate">Total Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    ${(analytics as any)?.totalRevenue || "0.00"}
                  </p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 truncate">Active Employees</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {(analytics as any)?.activeEmployees || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 truncate">Active Retailers</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {(analytics as any)?.activeRetailers || 0}
                  </p>
                </div>
                <div className="bg-purple-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Store className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 truncate">Total Retailer Balance</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    ${totalRetailerBalance as string || "0.00"}
                  </p>
                </div>
                <div className="bg-orange-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Carrier Analytics */}
        <DailyCarrierAnalytics />

        {/* Main Service Groups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8 items-stretch">
          
          {/* Nexitel Services Group */}
          <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <img 
                  src={nexitelLogo} 
                  alt="Nexitel Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <CardTitle className="text-xl font-bold text-blue-900">Nexitel</CardTitle>
              <CardDescription className="text-blue-700">Complete wireless service management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
              <Link href="/nexitel-activation">
                <Button variant="ghost" className="w-full justify-start text-blue-800 hover:bg-blue-100 text-sm py-2">
                  <Smartphone className="w-4 h-4 mr-2" />
                  New Activation
                </Button>
              </Link>
              <Link href="/nexitel-recharge">
                <Button variant="ghost" className="w-full justify-start text-blue-800 hover:bg-blue-100 text-sm py-2">
                  <Zap className="w-4 h-4 mr-2" />
                  Recharge
                </Button>
              </Link>
              <Link href="/nexitel-data-addons">
                <Button variant="ghost" className="w-full justify-start text-blue-800 hover:bg-blue-100 text-sm py-2">
                  <Database className="w-4 h-4 mr-2" />
                  Data Add-ons
                </Button>
              </Link>
              <Link href="/nexitel-sim-swap">
                <Button variant="ghost" className="w-full justify-start text-blue-800 hover:bg-blue-100 text-sm py-2">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  SIM Swap
                </Button>
              </Link>
              <Link href="/nexitel-port-status">
                <Button variant="ghost" className="w-full justify-start text-blue-800 hover:bg-blue-100 text-sm py-2">
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Port-In Status
                </Button>
              </Link>
              <Link href="/nexitel-bulk-activation">
                <Button variant="ghost" className="w-full justify-start text-blue-800 hover:bg-blue-100 text-sm py-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Bulk Activation
                </Button>
              </Link>
              <Link href="/nexitel-activation-report">
                <Button variant="ghost" className="w-full justify-start text-blue-800 hover:bg-blue-100 text-sm py-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* NexiPhone Services Group */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl font-bold text-purple-900">NexiPhone</CardTitle>
              <CardDescription className="text-purple-700">VoIP and calling services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
              <Link href="/voip-activation">
                <Button variant="ghost" className="w-full justify-start text-purple-800 hover:bg-purple-100 text-sm py-2">
                  <Phone className="w-4 h-4 mr-2" />
                  VoIP Services
                </Button>
              </Link>
              <Link href="/nexiphone-apps">
                <Button variant="ghost" className="w-full justify-start text-purple-800 hover:bg-purple-100 text-sm py-2">
                  <Download className="w-4 h-4 mr-2" />
                  Mobile Apps
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start text-purple-800 hover:bg-purple-100 text-sm py-2">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </CardContent>
          </Card>

          {/* USA Carriers Services Group */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-bold text-blue-900">USA Carriers</CardTitle>
              <CardDescription className="text-blue-700">Domestic US mobile carriers & services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
              <Link href="/admin/usa-recharge">
                <Button variant="ghost" className="w-full justify-start text-blue-800 hover:bg-blue-100 text-sm py-2">
                  <Phone className="w-4 h-4 mr-2" />
                  USA Recharge
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start text-blue-800 hover:bg-blue-100 text-sm py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="ghost" className="w-full justify-start text-blue-800 hover:bg-blue-100 text-sm py-2">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </Button>
            </CardContent>
          </Card>

          {/* AT&T Services Group */}
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold text-red-900">AT&T</CardTitle>
              <CardDescription className="text-red-700">Complete AT&T wireless service management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
              <Link href="/admin/att-activation">
                <Button variant="ghost" className="w-full justify-start text-red-800 hover:bg-red-100 text-sm py-2">
                  <Smartphone className="w-4 h-4 mr-2" />
                  New Activation
                </Button>
              </Link>
              <Link href="/admin/att-recharge">
                <Button variant="ghost" className="w-full justify-start text-red-800 hover:bg-red-100 text-sm py-2">
                  <Zap className="w-4 h-4 mr-2" />
                  Recharge
                </Button>
              </Link>
              <Link href="/admin/att-data-addons">
                <Button variant="ghost" className="w-full justify-start text-red-800 hover:bg-red-100 text-sm py-2">
                  <Database className="w-4 h-4 mr-2" />
                  Data Add-ons
                </Button>
              </Link>
              <Link href="/admin/att-port-in">
                <Button variant="ghost" className="w-full justify-start text-red-800 hover:bg-red-100 text-sm py-2">
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Port-In Status
                </Button>
              </Link>
              <Link href="/admin/att-sim-swap">
                <Button variant="ghost" className="w-full justify-start text-red-800 hover:bg-red-100 text-sm py-2">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  SIM Swap
                </Button>
              </Link>
              <Link href="/admin/att-reports">
                <Button variant="ghost" className="w-full justify-start text-red-800 hover:bg-red-100 text-sm py-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Global Recharge Services Group */}
          <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl font-bold text-green-900">Global Recharge</CardTitle>
              <CardDescription className="text-green-700">International mobile top-up services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
              <Link href="/admin/global-recharge">
                <Button variant="ghost" className="w-full justify-start text-green-800 hover:bg-green-100 text-sm py-2">
                  <Globe className="w-4 h-4 mr-2" />
                  International Recharge
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="ghost" className="w-full justify-start text-green-800 hover:bg-green-100 text-sm py-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start text-green-800 hover:bg-green-100 text-sm py-2">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Admin Management */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">Admin Management</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <Link href="/admin/user-management">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm py-3">
                    <Users className="w-4 h-4 mr-2" />
                    User Management
                  </Button>
                </Link>
                <Link href="/admin/commission-group-management">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-sm py-3">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Commission Groups
                  </Button>
                </Link>
                <Link href="/admin/plan-management">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm py-3">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Plan Management
                  </Button>
                </Link>
                <Link href="/admin/fund-management">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-sm py-3">
                    <Wallet className="w-4 h-4 mr-2" />
                    Fund Management
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* System Analytics */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">System Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <Link href="/admin/analytics">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm py-3">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/admin/system-settings">
                  <Button className="w-full bg-gray-600 hover:bg-gray-700 text-sm py-3">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-sm py-3">
                  <FileText className="w-4 h-4 mr-2" />
                  System Reports
                </Button>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-sm py-3">
                  <Shield className="w-4 h-4 mr-2" />
                  Audit Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}