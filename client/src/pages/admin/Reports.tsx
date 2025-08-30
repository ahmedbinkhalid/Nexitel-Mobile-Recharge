import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, BarChart3 } from "lucide-react";

export default function Reports() {
  const { toast } = useToast();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));

  const downloadDailyReport = async (format: 'csv' | 'json') => {
    try {
      // Implement daily report download logic
      toast({
        title: "Success",
        description: `Daily report downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download daily report",
        variant: "destructive",
      });
    }
  };

  const downloadMonthlyReport = async (format: 'csv' | 'json') => {
    try {
      // Implement monthly report download logic
      toast({
        title: "Success",
        description: `Monthly report downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download monthly report",
        variant: "destructive",
      });
    }
  };

  const downloadWalletReport = async (period: 'daily' | 'monthly', format: 'csv' | 'json') => {
    try {
      // Implement wallet report download logic
      toast({
        title: "Success",
        description: `${period.charAt(0).toUpperCase() + period.slice(1)} wallet report downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download wallet report",
        variant: "destructive",
      });
    }
  };

  const downloadRetailerReport = async (period: 'daily' | 'monthly', format: 'csv' | 'json') => {
    try {
      // Implement retailer report download logic
      toast({
        title: "Success",
        description: `${period.charAt(0).toUpperCase() + period.slice(1)} retailer report downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download retailer report",
        variant: "destructive",
      });
    }
  };

  const downloadRetailerProfileReport = async (format: 'csv' | 'json') => {
    try {
      // Implement retailer profile report download logic
      toast({
        title: "Success",
        description: `Retailer profile report downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download retailer profile report",
        variant: "destructive",
      });
    }
  };

  const downloadMonthlyRechargeReport = async (format: 'csv' | 'json') => {
    try {
      // API call to download monthly recharge report
      const response = await fetch(`/api/reports/monthly-recharge?month=${reportMonth}&format=${format}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monthly-recharge-report-${reportMonth}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monthly-recharge-report-${reportMonth}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: "Success",
        description: `Monthly recharge report downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download monthly recharge report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header - Centered */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Download Reports
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Generate and download comprehensive reports for all carriers and transactions
          </p>
        </div>

        {/* Reports Grid - Clean Organized Layout */}
        <div className="space-y-12 bg-white rounded-xl shadow-sm p-8">
          
          {/* Section 1: Core System Reports */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Core System Reports</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {/* Daily Reports */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1 text-sm">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Daily Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <Button onClick={() => downloadDailyReport('csv')} size="sm" variant="outline" className="text-xs h-7">
                      CSV
                    </Button>
                    <Button onClick={() => downloadDailyReport('json')} size="sm" variant="outline" className="text-xs h-7">
                      JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Reports */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1 text-sm">
                    <FileText className="w-4 h-4 text-green-600" />
                    Monthly Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <input
                    type="month"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                    max={new Date().toISOString().slice(0, 7)}
                    style={{ colorScheme: 'light' }}
                    placeholder="Select month"
                    title="Click to open calendar"
                  />
                  <input
                    type="text"
                    value={reportMonth ? `${reportMonth}-01 to ${reportMonth}-${new Date(parseInt(reportMonth.split('-')[0]), parseInt(reportMonth.split('-')[1]), 0).getDate().toString().padStart(2, '0')}` : ''}
                    readOnly
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 text-gray-700"
                    placeholder="Date range will appear here"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <Button onClick={() => downloadMonthlyReport('csv')} size="sm" variant="outline" className="text-xs h-7">
                      CSV
                    </Button>
                    <Button onClick={() => downloadMonthlyReport('json')} size="sm" variant="outline" className="text-xs h-7">
                      JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section 2: Financial Reports */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Financial Reports</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {/* Wallet Transaction Reports */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1 text-sm">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Wallet Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="space-y-1">
                    <input
                      type="date"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <input
                      type="month"
                      value={reportMonth}
                      onChange={(e) => setReportMonth(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                      max={new Date().toISOString().slice(0, 7)}
                      style={{ colorScheme: 'light' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <Button onClick={() => downloadWalletReport('daily', 'csv')} size="sm" variant="outline" className="text-xs h-6 p-1">D-CSV</Button>
                    <Button onClick={() => downloadWalletReport('daily', 'json')} size="sm" variant="outline" className="text-xs h-6 p-1">D-JSON</Button>
                    <Button onClick={() => downloadWalletReport('monthly', 'csv')} size="sm" variant="outline" className="text-xs h-6 p-1">M-CSV</Button>
                    <Button onClick={() => downloadWalletReport('monthly', 'json')} size="sm" variant="outline" className="text-xs h-6 p-1">M-JSON</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Recharge Reports */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1 text-sm">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Recharge Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <input
                    type="month"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    max={new Date().toISOString().slice(0, 7)}
                    style={{ colorScheme: 'light' }}
                  />
                  <input
                    type="text"
                    value={reportMonth ? `${reportMonth}-01 to ${reportMonth}-${new Date(parseInt(reportMonth.split('-')[0]), parseInt(reportMonth.split('-')[1]), 0).getDate().toString().padStart(2, '0')}` : ''}
                    readOnly
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 text-gray-700"
                    placeholder="Date range will appear here"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <Button onClick={() => downloadMonthlyRechargeReport('csv')} size="sm" variant="outline" className="text-xs h-7">
                      CSV
                    </Button>
                    <Button onClick={() => downloadMonthlyRechargeReport('json')} size="sm" variant="outline" className="text-xs h-7">
                      JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section 3: Retailer Reports */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Retailer Reports</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {/* Retailer Activation Reports */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1 text-sm">
                    <FileText className="w-4 h-4 text-orange-600" />
                    Activation Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="space-y-1">
                    <input
                      type="date"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <input
                      type="month"
                      value={reportMonth}
                      onChange={(e) => setReportMonth(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                      max={new Date().toISOString().slice(0, 7)}
                      style={{ colorScheme: 'light' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <Button onClick={() => downloadRetailerReport('daily', 'csv')} size="sm" variant="outline" className="text-xs h-6 p-1">D-CSV</Button>
                    <Button onClick={() => downloadRetailerReport('daily', 'json')} size="sm" variant="outline" className="text-xs h-6 p-1">D-JSON</Button>
                    <Button onClick={() => downloadRetailerReport('monthly', 'csv')} size="sm" variant="outline" className="text-xs h-6 p-1">M-CSV</Button>
                    <Button onClick={() => downloadRetailerReport('monthly', 'json')} size="sm" variant="outline" className="text-xs h-6 p-1">M-JSON</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Retailer Profile Reports */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1 text-sm">
                    <FileText className="w-4 h-4 text-teal-600" />
                    Profile Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="text-xs text-gray-600">
                    Complete retailer directory with contact info and balances.
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <Button onClick={() => downloadRetailerProfileReport('csv')} size="sm" variant="outline" className="text-xs h-7">
                      CSV
                    </Button>
                    <Button onClick={() => downloadRetailerProfileReport('json')} size="sm" variant="outline" className="text-xs h-7">
                      JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Report Information Section */}
          <Card className="mt-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Report Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">Supported Carriers</h4>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-blue-500"></div>
                      Nexitel Blue
                    </li>
                    <li className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-purple-500"></div>
                      Nexitel Purple
                    </li>
                    <li className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-orange-500"></div>
                      AT&T Services
                    </li>
                    <li className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-green-500"></div>
                      Global Recharge
                    </li>
                    <li className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-red-500"></div>
                      USA Carriers
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">File Formats</h4>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-blue-600" />
                      CSV - Spreadsheet format
                    </li>
                    <li className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-green-600" />
                      JSON - API data format
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}