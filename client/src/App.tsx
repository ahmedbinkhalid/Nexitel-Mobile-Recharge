import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/AuthProvider";

import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import NexitelActivation from "@/pages/NexitelActivation";
import NexitelRecharge from "@/pages/NexitelRecharge";
import ATTRechargeSimple from "@/pages/ATTRechargeSimple";

import NexitelActivationReport from "@/pages/NexitelActivationReport";
import NexitelRechargeReport from "@/pages/NexitelRechargeReport";
import NexitelSimSwap from "@/pages/NexitelSimSwap";

import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";

import AdminDashboard from "@/pages/admin/Dashboard";
import RetailerDashboard from "@/pages/retailer/Dashboard";
import RetailerTransactions from "@/pages/retailer/RetailerTransactions";
import TransactionTest from "@/pages/retailer/TransactionTest";
import BulkActivation from "@/pages/retailer/BulkActivation";
import WiFiEnable from "@/pages/retailer/WiFiEnable";
import NexitelMenu from "@/pages/retailer/NexitelMenu";
import GlobalMenu from "@/pages/retailer/GlobalMenu";
import AdminRecharge from "@/pages/admin/Recharge";
import GlobalRecharge from "@/pages/admin/GlobalRecharge";
import USARecharge from "@/pages/USARecharge";

import EmployeeManagement from "@/pages/admin/EmployeeManagement";
import RetailerManagement from "@/pages/admin/RetailerManagement";
import UserManagement from "@/pages/admin/UserManagement";
import Analytics from "@/pages/admin/Analytics";
import Reports from "@/pages/admin/Reports";
import SystemSettings from "@/pages/admin/SystemSettings";
import PlanManagement from "@/pages/admin/PlanManagement";
import CommissionManagement from "@/pages/admin/CommissionManagement";
import CommissionGroupManagement from "@/pages/admin/CommissionGroupManagement";
import FundManagement from "@/pages/admin/FundManagement";
import EmployeeDashboard from "@/pages/employee/Dashboard";
import VoipActivation from "@/pages/VoipActivation";
import VoipBulkActivation from "@/pages/VoipBulkActivation";
import VoipMenu from "@/pages/VoipMenu";
import NexiphoneApps from "@/pages/NexiphoneApps";
import WalletFunding from "@/pages/WalletFunding";
import RetailerPermissions from "@/pages/admin/RetailerPermissions";

import WifiCallingActivation from "@/pages/WifiCallingActivation";
import NexitelBulkActivation from "@/pages/NexitelBulkActivation";
import NexitelWifiCalling from "@/pages/NexitelWifiCalling";
import ActivityManagement from "@/pages/ActivityManagement";
import ATTServices from "@/pages/admin/ATTServices";
import ATTActivation from "@/pages/admin/ATTActivation";
import ATTDataAddons from "@/pages/admin/ATTDataAddons";
import ATTPortInStatus from "@/pages/admin/ATTPortInStatus";
import ATTSimSwap from "@/pages/admin/ATTSimSwap";
import ATTReports from "@/pages/admin/ATTReports";
import ProfitPayouts from "@/pages/admin/ProfitPayouts";

import NexitelDataAddons from "@/pages/nexitel/DataAddons";
import NexitelPortStatusNew from "@/pages/nexitel/PortStatus";
import NexitelBulkActivationNew from "@/pages/nexitel/BulkActivation";

import NotFound from "@/pages/not-found";

function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: string[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Show loading while checking authentication
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }
  
  if (!isAuthenticated || !user) {
    return <Login />;
  }
  
  // Redirect users to their appropriate dashboard if they access root after login
  if (window.location.pathname === "/" && user) {
    if (user.role === "admin") {
      window.location.href = "/admin";
    } else if (user.role === "employee") {
      window.location.href = "/employee/dashboard";
    } else if (user.role === "retailer") {
      window.location.href = "/retailer/dashboard";
    }
    return null;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <NotFound />;
  }
  
  return <>{children}</>;
}

function ConditionalLayout({ children, isPublic = false }: { children: React.ReactNode; isPublic?: boolean }) {
  if (isPublic) {
    return <>{children}</>;
  }
  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/">
        <ConditionalLayout isPublic>
          <Home />
        </ConditionalLayout>
      </Route>
      <Route path="/nexitel-activation">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer", "customer"]}>
            <NexitelActivation />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/nexitel-recharge">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer", "customer"]}>
            <NexitelRecharge />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/att-activation">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <ATTActivation />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/att-recharge">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer", "customer"]}>
            <ATTRechargeSimple />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/att-data-addons">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <ATTDataAddons />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/att-reports">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <ATTReports />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/att-port-in">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <ATTPortInStatus />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/att-sim-swap">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <ATTSimSwap />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/usa-recharge">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <USARecharge />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/nexitel-activation-report">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <NexitelActivationReport />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/nexitel-recharge-report">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <NexitelRechargeReport />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/nexitel-sim-swap">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <NexitelSimSwap />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/nexitel-port-status">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <NexitelPortStatusNew />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/login">
        <ConditionalLayout isPublic>
          <Login />
        </ConditionalLayout>
      </Route>
      <Route path="/forgot-password">
        <ConditionalLayout isPublic>
          <ForgotPassword />
        </ConditionalLayout>
      </Route>
      <Route path="/retailer/dashboard">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["retailer"]}>
            <RetailerDashboard />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/retailer/transactions">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["retailer"]}>
            <RetailerTransactions />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/retailer/wallet">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["retailer"]}>
            <WalletFunding />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/retailer/reports">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["retailer"]}>
            <RetailerTransactions />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/retailer/test">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["retailer"]}>
            <TransactionTest />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/retailer/bulk-activation">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["retailer"]}>
            <BulkActivation />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/retailer/wifi-enable">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["retailer"]}>
            <WiFiEnable />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/retailer/nexitel-menu">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["retailer"]}>
            <NexitelMenu />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/retailer/global-menu">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["retailer"]}>
            <GlobalMenu />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/global-menu">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <GlobalMenu />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/global-recharge">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <NexitelRecharge />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/dashboard">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/recharge">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminRecharge />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/global-recharge">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <GlobalRecharge />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/usa-recharge">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <USARecharge />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/retailer/usa-recharge">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["retailer"]}>
            <USARecharge />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/users">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/user-management">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/employees">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <EmployeeManagement />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/retailers">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <RetailerManagement />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/analytics">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <Analytics />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      
      <Route path="/admin/reports">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <Reports />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/plan-management">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <PlanManagement />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/att-services">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <ATTServices />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/att-activation">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <ATTActivation />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/att-data-addons">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <ATTDataAddons />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>

      <Route path="/admin/att-recharge">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <ATTRechargeSimple />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/commission-management">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <CommissionManagement />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/commission-group-management">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <CommissionGroupManagement />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/retailer-permissions">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <RetailerPermissions />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>

      <Route path="/admin/settings">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <SystemSettings />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/bulk-activation">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <BulkActivation />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/wifi-enable">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <WiFiEnable />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/admin/fund-management">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <FundManagement />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>

      <Route path="/admin/profit-payouts">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <ProfitPayouts />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      
      {/* Employee Routes */}
      <Route path="/employee">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/employee/dashboard">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      
      {/* VoIP Routes */}
      <Route path="/voip-menu">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <VoipMenu />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/voip-activation">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <VoipActivation />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/voip-bulk-activation">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <VoipBulkActivation />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/nexiphone-apps">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <NexiphoneApps />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/wifi-calling-activation">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <WifiCallingActivation />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>

      <Route path="/nexitel-wifi-calling">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <NexitelWifiCalling />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/nexitel-bulk-activation">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <NexitelBulkActivation />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      <Route path="/nexitel-data-addons">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <NexitelDataAddons />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>


      {/* Activity Management Route */}
      <Route path="/activity-management">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["admin", "employee", "retailer"]}>
            <ActivityManagement />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      
      {/* Retailer Routes */}
      <Route path="/retailer">
        <ConditionalLayout>
          <ProtectedRoute allowedRoles={["retailer"]}>
            <RetailerDashboard />
          </ProtectedRoute>
        </ConditionalLayout>
      </Route>
      

      
      {/* Dashboard Route - Redirect based on role */}
      <Route path="/dashboard">
        <ConditionalLayout>
          <RoleBasedRedirect />
        </ConditionalLayout>
      </Route>
      
      {/* Fallback */}
      <Route>
        <ConditionalLayout isPublic>
          <NotFound />
        </ConditionalLayout>
      </Route>
    </Switch>
  );
}

function RoleBasedRedirect() {
  const { user } = useAuth();
  
  if (!user) return <Login />;
  
  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "employee":
      return <EmployeeDashboard />;
    case "retailer":
      return <RetailerDashboard />;

    default:
      return <NotFound />;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
