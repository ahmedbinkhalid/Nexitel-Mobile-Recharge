import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Phone,
  Smartphone,
  Globe,
  Zap,
  TrendingUp,
  FileText,
  CreditCard,
  DollarSign,
  Plus,
  Users,
  Crown
} from "lucide-react";

export default function RetailerDashboard() {
  const { user } = useAuth();
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [walletPermissions, setWalletPermissions] = useState(null);
  const [retailerPermissions, setRetailerPermissions] = useState(null);
  const [attPermissions, setAttPermissions] = useState(null);

  // Fetch all permissions when component mounts
  useEffect(() => {
    if (!user?.id) return;

    const fetchAllPermissions = async () => {
      setPermissionsLoading(true);
      console.log('🚀 Starting permission fetch for user:', user.id);

      try {
        // Fetch wallet permissions
        const walletRes = await fetch(`/api/wallet/permissions/${user.id}`, {
          credentials: 'include'
        });
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          console.log('✓ Wallet permissions loaded:', walletData);
          setWalletPermissions(walletData);
        }

        // Fetch retailer permissions
        const retailerRes = await fetch(`/api/retailer-permissions/${user.id}`, {
          credentials: 'include'
        });
        if (retailerRes.ok) {
          const retailerData = await retailerRes.json();
          console.log('✓ Retailer permissions loaded:', retailerData);
          setRetailerPermissions(retailerData);
        } else {
          console.error('Retailer permissions failed:', retailerRes.status, await retailerRes.text());
        }

        // Fetch AT&T permissions
        const attRes = await fetch(`/api/att/permissions/${user.id}`, {
          credentials: 'include'
        });
        if (attRes.ok) {
          const attData = await attRes.json();
          console.log('✓ AT&T permissions loaded:', attData);
          setAttPermissions(attData);
        } else {
          console.error('AT&T permissions failed:', attRes.status, await attRes.text());
        }

      } catch (error) {
        console.error('Permission fetch error:', error);
      } finally {
        setPermissionsLoading(false);
      }
    };

    fetchAllPermissions();
  }, [user?.id]);

  // Combine permissions for easier access
  const permissions = {
    ...(walletPermissions || {}),
    ...(retailerPermissions || {})
  };

  // Check if retailer has specific service permissions
  const hasNexitelAccess = (permissions as any)?.nexitelActivationAccess || (permissions as any)?.simSwapAccess || (permissions as any)?.portInAccess || false;
  const hasUSARechargeAccess = (permissions as any)?.usaRechargeAccess || false;
  const hasGlobalRechargeAccess = (permissions as any)?.globalRechargeAccess || false;
  const hasVoipAccess = (permissions as any)?.voipServiceAccess || false;
  const hasAttAccess = (attPermissions as any)?.canActivate || (attPermissions as any)?.canRecharge || (attPermissions as any)?.canSimSwap || (attPermissions as any)?.canSellDataAddons || (attPermissions as any)?.canPortIn || (attPermissions as any)?.canEnableWifiCalling || false;

  // Debug permission states
  console.log('🔍 Permission states:', {
    user: user?.id,
    permissionsLoading,
    walletPermissions: !!walletPermissions,
    retailerPermissions: !!retailerPermissions,
    attPermissions: !!attPermissions,
    hasAttAccess
  });

  const { data: userTransactions } = useQuery({
    queryKey: ["/api/transactions/user", user?.id],
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Retailer Portal
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Welcome back, {user?.username}! Manage your services and customers</p>
            </div>
            <div className="text-left sm:text-right min-w-0 flex-shrink-0">
              <div className="text-sm text-gray-500">Portal Balance</div>
              <div className="flex items-center justify-start sm:justify-end gap-3">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">${user?.balance || "0.00"}</div>
                <Link href="/retailer/wallet">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white min-h-[36px]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Funds
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Retailer Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 truncate">Today's Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    $0.00
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
                  <p className="text-sm font-medium text-gray-600 truncate">Total Transactions</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {(userTransactions as any)?.length || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 truncate">Active Services</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {[hasNexitelAccess, hasUSARechargeAccess, hasGlobalRechargeAccess, hasVoipAccess, hasAttAccess].filter(Boolean).length}
                  </p>
                </div>
                <div className="bg-purple-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 truncate">Current Balance</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    ${user?.balance || "0.00"}
                  </p>
                </div>
                <div className="bg-orange-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Service Groups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8 items-stretch">
          
          {/* Loading state */}
          {permissionsLoading && (
            <Card className="col-span-full bg-white shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading your services...</p>
              </CardContent>
            </Card>
          )}

          {/* No permissions message */}
          {!permissionsLoading && !hasNexitelAccess && !hasUSARechargeAccess && !hasGlobalRechargeAccess && !hasVoipAccess && !hasAttAccess && (
            <Card className="col-span-full bg-yellow-50 border-yellow-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="bg-yellow-100 p-3 rounded-full inline-block">
                    <Crown className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Access Pending</h3>
                <p className="text-gray-600 mb-4">
                  Your account is being set up. Please contact your administrator to enable service access.
                </p>
                <div className="text-sm text-gray-500">
                  <p>Services available upon approval:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Nexitel Services (Activation, Recharge, SIM Swap)</li>
                    <li>• USA Carriers (Domestic Recharge)</li>  
                    <li>• Global Recharge (International Top-up)</li>
                    <li>• VoIP Services (NexiPhone Activation)</li>
                    <li>• AT&T Services (Activation, Recharge, Data Add-ons)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nexitel Services Group */}
          {!permissionsLoading && hasNexitelAccess && (
          <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
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
                  <Globe className="w-4 h-4 mr-2" />
                  Data Add-ons
                </Button>
              </Link>
              <Link href="/nexitel-sim-swap">
                <Button variant="ghost" className="w-full justify-start text-blue-800 hover:bg-blue-100 text-sm py-2">
                  <Phone className="w-4 h-4 mr-2" />
                  SIM Swap
                </Button>
              </Link>
              <Link href="/nexitel-port-status">
                <Button variant="ghost" className="w-full justify-start text-blue-800 hover:bg-blue-100 text-sm py-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Port-In Status
                </Button>
              </Link>
              <Link href="/nexitel-activation-report">
                <Button variant="ghost" className="w-full justify-start text-blue-800 hover:bg-blue-100 text-sm py-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
          )}

          {/* NexiPhone Services Group */}
          {!permissionsLoading && hasVoipAccess && (
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
                  <Globe className="w-4 h-4 mr-2" />
                  Mobile Apps
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start text-purple-800 hover:bg-purple-100 text-sm py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </CardContent>
          </Card>
          )}

          {/* USA Carriers Services Group */}
          {!permissionsLoading && hasUSARechargeAccess && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-bold text-blue-900">USA Carriers</CardTitle>
              <CardDescription className="text-blue-700">Domestic US mobile carriers & services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
              <Link href="/usa-recharge">
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
          )}

          {/* AT&T Services Group */}
          {!permissionsLoading && hasAttAccess && (
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold text-red-900">AT&T</CardTitle>
              <CardDescription className="text-red-700">Complete AT&T wireless service management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
              <Link href="/att-activation">
                <Button variant="ghost" className="w-full justify-start text-red-800 hover:bg-red-100 text-sm py-2">
                  <Smartphone className="w-4 h-4 mr-2" />
                  New Activation
                </Button>
              </Link>
              <Link href="/att-recharge">
                <Button variant="ghost" className="w-full justify-start text-red-800 hover:bg-red-100 text-sm py-2">
                  <Zap className="w-4 h-4 mr-2" />
                  Recharge
                </Button>
              </Link>
              <Link href="/att-data-addons">
                <Button variant="ghost" className="w-full justify-start text-red-800 hover:bg-red-100 text-sm py-2">
                  <Globe className="w-4 h-4 mr-2" />
                  Data Add-ons
                </Button>
              </Link>
              <Link href="/att-port-in">
                <Button variant="ghost" className="w-full justify-start text-red-800 hover:bg-red-100 text-sm py-2">
                  <Phone className="w-4 h-4 mr-2" />
                  Port-In Status
                </Button>
              </Link>
              <Link href="/att-sim-swap">
                <Button variant="ghost" className="w-full justify-start text-red-800 hover:bg-red-100 text-sm py-2">
                  <Phone className="w-4 h-4 mr-2" />
                  SIM Swap
                </Button>
              </Link>
              <Link href="/att-reports">
                <Button variant="ghost" className="w-full justify-start text-red-800 hover:bg-red-100 text-sm py-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
          )}

          {/* Global Recharge Services Group */}
          {!permissionsLoading && hasGlobalRechargeAccess && (
          <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl font-bold text-green-900">Global Recharge</CardTitle>
              <CardDescription className="text-green-700">International mobile top-up services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
              <Link href="/global-recharge">
                <Button variant="ghost" className="w-full justify-start text-green-800 hover:bg-green-100 text-sm py-2">
                  <Globe className="w-4 h-4 mr-2" />
                  International Recharge
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start text-green-800 hover:bg-green-100 text-sm py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="ghost" className="w-full justify-start text-green-800 hover:bg-green-100 text-sm py-2">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </Button>
            </CardContent>
          </Card>
          )}
        </div>

        {/* Retailer Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Quick Actions */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <Link href="/retailer/transactions">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm py-3">
                    <FileText className="w-4 h-4 mr-2" />
                    Transaction History
                  </Button>
                </Link>
                <Link href="/retailer/wallet">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-sm py-3">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Wallet Funding
                  </Button>
                </Link>
                <Link href="/retailer/reports">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm py-3">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Daily Reports
                  </Button>
                </Link>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-sm py-3">
                  <Users className="w-4 h-4 mr-2" />
                  Customer Support
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {userTransactions && (userTransactions as any).length > 0 ? (
                <div className="space-y-3">
                  {(userTransactions as any).slice(0, 5).map((transaction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium">{transaction.country} - {transaction.carrier}</p>
                          <p className="text-gray-500">{transaction.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${transaction.amount}</p>
                        <p className="text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent transactions</p>
                  <p className="text-sm">Start processing recharges to see activity here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}