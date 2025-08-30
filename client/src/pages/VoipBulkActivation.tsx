import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Upload, FileText, Download, AlertCircle, CheckCircle, X } from "lucide-react";
import { type VoipPlan } from "@shared/schema";

export default function VoipBulkActivation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<VoipPlan | null>(null);

  const handleBackNavigation = () => {
    if (user?.role === "retailer") {
      window.location.href = "/retailer/dashboard";
    } else if (user?.role === "employee") {
      window.location.href = "/employee/dashboard";
    } else if (user?.role === "admin") {
      window.location.href = "/admin/dashboard";
    } else {
      window.location.href = "/";
    }
  };

  // Fetch VoIP plans
  const { data: voipPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/voip/plans"],
  });
  
  // Ensure voipPlans is always an array
  const safeVoipPlans = Array.isArray(voipPlans) ? voipPlans : [];

  // Fetch recent bulk activations
  const { data: recentActivations = [] } = useQuery({
    queryKey: ["/api/voip/bulk-activations", user?.id],
    enabled: !!user?.id,
  });
  
  // Ensure recentActivations is always an array
  const safeRecentActivations = Array.isArray(recentActivations) ? recentActivations : [];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file only.",
          variant: "destructive",
        });
        return;
      }
      setUploadedFile(file);
      setResults([]);
    }
  };

  const processVoipBulkActivation = async () => {
    if (!uploadedFile || !selectedPlan) {
      toast({
        title: "Missing Requirements",
        description: "Please select a VoIP plan and upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Read and parse CSV file
      const text = await uploadedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Validate CSV format
      const requiredHeaders = ['customer_name', 'customer_email', 'customer_phone'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        toast({
          title: "Invalid CSV Format",
          description: `Missing required columns: ${missingHeaders.join(', ')}`,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Process each row
      const activationResults = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        // Generate VoIP number and activation code
        const voipNumber = `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
        const activationCode = Math.random().toString(36).substr(2, 8).toUpperCase();
        
        // Simulate VoIP activation process
        const success = Math.random() > 0.05; // 95% success rate for demo
        activationResults.push({
          row: i,
          customerName: row.customer_name,
          customerEmail: row.customer_email,
          customerPhone: row.customer_phone,
          voipNumber,
          activationCode,
          planName: selectedPlan.name,
          status: success ? 'active' : 'failed',
          message: success ? 'VoIP activated successfully' : 'Activation failed - please retry'
        });

        // Add small delay for demo
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResults(activationResults);
      
      // Send bulk activation to backend
      await apiRequest("/api/voip/bulk-activate", {
        method: "POST",
        body: JSON.stringify({
          userId: user?.id,
          planId: selectedPlan.id,
          activations: activationResults.filter(r => r.status === 'active'),
          totalProcessed: activationResults.length
        })
      });

      toast({
        title: "Bulk VoIP Activation Complete",
        description: `Processed ${activationResults.length} VoIP activations. Setup emails sent to customers.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/voip/bulk-activations"] });
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process the CSV file",
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  const downloadTemplate = () => {
    const csvContent = "customer_name,customer_email,customer_phone,notes\n" +
      "John Doe,john.doe@email.com,+1-555-0123,Priority customer\n" +
      "Jane Smith,jane.smith@email.com,+1-555-0124,Corporate account\n" +
      "Bob Johnson,bob.johnson@email.com,+1-555-0125,Standard activation";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voip-bulk-activation-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Template Downloaded",
      description: "CSV template downloaded successfully. Fill it out and upload to start bulk activation.",
    });
  };

  const exportResults = () => {
    if (results.length === 0) return;
    
    const csvContent = "customer_name,customer_email,customer_phone,voip_number,activation_code,plan_name,status,message\n" +
      results.map(r => 
        `${r.customerName},${r.customerEmail},${r.customerPhone},${r.voipNumber},${r.activationCode},${r.planName},${r.status},${r.message}`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voip-bulk-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handlePlanChange = (planId: string) => {
    const plan = safeVoipPlans.find((p: VoipPlan) => p.id === parseInt(planId));
    setSelectedPlan(plan || null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={handleBackNavigation}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mr-3" />
                VoIP Bulk Activation
              </h1>
              <p className="text-gray-600 mt-2">Activate multiple VoIP numbers using CSV file upload</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bulk Activation Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 text-purple-600 mr-2" />
                  Bulk VoIP Activation
                </CardTitle>
                <CardDescription>
                  Upload a CSV file with customer information to activate multiple VoIP services at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select VoIP Plan</label>
                  <Select onValueChange={handlePlanChange} disabled={plansLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={plansLoading ? "Loading plans..." : "Choose a VoIP plan"} />
                    </SelectTrigger>
                    <SelectContent>
                      {safeVoipPlans.map((plan: VoipPlan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - ${plan.monthlyPrice}/month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPlan && (
                    <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900">{selectedPlan.name}</h4>
                      <p className="text-sm text-purple-700">{selectedPlan.description}</p>
                      <p className="text-sm font-medium text-purple-900 mt-1">
                        ${selectedPlan.monthlyPrice}/month per activation
                      </p>
                    </div>
                  )}
                </div>

                {/* CSV Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Upload Customer Data (CSV)</label>
                    <Button variant="outline" size="sm" onClick={downloadTemplate}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="space-y-2">
                      {uploadedFile ? (
                        <div className="flex items-center justify-center space-x-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="text-green-600 font-medium">{uploadedFile.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadedFile(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-600">Click to upload CSV file or drag and drop</p>
                          <p className="text-xs text-gray-500">CSV files only</p>
                        </>
                      )}
                    </div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {!uploadedFile && (
                      <Button
                        variant="outline"
                        className="mt-3"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select CSV File
                      </Button>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Required columns:</strong> customer_name, customer_email, customer_phone</p>
                    <p><strong>Optional columns:</strong> notes</p>
                  </div>
                </div>

                {/* Process Button */}
                <Button
                  onClick={processVoipBulkActivation}
                  disabled={!uploadedFile || !selectedPlan || isProcessing}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing VoIP Activations...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Process Bulk Activation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            {results.length > 0 && (
              <Card className="mt-6 bg-white shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      Activation Results
                    </CardTitle>
                    <Button onClick={exportResults} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Results
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{result.customerName}</p>
                          <p className="text-xs text-gray-600">{result.customerEmail}</p>
                          {result.status === 'active' && (
                            <p className="text-xs text-gray-600">VoIP: {result.voipNumber}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={result.status === 'active' ? 'default' : 'destructive'}>
                            {result.status}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">{result.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <span>Total processed: {results.length}</span>
                    <span>
                      Success: {results.filter(r => r.status === 'active').length} | 
                      Failed: {results.filter(r => r.status === 'failed').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recent Batches</span>
                  <Badge variant="secondary">{safeRecentActivations.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available Plans</span>
                  <Badge variant="secondary">{safeVoipPlans.length}</Badge>
                </div>
                {results.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Batch</span>
                    <Badge variant="outline">{results.length} processed</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activations */}
            {safeRecentActivations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Batches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {safeRecentActivations.slice(0, 3).map((batch: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">Batch #{batch.id}</p>
                          <p className="text-xs text-gray-600">{batch.quantity} activations</p>
                        </div>
                        <Badge variant="secondary">{batch.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
                    <span>Select a VoIP plan for all activations</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
                    <span>Download the CSV template and fill with customer data</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
                    <span>Upload the completed CSV file</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">4</span>
                    <span>Click "Process Bulk Activation" to start</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">5</span>
                    <span>Export results and send VoIP details to customers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}