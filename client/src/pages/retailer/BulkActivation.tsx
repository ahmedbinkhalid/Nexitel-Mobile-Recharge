import { useState, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, FileText, Download, AlertCircle, CheckCircle, X, Clock, Users, Zap } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function BulkActivation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentRow, setCurrentRow] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [processingStats, setProcessingStats] = useState({
    successful: 0,
    failed: 0,
    total: 0
  });

  if (!user || user.role !== "retailer") {
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

  const processBulkActivation = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    try {
      // Read and parse CSV file
      const text = await uploadedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Validate CSV format
      const requiredHeaders = ['iccid', 'sim_type', 'plan', 'customer_name', 'phone_number'];
      const optionalHeaders = ['email', 'address', 'carrier', 'notes'];
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

      // Process each row with progress tracking
      const activationResults = [];
      const total = lines.length - 1;
      setTotalRows(total);
      setProcessingStats({ successful: 0, failed: 0, total });
      
      for (let i = 1; i < lines.length; i++) {
        setCurrentRow(i);
        setProgress((i / total) * 100);
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        // Validate required fields
        const validationErrors = [];
        if (!row.iccid || row.iccid.length !== 20) {
          validationErrors.push('Invalid ICCID format');
        }
        if (!row.customer_name) {
          validationErrors.push('Customer name required');
        }
        if (!row.phone_number) {
          validationErrors.push('Phone number required');
        }
        if (!row.plan) {
          validationErrors.push('Plan required');
        }

        // Simulate activation process with validation
        const hasValidationErrors = validationErrors.length > 0;
        const success = !hasValidationErrors && Math.random() > 0.05; // 95% success rate for valid data
        
        const result = {
          row: i,
          iccid: row.iccid,
          customer_name: row.customer_name,
          phone_number: row.phone_number,
          plan: row.plan,
          sim_type: row.sim_type,
          email: row.email || 'N/A',
          address: row.address || 'N/A',
          carrier: row.carrier || 'Nexitel',
          status: success ? 'success' : 'failed',
          message: hasValidationErrors ? validationErrors.join(', ') : 
                   success ? 'Activation successful - SIM activated and ready' : 
                   'Activation failed - Network error, please retry',
          timestamp: new Date().toISOString()
        };
        
        activationResults.push(result);
        
        // Update stats
        setProcessingStats(prev => ({
          ...prev,
          successful: prev.successful + (success ? 1 : 0),
          failed: prev.failed + (success ? 0 : 1)
        }));
        
        // Add small delay to show progress (remove in production)
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResults(activationResults);
      setProgress(100);
      
      const successCount = activationResults.filter(r => r.status === 'success').length;
      const failCount = activationResults.filter(r => r.status === 'failed').length;
      
      toast({
        title: "Bulk Activation Complete",
        description: `Processed ${activationResults.length} activations: ${successCount} successful, ${failCount} failed`,
      });
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process the CSV file",
        variant: "destructive",
      });
    }
    setIsProcessing(false);
    setProgress(0);
    setCurrentRow(0);
  };

  const downloadTemplate = () => {
    const csvContent = "iccid,sim_type,plan,customer_name,phone_number,email,address,carrier,notes\n" +
      "89148000012345678901,Physical,Unlimited Plan,John Doe,+1-555-0123,john@example.com,123 Main St,Nexitel,Premium customer\n" +
      "89148000012345678902,eSIM,Basic Plan,Jane Smith,+1-555-0124,jane@example.com,456 Oak Ave,Nexitel,Business account\n" +
      "89148000012345678903,Physical,Data Only Plan,Bob Johnson,+1-555-0125,bob@example.com,789 Pine Rd,Nexitel,IoT device";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'bulk_activation_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const downloadResults = () => {
    if (results.length === 0) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const csvContent = "row,iccid,customer_name,phone_number,plan,sim_type,email,address,carrier,status,message,processed_date\n" +
      results.map(r => `${r.row},"${r.iccid}","${r.customer_name}","${r.phone_number}","${r.plan}","${r.sim_type}","${r.email}","${r.address}","${r.carrier}","${r.status}","${r.message}","${timestamp}"`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `bulk_activation_results_${timestamp}.csv`;
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
                <h1 className="text-2xl font-bold text-gray-900">Bulk Activation</h1>
                <p className="text-sm text-gray-600">Upload CSV file to activate multiple SIMs</p>
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
              <FileText className="w-5 h-5 mr-2" />
              CSV File Format Instructions
            </CardTitle>
            <CardDescription>
              Follow these guidelines to prepare your bulk activation file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Required Columns:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li><strong>iccid</strong> - SIM card ICCID (20 digits)</li>
                  <li><strong>sim_type</strong> - Physical or eSIM</li>
                  <li><strong>plan</strong> - Service plan name</li>
                  <li><strong>customer_name</strong> - Full customer name</li>
                  <li><strong>phone_number</strong> - Customer phone number</li>
                  <li><strong>email</strong> - Customer email (optional)</li>
                  <li><strong>address</strong> - Customer address (optional)</li>
                  <li><strong>carrier</strong> - Network carrier (optional, defaults to Nexitel)</li>
                  <li><strong>notes</strong> - Additional notes (optional)</li>
                </ul>
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
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select your prepared CSV file for bulk activation
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-900">{uploadedFile.name}</p>
                        <p className="text-sm text-green-600">
                          {uploadedFile.size > 0 ? `${Math.round(uploadedFile.size / 1024)} KB` : ''} • File ready for processing
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={processBulkActivation}
                        disabled={isProcessing}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isProcessing ? (
                          <div className="flex items-center">
                            <Zap className="w-4 h-4 mr-2 animate-pulse" />
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Zap className="w-4 h-4 mr-2" />
                            Start Activation
                          </div>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadedFile(null);
                          setResults([]);
                          setProgress(0);
                          setCurrentRow(0);
                        }}
                        disabled={isProcessing}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {isProcessing && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">
                          Processing activations...
                        </span>
                        <span className="text-sm text-blue-600">
                          {currentRow} of {totalRows}
                        </span>
                      </div>
                      <Progress value={progress} className="mb-2" />
                      <div className="flex items-center justify-between text-xs text-blue-600">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                            {processingStats.successful} successful
                          </div>
                          <div className="flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1 text-red-600" />
                            {processingStats.failed} failed
                          </div>
                        </div>
                        <div>{Math.round(progress)}% complete</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Activation Results
                    <Badge variant="outline" className="ml-2">
                      {results.length} total
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">
                        {results.filter(r => r.status === 'success').length} successful
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600 font-medium">
                        {results.filter(r => r.status === 'failed').length} failed
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500 text-sm">
                        Completed at {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </CardDescription>
                </div>
                <Button onClick={downloadResults} variant="outline" className="shrink-0">
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
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg gap-2 ${
                      result.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      {result.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mr-3 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className={`font-medium ${
                            result.status === 'success' ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {result.customer_name}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {result.plan}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {result.sim_type}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                          <span className="break-all">{result.iccid}</span>
                          <span>•</span>
                          <span>{result.phone_number}</span>
                          <span>•</span>
                          <span>{result.carrier}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 w-full sm:w-auto">
                      <p className={`text-sm font-medium ${
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