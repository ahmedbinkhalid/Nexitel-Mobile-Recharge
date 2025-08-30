import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Wifi, Upload, FileText, CheckCircle, AlertCircle, Phone, Search, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useEmployeeVerification } from "@/hooks/useEmployeeVerification";
import { EmployeeVerificationDialog } from "@/components/EmployeeVerificationDialog";

interface WifiCallingRequest {
  iccid: string;
  customerName: string;
  phoneNumber: string;
  emergencyAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export default function NexitelWifiCalling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("single");
  
  // Single activation form
  const [singleForm, setSingleForm] = useState<WifiCallingRequest>({
    iccid: "",
    customerName: "",
    phoneNumber: "",
    emergencyAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });

  // Address lookup functionality
  const [lookupValue, setLookupValue] = useState("");
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Bulk activation
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [bulkResults, setBulkResults] = useState<any[]>([]);

  // Employee verification hooks for different operations
  const singleActivationVerification = useEmployeeVerification({
    operationType: "wifi_calling_activation",
    operationDetails: "Single WiFi Calling activation"
  });

  const bulkActivationVerification = useEmployeeVerification({
    operationType: "bulk_wifi_calling_activation",
    operationDetails: "Bulk WiFi Calling activations via CSV"
  });

  const handleBackNavigation = () => {
    if (user?.role === "retailer") {
      window.location.href = "/retailer/dashboard";
    } else {
      window.location.href = "/admin";
    }
  };

  // Search for existing customer by ICCID or Mobile Number
  const searchCustomer = async () => {
    if (!lookupValue.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter an ICCID or mobile number to search",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      // Try searching by ICCID first
      let searchUrl = `/api/activities/search/iccid/${lookupValue}`;
      let response = await apiRequest(searchUrl);
      
      // If no results by ICCID, try by mobile number
      if (!response || response.length === 0) {
        searchUrl = `/api/activities/search/mobile/${lookupValue}`;
        response = await apiRequest(searchUrl);
      }

      if (response && response.length > 0) {
        const customerRecord = response[0]; // Get most recent record
        setFoundCustomer(customerRecord);
        
        // Pre-fill the form with found customer data
        setSingleForm({
          iccid: customerRecord.iccid || lookupValue,
          customerName: customerRecord.customerName || "",
          phoneNumber: customerRecord.mobileNumber || customerRecord.phoneNumber || lookupValue,
          emergencyAddress: {
            street: customerRecord.customerAddress?.split(',')[0]?.trim() || "",
            city: customerRecord.city || customerRecord.customerAddress?.split(',')[1]?.trim() || "",
            state: customerRecord.state || customerRecord.customerAddress?.split(',')[2]?.trim()?.split(' ')[0] || "",
            zipCode: customerRecord.zip || customerRecord.customerAddress?.split(',')[2]?.trim()?.split(' ')[1] || ""
          }
        });

        toast({
          title: "Customer Found",
          description: `Found existing customer: ${customerRecord.customerName}`,
        });
      } else {
        setFoundCustomer(null);
        toast({
          title: "No Customer Found",
          description: "No existing customer found with this ICCID or mobile number. Please enter details manually.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to search for customer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Single WiFi Calling activation
  const singleActivationMutation = useMutation({
    mutationFn: async (data: WifiCallingRequest) => {
      return await apiRequest("/api/nexitel/wifi-calling/enable", {
        method: "POST",
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "WiFi Calling Enabled",
        description: "WiFi Calling has been successfully enabled for this number",
      });
      // Reset form
      setSingleForm({
        iccid: "",
        customerName: "",
        phoneNumber: "",
        emergencyAddress: { street: "", city: "", state: "", zipCode: "" }
      });
    },
    onError: (error: any) => {
      toast({
        title: "Activation Failed",
        description: error.message || "Failed to enable WiFi Calling",
        variant: "destructive",
      });
    },
  });

  // Bulk WiFi Calling activation
  const bulkActivationMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("csvFile", file);
      
      const response = await fetch("/api/nexitel/wifi-calling/bulk-enable", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
      
      return await response.json();
    },
    onSuccess: (results) => {
      setBulkResults(results);
      toast({
        title: "Bulk Activation Complete",
        description: `Processed ${results.length} WiFi Calling enable requests`,
      });
      setCsvFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Activation Failed",
        description: error.message || "Failed to process bulk WiFi Calling activation",
        variant: "destructive",
      });
    },
  });

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use employee verification for single activation
    singleActivationVerification.requireEmployeeVerification(() => {
      singleActivationMutation.mutate(singleForm);
    });
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    
    // Use employee verification for bulk activation
    bulkActivationVerification.requireEmployeeVerification(() => {
      bulkActivationMutation.mutate(csvFile);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={handleBackNavigation}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {user?.role === "retailer" ? "Back to Dashboard" : "Back to Admin"}
          </Button>
          <div className="flex items-center mb-2">
            <Wifi className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Nexitel WiFi Calling Enable</h1>
          </div>
          <p className="text-gray-600">Enable WiFi Calling service for Nexitel customers</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Single Activation
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Bulk Activation
            </TabsTrigger>
          </TabsList>

          {/* Single WiFi Calling Enable */}
          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="w-5 h-5 mr-2 text-blue-600" />
                  Enable WiFi Calling - Single Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Customer Lookup Section */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Search className="w-5 h-5 mr-2 text-blue-600" />
                    Search Existing Customer (Optional)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Search by ICCID or mobile number to auto-fill customer information and address from previous activation
                  </p>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter ICCID or mobile number to search"
                        value={lookupValue}
                        onChange={(e) => setLookupValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            searchCustomer();
                          }
                        }}
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={searchCustomer}
                      disabled={isSearching}
                      variant="outline"
                    >
                      {isSearching ? (
                        <>Searching...</>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Found Customer Display */}
                  {foundCustomer && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">Customer Found!</span>
                      </div>
                      <div className="mt-2 text-sm text-green-700">
                        <p><strong>Name:</strong> {foundCustomer.customerName}</p>
                        <p><strong>ICCID:</strong> {foundCustomer.iccid}</p>
                        <p><strong>Address:</strong> {foundCustomer.customerAddress || `${foundCustomer.city}, ${foundCustomer.state} ${foundCustomer.zip}`}</p>
                        <p className="text-xs mt-2 text-green-600">
                          Form has been auto-filled with existing customer information
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSingleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="iccid">ICCID Number *</Label>
                      <Input
                        id="iccid"
                        placeholder="Enter ICCID (e.g., 8901260123456789012)"
                        value={singleForm.iccid}
                        onChange={(e) => setSingleForm({...singleForm, iccid: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <Input
                        id="customerName"
                        placeholder="Enter customer full name"
                        value={singleForm.customerName}
                        onChange={(e) => setSingleForm({...singleForm, customerName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="Enter phone number (e.g., 5551234567)"
                      value={singleForm.phoneNumber}
                      onChange={(e) => setSingleForm({...singleForm, phoneNumber: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Emergency Address (Required for WiFi Calling) *</Label>
                      {foundCustomer && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="useNewAddress"
                            checked={!useExistingAddress}
                            onCheckedChange={(checked) => {
                              setUseExistingAddress(!checked);
                              if (checked && foundCustomer) {
                                // Clear address fields to enter new address
                                setSingleForm({
                                  ...singleForm,
                                  emergencyAddress: {
                                    street: "",
                                    city: "",
                                    state: "",
                                    zipCode: ""
                                  }
                                });
                              }
                            }}
                          />
                          <Label htmlFor="useNewAddress" className="text-sm">
                            Use different emergency address
                          </Label>
                        </div>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          placeholder="123 Main Street"
                          value={singleForm.emergencyAddress.street}
                          onChange={(e) => setSingleForm({
                            ...singleForm,
                            emergencyAddress: {...singleForm.emergencyAddress, street: e.target.value}
                          })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={singleForm.emergencyAddress.city}
                          onChange={(e) => setSingleForm({
                            ...singleForm,
                            emergencyAddress: {...singleForm.emergencyAddress, city: e.target.value}
                          })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="NY"
                          value={singleForm.emergencyAddress.state}
                          onChange={(e) => setSingleForm({
                            ...singleForm,
                            emergencyAddress: {...singleForm.emergencyAddress, state: e.target.value}
                          })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          placeholder="10001"
                          value={singleForm.emergencyAddress.zipCode}
                          onChange={(e) => setSingleForm({
                            ...singleForm,
                            emergencyAddress: {...singleForm.emergencyAddress, zipCode: e.target.value}
                          })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={singleActivationMutation.isPending}
                  >
                    {singleActivationMutation.isPending ? (
                      <>Enabling WiFi Calling...</>
                    ) : (
                      <>Enable WiFi Calling</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk WiFi Calling Enable */}
          <TabsContent value="bulk">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-green-600" />
                    Bulk WiFi Calling Enable - CSV Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBulkSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>CSV File Format Requirements</Label>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>• CSV must contain headers: ICCID, CustomerName, PhoneNumber, Street, City, State, ZipCode</p>
                          <p>• All fields are required for each row</p>
                          <p>• Emergency address is mandatory for WiFi Calling activation</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="csvFile">Upload CSV File *</Label>
                        <Input
                          id="csvFile"
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          required
                        />
                        {csvFile && (
                          <p className="text-sm text-green-600">
                            Selected: {csvFile.name} ({Math.round(csvFile.size / 1024)} KB)
                          </p>
                        )}
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={bulkActivationMutation.isPending || !csvFile}
                    >
                      {bulkActivationMutation.isPending ? (
                        <>Processing Bulk WiFi Calling...</>
                      ) : (
                        <>Process Bulk WiFi Calling Enable</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Bulk Results */}
              {bulkResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Bulk Activation Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bulkResults.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {result.success ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                            <div>
                              <p className="font-medium">{result.customerName}</p>
                              <p className="text-sm text-gray-600">ICCID: {result.iccid}</p>
                            </div>
                          </div>
                          <Badge variant={result.success ? "default" : "destructive"}>
                            {result.success ? "Enabled" : "Failed"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Employee Verification Dialogs */}
        <EmployeeVerificationDialog
          isOpen={singleActivationVerification.isVerificationOpen}
          onClose={singleActivationVerification.handleVerificationCancel}
          onVerified={singleActivationVerification.handleVerificationSuccess}
          operationType={singleActivationVerification.operationType}
          operationDetails={singleActivationVerification.operationDetails}
        />
        
        <EmployeeVerificationDialog
          isOpen={bulkActivationVerification.isVerificationOpen}
          onClose={bulkActivationVerification.handleVerificationCancel}
          onVerified={bulkActivationVerification.handleVerificationSuccess}
          operationType={bulkActivationVerification.operationType}
          operationDetails={bulkActivationVerification.operationDetails}
        />
      </div>
    </div>
  );
}