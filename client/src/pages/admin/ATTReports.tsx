import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, BarChart3, Download, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";

// Sample data for demonstration
const SAMPLE_ACTIVATION_REPORTS = [
  {
    id: "ATT-ACT-2025-001",
    customerName: "John Doe",
    phoneNumber: "+1 (555) 123-4567",
    planType: "AT&T Prepaid",
    activationDate: "2025-01-15",
    status: "Completed",
    commission: "$5.00"
  },
  {
    id: "ATT-ACT-2025-002",
    customerName: "Jane Smith", 
    phoneNumber: "+1 (555) 987-6543",
    planType: "AT&T Postpaid",
    activationDate: "2025-01-14",
    status: "Completed",
    commission: "$8.00"
  },
  {
    id: "ATT-ACT-2025-003",
    customerName: "Mike Johnson",
    phoneNumber: "+1 (555) 456-7890",
    planType: "AT&T Prepaid",
    activationDate: "2025-01-13",
    status: "Pending",
    commission: "$0.00"
  }
];

const SAMPLE_RECHARGE_REPORTS = [
  {
    id: "ATT-RCH-2025-001",
    phoneNumber: "+1 (555) 123-4567",
    amount: "$25.00",
    planType: "AT&T Prepaid",
    rechargeDate: "2025-01-15",
    status: "Completed",
    commission: "$2.50"
  },
  {
    id: "ATT-RCH-2025-002",
    phoneNumber: "+1 (555) 987-6543",
    amount: "$50.00",
    planType: "AT&T Postpaid",
    rechargeDate: "2025-01-14",
    status: "Completed",
    commission: "$5.00"
  }
];

export default function ATTReports() {
  console.log("ATTReports component is loading - clean reports interface!");
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("activation");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  return (
    <div className="space-y-6">
      {/* Header - Centered Layout */}
      <div className="flex justify-center">
        <div className="w-full max-w-6xl">
          <Link href={user?.role === 'retailer' ? '/retailer/dashboard' : '/admin'}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center mb-2">
              <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
              AT&T Reports
            </h1>
            <p className="text-gray-600">View AT&T activation and recharge reports</p>
          </div>
        </div>
      </div>

      {/* Reports Tabs - Centered */}
      <div className="flex justify-center">
        <div className="w-full max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="activation" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Activation Reports
              </TabsTrigger>
              <TabsTrigger value="recharge" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Recharge Reports
              </TabsTrigger>
            </TabsList>

            {/* Date Filter */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date-from">From Date</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-to">To Date</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TabsContent value="activation">
              <Card>
                <CardHeader>
                  <CardTitle>AT&T Activation Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">ID</th>
                          <th className="text-left p-3">Customer</th>
                          <th className="text-left p-3">Phone Number</th>
                          <th className="text-left p-3">Plan Type</th>
                          <th className="text-left p-3">Date</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE_ACTIVATION_REPORTS.map((report) => (
                          <tr key={report.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono text-sm">{report.id}</td>
                            <td className="p-3">{report.customerName}</td>
                            <td className="p-3 font-mono">{report.phoneNumber}</td>
                            <td className="p-3">{report.planType}</td>
                            <td className="p-3">{report.activationDate}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                report.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {report.status}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-green-600">{report.commission}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recharge">
              <Card>
                <CardHeader>
                  <CardTitle>AT&T Recharge Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">ID</th>
                          <th className="text-left p-3">Phone Number</th>
                          <th className="text-left p-3">Amount</th>
                          <th className="text-left p-3">Plan Type</th>
                          <th className="text-left p-3">Date</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE_RECHARGE_REPORTS.map((report) => (
                          <tr key={report.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono text-sm">{report.id}</td>
                            <td className="p-3 font-mono">{report.phoneNumber}</td>
                            <td className="p-3 font-semibold">{report.amount}</td>
                            <td className="p-3">{report.planType}</td>
                            <td className="p-3">{report.rechargeDate}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                {report.status}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-green-600">{report.commission}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}