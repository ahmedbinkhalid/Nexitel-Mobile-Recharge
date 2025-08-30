import { useState, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, FileText, Download, AlertCircle, CheckCircle, X, Clock, Users, Zap } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { handleBackNavigation } from "@shared/constants";

export default function NexitelBulkActivation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<string>("");
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

  if (!user || !["admin", "employee", "retailer"].includes(user.role)) {
    return <div>Access denied</div>;
  }

  const handleBackNavigationClick = () => {
    handleBackNavigation(user?.role);
  };

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
    if (!uploadedFile || !selectedCarrier) {
      toast({
        title: "Missing Information",
        description: "Please select a carrier and upload a CSV file.",
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
      
      // Validate CSV format - check for required columns (case insensitive)
      const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
      const requiredHeaders = ['iccid', 'sku', 'customer name', 'customer address', 'email'];
      const optionalHeaders = [
        'imei (optional)', 'date of activation (optional)', 'customer address 2', 
        'city', 'state', 'zip', 'comments/ notes', 'auto renew'
      ];
      
      const missingHeaders = requiredHeaders.filter(required => 
        !normalizedHeaders.some(header => 
          header.includes(required.toLowerCase()) || 
          (required === 'customer name' && header.includes('customer name')) ||
          (required === 'customer address' && (header.includes('customer address') && !header.includes('2')))
        )
      );
      
      if (missingHeaders.length > 0) {
        toast({
          title: "Invalid CSV Format",
          description: `Missing required columns: ${missingHeaders.join(', ')}`,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const dataRows = lines.slice(1);
      setTotalRows(dataRows.length);
      setProcessingStats({ successful: 0, failed: 0, total: dataRows.length });
      
      const results: any[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i].split(',').map(cell => cell.trim());
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header.toLowerCase().trim()] = row[index] || '';
        });

        setCurrentRow(i + 1);
        setProgress(((i + 1) / dataRows.length) * 100);

        try {
          // Simulate API call for bulk activation
          // In production, this would be replaced with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const activationResult = {
            row: i + 1,
            iccid: rowData.iccid,
            imei: rowData['imei (optional)'] || '',
            sku: rowData.sku,
            customer_name: rowData['customer name'],
            customer_address: rowData['customer address'],
            customer_address_2: rowData['customer address 2'] || '',
            city: rowData.city || '',
            state: rowData.state || '',
            zip: rowData.zip || '',
            email: rowData.email,
            comments_notes: rowData['comments/ notes'] || '',
            auto_renew: rowData['auto renew'] || '',
            date_of_activation: rowData['date of activation (optional)'] || '',
            carrier: selectedCarrier,
            status: Math.random() > 0.1 ? 'success' : 'failed', // 90% success rate simulation
            message: Math.random() > 0.1 ? 'Activation successful' : 'Invalid ICCID or SKU',
            timestamp: new Date().toISOString()
          };

          results.push(activationResult);
          
          if (activationResult.status === 'success') {
            setProcessingStats(prev => ({ ...prev, successful: prev.successful + 1 }));
          } else {
            setProcessingStats(prev => ({ ...prev, failed: prev.failed + 1 }));
          }

        } catch (error) {
          results.push({
            row: i + 1,
            iccid: rowData.iccid,
            imei: rowData['imei (optional)'] || '',
            sku: rowData.sku,
            customer_name: rowData['customer name'],
            customer_address: rowData['customer address'],
            customer_address_2: rowData['customer address 2'] || '',
            city: rowData.city || '',
            state: rowData.state || '',
            zip: rowData.zip || '',
            email: rowData.email,
            comments_notes: rowData['comments/ notes'] || '',
            auto_renew: rowData['auto renew'] || '',
            date_of_activation: rowData['date of activation (optional)'] || '',
            carrier: selectedCarrier,
            status: 'failed',
            message: 'Processing error',
            timestamp: new Date().toISOString()
          });
          setProcessingStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        }
      }

      setResults(results);
      toast({
        title: "Bulk Activation Complete",
        description: `Processed ${results.length} records. ${processingStats.successful} successful, ${processingStats.failed} failed.`,
      });

    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process the CSV file. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResults = () => {
    if (results.length === 0) return;

    const csv = [
      'Row,ICCID,IMEI,SKU,Customer Name,Customer Address,Customer Address 2,City,State,ZIP,Email,Comments/Notes,Auto Renew,Date of Activation,Carrier,Status,Message,Timestamp',
      ...results.map(r => 
        `${r.row},"${r.iccid}","${r.imei || ''}","${r.sku}","${r.customer_name}","${r.customer_address}","${r.customer_address_2 || ''}","${r.city || ''}","${r.state || ''}","${r.zip || ''}","${r.email}","${r.comments_notes || ''}","${r.auto_renew || ''}","${r.date_of_activation || ''}","${r.carrier}","${r.status}","${r.message}","${r.timestamp}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexitel_bulk_activation_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const template = [
      'ICCID,IMEI (Optional),SKU,Date of Activation (Optional),Customer Name,Customer Address,Customer Address 2,City,State,ZIP,Email,Comments/ Notes,Auto Renew',
      '8901240412341234123F,,usvtd-30day-GSMT-0MB-750Minutes Unl SMS,,Test Customer,123 Main Street,Unit A,Seattle,WA,98101,test@example.com,Sample activation,Yes',
      '8901240412341234124F,123456789012345,usvtd-unlimited-GSMT-5GB-UnlMinutes UnlSMS,2024-01-15,John Smith,456 Oak Avenue,,Spokane,WA,99201,john.smith@example.com,Premium plan,No',
      '8901240412341234125F,,usvtd-basic-GSMT-1GB-500Minutes 1000SMS,,Jane Doe,789 Pine Street,Apt 2B,Tacoma,WA,98402,jane.doe@example.com,,Yes'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexitel_bulk_activation_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Nexitel Bulk Activation</h1>
                <p className="text-sm text-gray-500">Upload CSV file for batch SIM activations</p>
              </div>
            </div>
            <Button onClick={handleBackNavigationClick} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload CSV File
                </CardTitle>
                <CardDescription>
                  Select Nexitel carrier and upload a CSV file with activation details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Carrier Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nexitel Carrier *
                  </label>
                  <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Nexitel carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nexitel_blue">Nexitel Blue</SelectItem>
                      <SelectItem value="nexitel_purple">Nexitel Purple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    CSV File *
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        className="file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={downloadTemplate}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Template
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Supported format: CSV files with headers matching the required columns below
                    </div>
                  </div>
                </div>

                {uploadedFile && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-green-700">
                        File: {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={processBulkActivation}
                  disabled={!uploadedFile || !selectedCarrier || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Start Bulk Activation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* CSV Format Guide */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  CSV Format Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Required Columns:</strong>
                    <ul className="list-disc list-inside ml-4 text-gray-600">
                      <li>ICCID - SIM card ICCID number</li>
                      <li>SKU - Service plan SKU identifier</li>
                      <li>Customer Name - Customer full name</li>
                      <li>Customer Address - Customer full address</li>
                      <li>Email - Customer email address</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Optional Columns:</strong>
                    <ul className="list-disc list-inside ml-4 text-gray-600">
                      <li>IMEI (Optional) - Device IMEI number</li>
                      <li>Date of Activation (Optional) - Activation date (YYYY-MM-DD)</li>
                      <li>Customer Address 2 - Secondary address line</li>
                      <li>City - Customer city</li>
                      <li>State - Customer state</li>
                      <li>ZIP - Customer ZIP code</li>
                      <li>Comments/ Notes - Additional notes</li>
                      <li>Auto Renew - Auto renewal preference</li>
                    </ul>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div className="text-xs text-blue-700">
                        <strong>Note:</strong> Your CSV file should match the format exactly as shown in the template. 
                        The system will automatically map columns based on header names (case-insensitive).
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div>
            {isProcessing && (
              <Card>
                <CardHeader>
                  <CardTitle>Processing Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={progress} className="w-full" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Processing row {currentRow} of {totalRows}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{processingStats.successful}</div>
                        <div className="text-sm text-gray-500">Successful</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{processingStats.failed}</div>
                        <div className="text-sm text-gray-500">Failed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{processingStats.total}</div>
                        <div className="text-sm text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {results.length > 0 && !isProcessing && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Activation Results</CardTitle>
                    <Button onClick={downloadResults} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Export Results
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {results.map((result, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-md border ${
                            result.status === 'success'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {result.status === 'success' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-red-500" />
                              )}
                              <span className="font-medium">
                                Row {result.row}: {result.customer_name}
                              </span>
                            </div>
                            <Badge
                              variant={result.status === 'success' ? 'default' : 'destructive'}
                            >
                              {result.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            ICCID: {result.iccid} | SKU: {result.sku}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {result.city && result.state ? `${result.city}, ${result.state}` : 'Address'} | {result.email}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {result.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}