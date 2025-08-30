import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smartphone, 
  Wifi, 
  Globe, 
  ArrowLeftRight, 
  Plus, 
  Zap, 
  FileUp, 
  BarChart3, 
  Settings,
  ArrowLeft,
  Phone,
  Shield,
  Database,
  FileSpreadsheet
} from "lucide-react";
import { type User } from "@shared/schema";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";

export default function ATTServices() {
  const [activeTab, setActiveTab] = useState<string>("activation");
  const { user } = useAuth();

  const services = [
    {
      id: "activation",
      title: "AT&T Activation",
      description: "Activate new AT&T services with international, roaming, and data options",
      icon: <Smartphone className="h-8 w-8" />,
      color: "bg-blue-100 text-blue-800",
      features: ["International Countries", "Roaming Options", "Data Add-ons", "Port-in Support", "WiFi Calling"]
    },
    {
      id: "recharge", 
      title: "AT&T Recharge",
      description: "Recharge existing AT&T services",
      icon: <Zap className="h-8 w-8" />,
      color: "bg-green-100 text-green-800",
      features: ["Plan Renewal", "Commission Tracking", "Real-time Processing"]
    },
    {
      id: "sim-swap",
      title: "SIM Swap",
      description: "Replace damaged or lost SIM cards",
      icon: <ArrowLeftRight className="h-8 w-8" />,
      color: "bg-orange-100 text-orange-800",
      features: ["Physical to eSIM", "eSIM to Physical", "Damage Replacement", "Security Verification"]
    },
    {
      id: "data-addons",
      title: "Data Add-ons",
      description: "Sell additional data packages to customers",
      icon: <Database className="h-8 w-8" />,
      color: "bg-purple-100 text-purple-800",
      features: ["1GB - 50GB Options", "Multiple Validity Periods", "Instant Activation"]
    },
    {
      id: "bulk-operations",
      title: "Bulk Operations",
      description: "Process multiple activations via CSV upload",
      icon: <FileUp className="h-8 w-8" />,
      color: "bg-indigo-100 text-indigo-800",
      features: ["CSV Upload", "Batch Processing", "Error Reports", "Progress Tracking"]
    },
    {
      id: "wifi-calling",
      title: "WiFi Calling",
      description: "Enable WiFi calling for customers",
      icon: <Wifi className="h-8 w-8" />,
      color: "bg-teal-100 text-teal-800",
      features: ["Emergency Address Setup", "Individual Activation", "Bulk Enablement"]
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      description: "View activation and recharge reports",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "bg-gray-100 text-gray-800",
      features: ["Activation Reports", "Recharge Analytics", "Performance Metrics", "Export Data"]
    },
    {
      id: "retailer-permissions",
      title: "Retailer Permissions",
      description: "Manage retailer AT&T service permissions",
      icon: <Shield className="h-8 w-8" />,
      color: "bg-red-100 text-red-800",
      features: ["Permission Control", "Daily Limits", "Service Access", "Security Management"]
    }
  ];

  const currentService = services.find(s => s.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={user?.role === 'retailer' ? '/retailer/dashboard' : '/admin'}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AT&T Services</h1>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive AT&T activation and management suite</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Admin Only
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
          {services.map((service) => (
            <TabsTrigger 
              key={service.id} 
              value={service.id}
              className="flex flex-col gap-1 p-3 h-16"
            >
              {service.icon}
              <span className="text-xs">{service.title.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Service Overview Card */}
        {currentService && (
          <Card className="mb-6 border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${currentService.color}`}>
                    {currentService.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{currentService.title}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">{currentService.description}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentService.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="activation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                AT&T Activation Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/admin/att-activation">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold">New Activation</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Activate new AT&T service</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/admin/att-port-in">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-semibold">Port-in Activation</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Port number from another carrier</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/att-international">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Globe className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h3 className="font-semibold">International Plans</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Activate with international options</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recharge">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AT&T Recharge Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="h-16 w-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold mb-2">Recharge AT&T Services</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Recharge existing AT&T accounts with various plan options
                </p>
                <Link href="/admin/att-recharge">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Start Recharge
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sim-swap">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" />
                SIM Swap Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ArrowLeftRight className="h-16 w-16 mx-auto mb-4 text-orange-600" />
                <h3 className="text-xl font-semibold mb-2">SIM Swap & Replacement</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Replace damaged, lost, or upgrade SIM cards
                </p>
                <Link href="/admin/att-sim-swap">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Process SIM Swap
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-addons">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Add-on Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/admin/att-data-addons">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Database className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h3 className="font-semibold">Sell Data Add-on</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Add data to existing plans</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <h3 className="font-semibold text-gray-400">Data Usage Reports</h3>
                    <p className="text-sm text-gray-400">Track data consumption (Coming Soon)</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
                  <CardContent className="p-6 text-center">
                    <Settings className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <h3 className="font-semibold text-gray-400">Data Plan Management</h3>
                    <p className="text-sm text-gray-400">Manage data allocations (Coming Soon)</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Available Data Add-ons</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="font-semibold text-purple-700 dark:text-purple-400">1GB</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">$10</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-700 dark:text-purple-400">5GB</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">$40</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-700 dark:text-purple-400">10GB</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">$70</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-700 dark:text-purple-400">25GB</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">$150</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-operations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/admin/att-activation">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                      <h3 className="font-semibold">Bulk Activation</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Access bulk activation via AT&T activation page</p>
                      <Badge className="mt-2 bg-green-100 text-green-800">Available</Badge>
                    </CardContent>
                  </Card>
                </Link>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
                  <CardContent className="p-6 text-center">
                    <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <h3 className="font-semibold text-gray-400">Bulk SIM Swap</h3>
                    <p className="text-sm text-gray-400">Process multiple SIM swaps via CSV</p>
                    <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Bulk Operation Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">✓</Badge>
                      <span className="text-sm">CSV Template Downloads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">✓</Badge>
                      <span className="text-sm">Real-time Progress Tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">✓</Badge>
                      <span className="text-sm">Error Reporting & Validation</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">✓</Badge>
                      <span className="text-sm">Batch Processing (up to 1000)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">✓</Badge>
                      <span className="text-sm">Success/Failure Analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">✓</Badge>
                      <span className="text-sm">Employee ID Verification</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wifi-calling">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                WiFi Calling Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Wifi className="h-16 w-16 mx-auto mb-4 text-teal-600" />
                <h3 className="text-xl font-semibold mb-2">Enable WiFi Calling</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Set up WiFi calling with emergency address
                </p>
                <Link href="/admin/att-wifi-calling">
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    Enable WiFi Calling
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Reports & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/att-activation-report">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold">Activation Report</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">View activation history</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/admin/att-recharge-report">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Zap className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-semibold">Recharge Report</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">View recharge analytics</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retailer-permissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Retailer AT&T Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-16 w-16 mx-auto mb-4 text-red-600" />
                <h3 className="text-xl font-semibold mb-2">Manage Retailer Permissions</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Control retailer access to AT&T services
                </p>
                <Link href="/admin/att-retailer-permissions">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Manage Permissions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}