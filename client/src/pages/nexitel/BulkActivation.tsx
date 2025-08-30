import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileSpreadsheet, ArrowLeft, AlertCircle, Upload, Download, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Base schema for Nexitel bulk activation
const baseNexitelBulkActivationSchema = z.object({
  batchName: z.string().min(1, "Batch name is required"),
  nexitelNetwork: z.enum(["nexitel-purple", "nexitel-blue"], { required_error: "Network selection is required" }),
  employeeId: z.string().optional(),
});

// Create schema with conditional employeeId requirement based on user role
const createNexitelBulkActivationSchema = (userRole: string) => {
  return baseNexitelBulkActivationSchema.extend({
    employeeId: userRole === 'admin' ? z.string().min(1, "Employee ID is required") : z.string().optional(),
  });
};

type NexitelBulkActivationRequest = z.infer<typeof baseNexitelBulkActivationSchema>;

interface BulkActivationStatus {
  id: string;
  batchName: string;
  totalRecords: number;
  processedRecords: number;
  successfulActivations: number;
  failedActivations: number;
  status: "uploading" | "processing" | "completed" | "failed";
  errors?: string[];
}

export default function NexitelBulkActivation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bulkStatus, setBulkStatus] = useState<BulkActivationStatus | null>(null);

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

  const form = useForm<NexitelBulkActivationRequest>({
    resolver: zodResolver(createNexitelBulkActivationSchema(user?.role || 'retailer')),
    defaultValues: {
      batchName: "",
      nexitelNetwork: undefined,
      employeeId: "",
    },
  });

  const bulkActivationMutation = useMutation({
    mutationFn: async (data: { formData: NexitelBulkActivationRequest; file: File }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('batchName', data.formData.batchName);
      formData.append('nexitelNetwork', data.formData.nexitelNetwork);
      formData.append('employeeId', data.formData.employeeId);

      const response = await fetch('/api/nexitel/bulk-activation', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
      }

      return response.json();
    },
    onSuccess: (result) => {
      setBulkStatus(result);
      toast({
        title: "Bulk Activation Started",
        description: `Processing ${result.totalRecords} activations. You can monitor progress below.`,
        variant: "default",
      });
      form.reset();
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const onSubmit = (data: NexitelBulkActivationRequest) => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }
    bulkActivationMutation.mutate({ formData: data, file: selectedFile });
  };

  const downloadTemplate = () => {
    const csvContent = `ICCID,First Name,Last Name,Email,Address,State,ZIP Code,Plan Code
8901260123456789012,John,Doe,john.doe@email.com,123 Main St,CA,90210,NEXITEL_UNLIMITED
8901260123456789013,Jane,Smith,jane.smith@email.com,456 Oak Ave,NY,10001,NEXITEL_5GB
8901260123456789014,Bob,Johnson,bob.johnson@email.com,789 Pine St,TX,77001,NEXITEL_UNLIMITED`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexitel_bulk_activation_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getProgressPercentage = () => {
    if (!bulkStatus || bulkStatus.totalRecords === 0) return 0;
    return Math.round((bulkStatus.processedRecords / bulkStatus.totalRecords) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackNavigation}
              className="hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileSpreadsheet className="w-8 h-8 text-pink-600 mr-3" />
                Nexitel Bulk Activation
              </h1>
              <p className="text-gray-600 mt-2">Upload CSV files for multiple Nexitel activations</p>
            </div>
          </div>
          
          {/* Balance Display */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Your Balance</div>
            <div className="text-2xl font-bold text-pink-600">${user?.balance || "0.00"}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bulk Activation Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 text-pink-600 mr-2" />
                  Bulk Activation Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Employee Verification Required - Only for admin users */}
                    {user?.role === 'admin' && (
                      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <h3 className="text-sm font-semibold text-red-800 mb-3 flex items-center">
                          <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                          Employee Verification Required
                        </h3>
                        <FormField
                          control={form.control}
                          name="employeeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Employee ID *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your employee ID" 
                                  {...field} 
                                  className="font-mono h-8"
                                  size={20}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Batch Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="batchName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batch Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Corporate Order Jan 2024" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nexitelNetwork"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nexitel Network</FormLabel>
                            <Select onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select network" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="nexitel-purple">Nexitel Purple</SelectItem>
                                <SelectItem value="nexitel-blue">Nexitel Blue</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                      <FormLabel>CSV File Upload</FormLabel>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            {selectedFile ? (
                              <div className="flex items-center justify-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="font-medium">{selectedFile.name}</span>
                                <Badge variant="secondary">
                                  {(selectedFile.size / 1024).toFixed(1)} KB
                                </Badge>
                              </div>
                            ) : (
                              "Drag and drop your CSV file here, or click to browse"
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {selectedFile ? "Change File" : "Choose File"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Template Download */}
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-pink-900">Need a template?</h3>
                          <p className="text-sm text-pink-700">Download our CSV template to get started</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={downloadTemplate}
                          className="border-pink-300 text-pink-700 hover:bg-pink-100"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Template
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-pink-600 hover:bg-pink-700"
                      disabled={bulkActivationMutation.isPending || !selectedFile}
                    >
                      {bulkActivationMutation.isPending ? "Uploading..." : "Start Bulk Activation"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Processing Status */}
            {bulkStatus && (
              <Card className="bg-white shadow-lg mt-6">
                <CardHeader>
                  <CardTitle>Processing Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{bulkStatus.totalRecords}</div>
                        <div className="text-sm text-gray-500">Total Records</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{bulkStatus.processedRecords}</div>
                        <div className="text-sm text-gray-500">Processed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{bulkStatus.successfulActivations}</div>
                        <div className="text-sm text-gray-500">Successful</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{bulkStatus.failedActivations}</div>
                        <div className="text-sm text-gray-500">Failed</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{getProgressPercentage()}%</span>
                      </div>
                      <Progress value={getProgressPercentage()} className="h-2" />
                    </div>

                    <div className="flex items-center justify-center">
                      <Badge 
                        variant={bulkStatus.status === 'completed' ? 'default' : 'secondary'}
                        className={
                          bulkStatus.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : bulkStatus.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {bulkStatus.status === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
                        {bulkStatus.status === 'failed' && <XCircle className="w-4 h-4 mr-1" />}
                        {bulkStatus.status.charAt(0).toUpperCase() + bulkStatus.status.slice(1)}
                      </Badge>
                    </div>

                    {bulkStatus.errors && bulkStatus.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">Errors</h4>
                        <div className="space-y-1">
                          {bulkStatus.errors.map((error, index) => (
                            <div key={index} className="text-sm text-red-700">
                              • {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Information Sidebar */}
          <div>
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">CSV Format Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 mb-1">Required Columns:</div>
                    <div className="space-y-1 text-gray-600">
                      <div>• ICCID (19-22 digits)</div>
                      <div>• First Name</div>
                      <div>• Last Name</div>
                      <div>• Email</div>
                      <div>• Address</div>
                      <div>• State</div>
                      <div>• ZIP Code</div>
                      <div>• Plan Code</div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="font-medium text-gray-900 mb-1">Plan Codes:</div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>• NEXITEL_UNLIMITED</div>
                      <div>• NEXITEL_5GB</div>
                      <div>• NEXITEL_10GB</div>
                      <div>• NEXITEL_BASIC</div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="font-medium text-gray-900 mb-1">File Limits:</div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>• Maximum 1000 records per file</div>
                      <div>• File size limit: 5MB</div>
                      <div>• CSV format only</div>
                    </div>
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