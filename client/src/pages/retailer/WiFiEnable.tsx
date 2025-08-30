import { useState, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, FileText, Download, AlertCircle, CheckCircle, X, Wifi } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function WiFiEnable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  if (!user || !["admin", "employee", "retailer"].includes(user.role)) {
    return <div>Access denied</div>;
  }

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

  const processWiFiEnable = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    try {
      // Read and parse CSV file
      const text = await uploadedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Validate CSV format
      const requiredHeaders = ['iccid', 'phone_number', 'wifi_plan'];
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
      const enableResults = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        // Simulate WiFi enable process
        const success = Math.random() > 0.05; // 95 success rate for demo
        enableResults.push({
          row: i,
          iccid: row.iccid,
          phone_number: row.phone_number,
          wifi_plan: row.wifi_plan,
          status: success ? 'success' : 'failed',
          message: success ? 'WiFi enabled successfully' : 'Network configuration failed'
        });
      }

      setResults(enableResults);
      toast({
        title: "WiFi Enable Complete",
        description: `Processed ${enableResults.length} WiFi configurations`,
      });
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
    const csvContent = "iccid,phone_number,wifi_plan,customer_name\n" +
      "89148000012345678901,+1-555-0123,Premium WiFi,John Doe\n" +
      "89148000012345678902,+1-555-0124,Basic WiFi,Jane Smith";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'wifi_enable_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const downloadResults = () => {
    if (results.length === 0) return;
    
    const csvContent = "row,iccid,phone_number,wifi_plan,status,message\n" +
      results.map(r => `${r.row},${r.iccid},${r.phone_number},${r.wifi_plan},${r.status},${r.message}`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'wifi_enable_results.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
                onClick={() => window.location.href = '/retailer/dashboard'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WiFi Enable Upload</h1>
                <p className="text-sm text-gray-600">Enable WiFi services for multiple devices</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wifi className="w-5 h-5 mr-2" />
              WiFi Enable File Format Instructions
            </CardTitle>
            <CardDescription>
              Upload a CSV file to enable WiFi services for multiple customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Required Columns:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li><strong>iccid</strong> - SIM card ICCID (20 digits)</li>
                  <li><strong>phone_number</strong> - Device phone number</li>
                  <li><strong>wifi_plan</strong> - WiFi service plan (Basic WiFi, Premium WiFi, etc.)</li>
                  <li><strong>customer_name</strong> - Customer name (optional)</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Important:</p>
                    <p>WiFi services will be enabled on existing active Nexitel lines. Ensure all ICCIDs correspond to active subscriptions.</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button onClick={downloadTemplate} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload WiFi Enable File</CardTitle>
            <CardDescription>
              Select your prepared CSV file to enable WiFi services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-lg font-medium text-gray-900 mb-2">
                  {uploadedFile ? uploadedFile.name : "Choose CSV file"}
                </div>
                <div className="text-sm text-gray-500">
                  Click to browse or drag and drop your CSV file here
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-900">{uploadedFile.name}</p>
                      <p className="text-sm text-green-600">File ready for processing</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={processWiFiEnable}
                      disabled={isProcessing}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isProcessing ? "Processing..." : "Enable WiFi"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setUploadedFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>WiFi Enable Results</CardTitle>
                  <CardDescription>
                    {results.filter(r => r.status === 'success').length} successful, {results.filter(r => r.status === 'failed').length} failed
                  </CardDescription>
                </div>
                <Button onClick={downloadResults} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center">
                      {result.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          result.status === 'success' ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {result.phone_number}
                        </p>
                        <p className={`text-sm ${
                          result.status === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.iccid} • {result.wifi_plan}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${
                        result.status === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}