import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Smartphone, ArrowLeftRight } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";

// Simple SIM Swap form - just mobile number, old SIM, new SIM

export default function ATTSimSwap() {
  console.log("ATTSimSwap component is loading - this should be the clean SIM swap page!");
  const { user } = useAuth();
  const [mobileNumber, setMobileNumber] = useState("");
  const [oldSimNumber, setOldSimNumber] = useState("");
  const [newSimNumber, setNewSimNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("SIM Swap Request:", { mobileNumber, oldSimNumber, newSimNumber });
    // Process SIM swap request
  };

  return (
    <div className="space-y-6">
      {/* Header - Centered Layout */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <Link href={user?.role === 'retailer' ? '/retailer/dashboard' : '/admin'}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center mb-2">
              <ArrowLeftRight className="w-8 h-8 text-orange-600 mr-3" />
              AT&T SIM Swap
            </h1>
            <p className="text-gray-600">Replace SIM card for existing AT&T service</p>
          </div>
        </div>
      </div>

      {/* Simple SIM Swap Form - Centered */}
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Smartphone className="h-6 w-6 text-orange-600" />
              SIM Card Replacement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="mobile-number" className="text-base font-semibold">Mobile Number</Label>
                  <Input
                    id="mobile-number"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                    className="mt-2 h-12 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="old-sim" className="text-base font-semibold">Old SIM Number (ICCID)</Label>
                  <Input
                    id="old-sim"
                    type="text"
                    placeholder="8901410393123456789"
                    value={oldSimNumber}
                    onChange={(e) => setOldSimNumber(e.target.value)}
                    required
                    className="mt-2 h-12 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="new-sim" className="text-base font-semibold">New SIM Number (ICCID)</Label>
                  <Input
                    id="new-sim"
                    type="text"
                    placeholder="8901410393987654321"
                    value={newSimNumber}
                    onChange={(e) => setNewSimNumber(e.target.value)}
                    required
                    className="mt-2 h-12 text-lg"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg flex-1">
                  <ArrowLeftRight className="w-5 h-5 mr-2" />
                  Process SIM Swap
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-12 text-lg"
                  onClick={() => {
                    setMobileNumber("");
                    setOldSimNumber("");
                    setNewSimNumber("");
                  }}
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}