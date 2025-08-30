import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Globe, CreditCard, FileText, DollarSign } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function GlobalMenu() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Fetch fresh user data to get updated balance
  const { data: freshUser } = useQuery({
    queryKey: [`/api/users/${user?.id}`],
    enabled: !!user?.id,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Use fresh user data if available, otherwise fall back to auth user
  const currentUser = freshUser || user;

  const handleBackToDashboard = () => {
    // Force a full page navigation to ensure authentication persists
    window.location.href = "/retailer/dashboard";
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  if (!isAuthenticated || !user || user.role !== "retailer") {
    return <div>Access denied. Please log in again.</div>;
  }

  const services = [
    {
      title: "Mobile Recharge",
      description: "International mobile phone top-up services worldwide",
      icon: CreditCard,
      href: "/nexitel-recharge",
      color: "green"
    },
    {
      title: "Transaction History",
      description: "View your global recharge transaction history and reports",
      icon: FileText,
      href: "/retailer/transactions",
      color: "blue"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: any = {
      green: "border-green-100 hover:border-green-200 hover:bg-green-50",
      blue: "border-blue-100 hover:border-blue-200 hover:bg-blue-50"
    };
    return colors[color] || colors.green;
  };

  const getIconColorClasses = (color: string) => {
    const colors: any = {
      green: "bg-green-100 text-green-600",
      blue: "bg-blue-100 text-blue-600"
    };
    return colors[color] || colors.green;
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
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Global Recharge</h1>
                  <p className="text-sm text-gray-600">International mobile phone top-up services</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Account Balance
                  </div>
                  <div className="text-lg font-semibold text-green-600">${(currentUser as any)?.balance || "0.00"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index}
                className={`hover:shadow-lg transition-all duration-200 cursor-pointer h-full ${getColorClasses(service.color)}`}
                onClick={() => window.location.href = service.href}
              >
                <CardHeader className="text-center pb-6">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 ${getIconColorClasses(service.color)}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-8">
                  <CardDescription className="text-center">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Recharge Features</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">Worldwide Coverage</h4>
              <p className="text-sm text-gray-600 mt-1">Support for 6 regions and 100+ countries</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900">Instant Processing</h4>
              <p className="text-sm text-gray-600 mt-1">Real-time mobile top-up processing</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">Detailed Reports</h4>
              <p className="text-sm text-gray-600 mt-1">Complete transaction history and analytics</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}