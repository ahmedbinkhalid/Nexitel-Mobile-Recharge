import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Store, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function UserManagement() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage employees, retailers, and user accounts
          </p>
        </div>
        <Users className="w-8 h-8 text-blue-600" />
      </div>

      {/* Management Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Employee Management */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-green-600" />
              Employee Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage employee accounts, roles, and permissions. Create new employee accounts and assign specific roles like accountant or technical support.
            </p>
            <Link href="/admin/employees">
              <Button className="w-full">
                Manage Employees
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Retailer Management */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="w-5 h-5 mr-2 text-purple-600" />
              Retailer Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage retailer accounts, portal balances, and commission group assignments. Set commission groups and monitor retailer activity.
            </p>
            <Link href="/admin/retailers">
              <Button className="w-full">
                Manage Retailers
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats or Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>User Management Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-green-700">Employees</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create and manage employee accounts</li>
                <li>• Assign roles (accountant, technical support)</li>
                <li>• Control permissions and access levels</li>
                <li>• Monitor employee activity</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-700">Retailers</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create and manage retailer accounts</li>
                <li>• Assign commission groups (A, B, C)</li>
                <li>• Set portal balances and credit limits</li>
                <li>• Monitor transaction activity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}