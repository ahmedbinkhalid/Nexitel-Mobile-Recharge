import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FileDown, Calendar, BarChart3 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ReportGeneratorProps {
  userRole: 'admin' | 'employee' | 'retailer';
  userId?: number;
}

type ReportType = 'activation' | 'recharge' | 'commission' | 'wallet-topup';
type ReportFormat = 'csv' | 'json';

interface ReportRequest {
  reportType: ReportType;
  dateFrom: string;
  dateTo: string;
  format: ReportFormat;
  userId?: number;
}

export function ReportGenerator({ userRole, userId }: ReportGeneratorProps) {
  const { toast } = useToast();
  const [reportRequest, setReportRequest] = useState<ReportRequest>({
    reportType: 'activation',
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    dateTo: new Date().toISOString().split('T')[0], // today
    format: 'csv',
    userId: userRole === 'retailer' ? userId : undefined,
  });

  const reportMutation = useMutation({
    mutationFn: async (request: ReportRequest) => {
      const response = await fetch(`/api/reports/${request.reportType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Report generation failed: ${response.statusText}`);
      }

      if (request.format === 'csv') {
        // Handle CSV download
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${request.reportType}_report_${request.dateFrom}_to_${request.dateTo}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return { success: true, type: 'download' };
      } else {
        // Handle JSON response
        const data = await response.json();
        return { success: true, type: 'json', data };
      }
    },
    onSuccess: (result) => {
      if (result.type === 'download') {
        toast({
          title: "Report Generated",
          description: "Your report has been downloaded successfully",
        });
      } else {
        toast({
          title: "Report Generated",
          description: `Found ${result.data?.length || 0} records`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Report Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = () => {
    if (!reportRequest.dateFrom || !reportRequest.dateTo) {
      toast({
        title: "Date Range Required",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (new Date(reportRequest.dateFrom) > new Date(reportRequest.dateTo)) {
      toast({
        title: "Invalid Date Range",
        description: "Start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    reportMutation.mutate(reportRequest);
  };

  const reportTypes = [
    { 
      value: 'activation', 
      label: 'Activation Report', 
      description: 'All activation records including customer details and status',
      available: true
    },
    { 
      value: 'recharge', 
      label: 'Recharge Report', 
      description: 'Mobile recharge transactions with amounts and commissions',
      available: true
    },
    { 
      value: 'commission', 
      label: 'Commission Report', 
      description: 'Commission earnings breakdown by service type',
      available: userRole !== 'employee'
    },
    { 
      value: 'wallet-topup', 
      label: 'Wallet Top-up Report', 
      description: 'Wallet balance changes and payment methods',
      available: userRole !== 'employee'
    },
  ];

  const presetDateRanges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'This month', days: new Date().getDate() },
  ];

  const setPresetDateRange = (days: number) => {
    const dateTo = new Date().toISOString().split('T')[0];
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setReportRequest(prev => ({ ...prev, dateFrom, dateTo }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Report Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.filter(type => type.available).map((type) => (
                <div 
                  key={type.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    reportRequest.reportType === type.value 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setReportRequest(prev => ({ ...prev, reportType: type.value as ReportType }))}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        reportRequest.reportType === type.value 
                          ? 'border-primary bg-primary' 
                          : 'border-gray-300'
                      }`}>
                        {reportRequest.reportType === type.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{type.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Date Range</Label>
            
            {/* Preset Ranges */}
            <div className="flex flex-wrap gap-2">
              {presetDateRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetDateRange(preset.days)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={reportRequest.dateFrom}
                  onChange={(e) => setReportRequest(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateTo" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={reportRequest.dateTo}
                  onChange={(e) => setReportRequest(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Export Format</Label>
            <Select 
              value={reportRequest.format} 
              onValueChange={(value: ReportFormat) => setReportRequest(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV File (.csv)</SelectItem>
                <SelectItem value="json">JSON Data (.json)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Retailer Limitation Notice */}
          {userRole === 'retailer' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> As a retailer, you can only generate reports for your own transactions and activities.
              </p>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleGenerateReport}
              disabled={reportMutation.isPending}
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              {reportMutation.isPending ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {reportRequest.reportType === 'activation' ? 'Activations' : 
                 reportRequest.reportType === 'recharge' ? 'Recharges' : 
                 reportRequest.reportType === 'commission' ? 'Commissions' : 'Top-ups'}
              </div>
              <div className="text-sm text-muted-foreground">Selected Report</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.ceil((new Date(reportRequest.dateTo).getTime() - new Date(reportRequest.dateFrom).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-muted-foreground">Days Range</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {reportRequest.format.toUpperCase()}
              </div>
              <div className="text-sm text-muted-foreground">Export Format</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {userRole === 'retailer' ? 'Personal' : 'All Users'}
              </div>
              <div className="text-sm text-muted-foreground">Data Scope</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}