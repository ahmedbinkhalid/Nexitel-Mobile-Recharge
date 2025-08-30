import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Globe, CreditCard, History, Phone, Zap } from "lucide-react";
import { redirectToMainDomain } from "@/lib/subdomain";

// Import countries data
import { COUNTRIES } from "@shared/countries";

export default function CustomerPortal() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");

  // For now, we'll use mock carriers since the countries data structure doesn't include carriers
  const carriers = selectedCountry ? ["Carrier 1", "Carrier 2", "Carrier 3"] : [];

  const handleStaffLogin = () => {
    redirectToMainDomain('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Smartphone className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Mobile Recharge Portal</h1>
            </div>
            <Button variant="outline" onClick={handleStaffLogin} className="text-sm">
              Staff Login
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Instant Mobile Recharge
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Top up your phone anywhere in the world. Fast, secure, and reliable.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-green-500" />
              180+ Countries
            </div>
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Instant Delivery
            </div>
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
              Secure Payment
            </div>
          </div>
        </div>

        {/* Service Tabs */}
        <Tabs defaultValue="global" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global" className="flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Global Recharge
            </TabsTrigger>
            <TabsTrigger value="nexitel" className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Nexitel Services
            </TabsTrigger>
          </TabsList>

          {/* Global Recharge Tab */}
          <TabsContent value="global">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-blue-600" />
                  International Mobile Recharge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center">
                              <span className="mr-2">{country.flag}</span>
                              {country.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carrier">Mobile Carrier</Label>
                    <Select 
                      value={selectedCarrier} 
                      onValueChange={setSelectedCarrier}
                      disabled={!selectedCountry}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        {carriers.map((carrier) => (
                          <SelectItem key={carrier} value={carrier}>
                            {carrier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Select value={amount} onValueChange={setAmount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">$5.00</SelectItem>
                        <SelectItem value="10">$10.00</SelectItem>
                        <SelectItem value="15">$15.00</SelectItem>
                        <SelectItem value="20">$20.00</SelectItem>
                        <SelectItem value="25">$25.00</SelectItem>
                        <SelectItem value="50">$50.00</SelectItem>
                        <SelectItem value="100">$100.00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    size="lg"
                    disabled={!selectedCountry || !selectedCarrier || !phoneNumber || !amount}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Recharge Now - ${amount}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nexitel Services Tab */}
          <TabsContent value="nexitel">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-6 h-6 mr-2 text-purple-600" />
                  Nexitel Wireless Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Smartphone className="w-16 h-16 mx-auto text-purple-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nexitel Services</h3>
                  <p className="text-gray-600 mb-6">
                    Access Nexitel activation, recharge, and wireless services.
                  </p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleStaffLogin}
                  >
                    Access Nexitel Services
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Globe className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Global Coverage</h3>
              <p className="text-gray-600">
                Recharge phones in over 180 countries worldwide with instant delivery.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Zap className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Instant Delivery</h3>
              <p className="text-gray-600">
                Your recharge is processed instantly and delivered in seconds.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <CreditCard className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">
                All transactions are secured with bank-level encryption.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 Mobile Recharge Portal. All rights reserved.</p>
            <div className="mt-2">
              <Button variant="link" size="sm" onClick={handleStaffLogin}>
                Staff Portal
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}