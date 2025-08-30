import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Smartphone, CreditCard, FileText, Users, RefreshCw, Router, Upload, Wifi } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function NexitelMenu() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  const handleBackToDashboard = () => {
    // Force a full page navigation to ensure authentication persists
    window.location.href = "/retailer/dashboard";
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  if (!isAuthenticated || !user || user.role !== "retailer") {
    return <div>Access denied. Please log in again.</div>;
  }

  const services = [
    {
      title: "New Activation",
      description: "Activate new Nexitel services for customers",
      icon: Users,
      href: "/nexitel-activation",
      color: "blue"
    },
    {
      title: "Recharge",
      description: "Top-up Nexitel Purple and Blue services",
      icon: CreditCard,
      href: "/nexitel-recharge",
      color: "green"
    },
    {
      title: "Recharge Report",
      description: "View recharge transaction history and analytics",
      icon: FileText,
      href: "/nexitel-recharge-report",
      color: "purple"
    },
    {
      title: "Activation Report",
      description: "Track activation records and customer data",
      icon: FileText,
      href: "/nexitel-activation-report",
      color: "indigo"
    },
    {
      title: "SIM Swap",
      description: "Replace damaged or lost SIM cards",
      icon: RefreshCw,
      href: "/nexitel-sim-swap",
      color: "orange"
    },
    {
      title: "Port-In Status",
      description: "Track number porting requests and progress",
      icon: Router,
      href: "/nexitel-port-status",
      color: "teal"
    },
    {
      title: "Bulk Activation",
      description: "Upload CSV file for Nexitel Blue/Purple batch activations",
      icon: Upload,
      href: "/nexitel-bulk-activation",
      color: "pink"
    },
    {
      title: "WiFi Calling Enable",
      description: "Enable WiFi calling services for Nexitel customers with emergency address",
      icon: Wifi,
      href: "/nexitel-wifi-calling",
      color: "cyan"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: any = {
      blue: "border-blue-100 hover:border-blue-200 hover:bg-blue-50",
      green: "border-green-100 hover:border-green-200 hover:bg-green-50",
      purple: "border-purple-100 hover:border-purple-200 hover:bg-purple-50",
      indigo: "border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50",
      orange: "border-orange-100 hover:border-orange-200 hover:bg-orange-50",
      teal: "border-teal-100 hover:border-teal-200 hover:bg-teal-50",
      pink: "border-pink-100 hover:border-pink-200 hover:bg-pink-50",
      cyan: "border-cyan-100 hover:border-cyan-200 hover:bg-cyan-50"
    };
    return colors[color] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors: any = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      indigo: "bg-indigo-100 text-indigo-600",
      orange: "bg-orange-100 text-orange-600",
      teal: "bg-teal-100 text-teal-600",
      pink: "bg-pink-100 text-pink-600",
      cyan: "bg-cyan-100 text-cyan-600"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-4" 
                type="button"
                onClick={handleBackToDashboard}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Nexitel Activation</h1>
                  <p className="text-sm text-gray-600">Complete wireless service management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Link key={index} href={service.href}>
                <Card className={`hover:shadow-md transition-all duration-200 cursor-pointer ${getColorClasses(service.color)}`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${getIconColorClasses(service.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-center text-sm">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}