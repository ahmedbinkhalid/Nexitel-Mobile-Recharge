import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Activity, TrendingUp } from "lucide-react";
import { ActivitySearch } from "@/components/ActivitySearch";
import { useAuth } from "@/components/AuthProvider";

export default function ActivityManagement() {
  const { user } = useAuth();

  // Get basic statistics for dashboard (mocked for now)
  const stats = {
    totalActivations: 0,
    totalRecharges: 0,
    pendingCount: 0,
    totalCommissions: '0.00'
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Please log in to access activity management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Management</h1>
          <p className="text-muted-foreground mt-1">
            Search activations and recharges
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Access
        </Badge>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalActivations || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Activations</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalRecharges || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Recharges</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.pendingCount || 0}</div>
                  <div className="text-sm text-muted-foreground">Pending Items</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">${stats.totalCommissions || '0.00'}</div>
                  <div className="text-sm text-muted-foreground">Total Commissions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Search - Main Content */}
      <ActivitySearch userRole={user.role as 'admin' | 'employee' | 'retailer'} />

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Quick Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Activity Search</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Search by ICCID to find all related activations and recharges</li>
                <li>• Search by mobile number to track customer history</li>
                <li>• Use email or customer name for broader searches</li>
                <li>• Apply filters for service type, status, and date ranges</li>
                <li>• Export search results to CSV for offline analysis</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Download Reports</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Use the dedicated "Download Reports" page for comprehensive reporting</li>
                <li>• Generate daily, monthly, and custom date range reports</li>
                <li>• Download in CSV or JSON format for analysis</li>
                <li>• Access wallet transactions, recharge history, and retailer performance</li>
                <li>• Find Reports in the main navigation sidebar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}