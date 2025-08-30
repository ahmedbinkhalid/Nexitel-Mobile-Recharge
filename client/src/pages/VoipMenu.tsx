import { Phone, Users, ArrowRight, ChevronRight, Download, Smartphone } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VoipMenu() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Phone className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">VoIP Services</h1>
                <p className="text-sm text-gray-500">Business phone system management</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Nexiphone App Downloads */}
          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-blue-700">
                <Download className="w-6 h-6 mr-2" />
                Nexiphone Apps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Download the Nexiphone mobile apps for iOS and Android to manage VoIP services on the go.
              </p>
              <div className="space-y-3">
                <a 
                  href="https://apps.apple.com/app/nexiphone" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mr-3">
                      <Smartphone className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Download on the</div>
                      <div className="text-lg font-bold">App Store</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </a>
                
                <a 
                  href="https://play.google.com/store/apps/details?id=com.nexitel.nexiphone" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mr-3">
                      <Smartphone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Get it on</div>
                      <div className="text-lg font-bold">Google Play</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">App Features:</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2" />
                    Make & receive calls
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2" />
                    Manage VoIP numbers
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2" />
                    Check call history
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-3 h-3 mr-2" />
                    Account management
                  </div>
                </div>
              </div>
              
              <Link href="/nexiphone-apps">
                <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                  View More Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

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


        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}