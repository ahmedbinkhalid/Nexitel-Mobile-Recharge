import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Download, 
  Smartphone, 
  ChevronRight, 
  Star, 
  Users, 
  Shield, 
  Zap,
  Phone,
  MessageSquare,
  Settings,
  BarChart3,
  ArrowRight,
  Plus
} from "lucide-react";

export default function NexiphoneApps() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [, setLocation] = useLocation();

  const handleBackNavigation = () => {
    if (user?.role === "retailer") {
      setLocation("/retailer/dashboard");
    } else if (user?.role === "employee") {
      setLocation("/employee/dashboard");
    } else if (user?.role === "admin") {
      setLocation("/admin");
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={handleBackNavigation}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Phone className="w-8 h-8 text-blue-600 mr-3" />
                NexiPhone VoIP Services
              </h1>
              <p className="text-gray-600 mt-2">Complete VoIP solution: mobile apps, activation & service management</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Star className="w-3 h-3 mr-1" />
                4.8 Rating
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Users className="w-3 h-3 mr-1" />
                50K+ Downloads
              </Badge>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="voip-services">VoIP Services</TabsTrigger>
            <TabsTrigger value="download">Download</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* App Overview */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-700">
                    <Smartphone className="w-6 h-6 mr-2" />
                    Nexiphone for Business
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Transform your smartphone into a powerful business communication tool. 
                    Nexiphone delivers crystal-clear VoIP calls, advanced call management, 
                    and seamless integration with your business workflow.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Shield className="w-4 h-4 text-green-600 mr-2" />
                      <span>Enterprise-grade security & encryption</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Zap className="w-4 h-4 text-orange-600 mr-2" />
                      <span>HD voice quality with noise cancellation</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-blue-600 mr-2" />
                      <span>Multiple VoIP number management</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <BarChart3 className="w-4 h-4 text-purple-600 mr-2" />
                      <span>Real-time analytics & call reporting</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What's New</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <div className="font-medium text-sm">Version 2.1.0</div>
                      <div className="text-sm text-gray-600">Enhanced call quality and stability improvements</div>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <div className="font-medium text-sm">New Features</div>
                      <div className="text-sm text-gray-600">Added conference calling and call recording</div>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <div className="font-medium text-sm">UI Updates</div>
                      <div className="text-sm text-gray-600">Redesigned interface for better user experience</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-8">
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-700 text-lg">
                    <Phone className="w-5 h-5 mr-2" />
                    Call Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2 text-blue-500" />
                    Make & receive VoIP calls
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2 text-blue-500" />
                    Call forwarding & transfer
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2 text-blue-500" />
                    Conference calling (up to 10 participants)
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2 text-blue-500" />
                    Call recording & playback
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700 text-lg">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Messaging & SMS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2 text-green-500" />
                    Send & receive SMS messages
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2 text-green-500" />
                    Group messaging support
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2 text-green-500" />
                    Message templates & auto-replies
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2 text-green-500" />
                    Rich media attachments
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-700 text-lg">
                    <Settings className="w-5 h-5 mr-2" />
                    Account Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2 text-purple-500" />
                    Multiple VoIP number management
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2 text-purple-500" />
                    Usage analytics & reports
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2 text-purple-500" />
                    Contact sync & management
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2 text-purple-500" />
                    Custom ringtones & notifications
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Technical Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium mb-3">iOS Requirements</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>• iOS 12.0 or later</div>
                      <div>• Compatible with iPhone, iPad, and iPod touch</div>
                      <div>• 50MB storage space</div>
                      <div>• Wi-Fi or cellular data connection</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Android Requirements</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>• Android 6.0 (API level 23) or higher</div>
                      <div>• 45MB storage space</div>
                      <div>• Microphone and speaker permissions</div>
                      <div>• Internet connection required</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voip-services" className="space-y-8">
            {/* VoIP Services Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* VoIP Activation */}
              <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-orange-700">
                    <Phone className="w-6 h-6 mr-2" />
                    VoIP Activation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Set up individual VoIP phone services for customers with automatic email notifications and setup instructions.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mr-2 text-orange-500" />
                      Choose from available VoIP plans
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mr-2 text-orange-500" />
                      Generate phone numbers automatically
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mr-2 text-orange-500" />
                      Send setup instructions via email
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mr-2 text-orange-500" />
                      Commission-based earnings
                    </div>
                  </div>
                  <Link href="/voip-activation">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 mt-4">
                      Start VoIP Activation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Bulk VoIP Activation */}
              <Card className="border-amber-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-amber-700">
                    <Users className="w-6 h-6 mr-2" />
                    Bulk VoIP Activation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Process multiple VoIP activations at once with CSV export capabilities and bulk email notifications.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mr-2 text-amber-500" />
                      Activate multiple lines simultaneously
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mr-2 text-amber-500" />
                      Export activation data to CSV
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mr-2 text-amber-500" />
                      Bulk email notifications
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mr-2 text-amber-500" />
                      Streamlined workflow
                    </div>
                  </div>
                  <Link href="/voip-bulk-activation">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 mt-4">
                      Start Bulk Activation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* VoIP Analytics */}
              <Card className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-purple-700">
                    <BarChart3 className="w-6 h-6 mr-2" />
                    VoIP Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Track VoIP service performance, usage patterns, and revenue analytics for better business insights.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mr-2 text-purple-500" />
                      Active line monitoring
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mr-2 text-purple-500" />
                      Revenue tracking
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mr-2 text-purple-500" />
                      Usage statistics
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mr-2 text-purple-500" />
                      Performance reports
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4" disabled>
                    Coming Soon
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* VoIP Service Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active VoIP Lines</p>
                      <p className="text-2xl font-bold text-orange-600">247</p>
                    </div>
                    <Phone className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-amber-600">89</p>
                    </div>
                    <Users className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-green-600">$2,847</p>
                    </div>
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="download">
            {/* Download Section */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mr-3">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    iOS App Store
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Download Nexiphone for iPhone and iPad from the official App Store.
                  </p>
                  
                  <a 
                    href="https://apps.apple.com/app/nexiphone" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                          <Smartphone className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <div className="text-sm">Download on the</div>
                          <div className="text-xl font-bold">App Store</div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </a>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Version 2.1.0</span>
                    <span>45.2 MB</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span>4.8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-3">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    Google Play Store
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Get Nexiphone for Android devices from Google Play Store.
                  </p>
                  
                  <a 
                    href="https://play.google.com/store/apps/details?id=com.nexitel.nexiphone" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                          <Smartphone className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm">Get it on</div>
                          <div className="text-xl font-bold">Google Play</div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </a>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Version 2.1.0</span>
                    <span>42.8 MB</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span>4.9</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Installation Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Installation & Setup Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium mb-3 text-blue-700">For iOS Users</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
                        <span className="text-sm">Open the App Store on your iPhone or iPad</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
                        <span className="text-sm">Search for "Nexiphone" or use the download link</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
                        <span className="text-sm">Tap "Get" to download and install the app</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">4</span>
                        <span className="text-sm">Open the app and sign in with your VoIP credentials</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 text-green-700">For Android Users</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
                        <span className="text-sm">Open Google Play Store on your Android device</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
                        <span className="text-sm">Search for "Nexiphone" or use the download link</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
                        <span className="text-sm">Tap "Install" to download the app</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">4</span>
                        <span className="text-sm">Launch the app and configure your VoIP settings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}