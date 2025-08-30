import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, CreditCard, Calendar, Phone, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";

const SAMPLE_RECHARGES = [
  {
    id: "RCH-2025-001",
    phoneNumber: "+1 (555) 123-4567",
    network: "Nexitel Purple",
    amount: 50,
    status: "Completed",
    rechargeDate: "2025-01-12 14:30",
    transactionId: "TXN-123456789"
  },
  {
    id: "RCH-2025-002",
    phoneNumber: "+1 (555) 987-6543",
    network: "Nexitel Blue", 
    amount: 25,
    status: "Pending",
    rechargeDate: "2025-01-12 15:45",
    transactionId: "TXN-123456790"
  },
  {
    id: "RCH-2025-003",
    phoneNumber: "+1 (555) 456-7890",
    network: "Nexitel Purple",
    amount: 100,
    status: "Failed",
    rechargeDate: "2025-01-12 10:15",
    transactionId: "TXN-123456791"
  },
  {
    id: "RCH-2025-004",
    phoneNumber: "+1 (555) 321-0987",
    network: "Nexitel Blue",
    amount: 75,
    status: "Completed",
    rechargeDate: "2025-01-11 16:20",
    transactionId: "TXN-123456792"
  }
];

export default function NexitelRechargeReport() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

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
  
  const filteredRecharges = SAMPLE_RECHARGES.filter(recharge =>
    recharge.phoneNumber.includes(searchTerm) ||
    recharge.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recharge.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalAmount = filteredRecharges
    .filter(r => r.status === "Completed")
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={handleBackNavigation}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {user?.role === "retailer" ? "Back to Dashboard" : "Back to Home"}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CreditCard className="w-8 h-8 text-purple-600 mr-3" />
            Nexitel Recharge Report
          </h1>
          <p className="text-gray-600 mt-2">View and manage recharge transactions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">${totalAmount}</p>
                  <p className="text-gray-600">Total Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{filteredRecharges.length}</p>
                  <p className="text-gray-600">Total Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold">{filteredRecharges.filter(r => r.status === "Completed").length}</p>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold">{filteredRecharges.filter(r => r.status === "Pending").length}</p>
                  <p className="text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by phone number, recharge ID, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Calendar className="w-4 h-4 mr-2" />
                Filter by Date
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recharges List */}
        <div className="space-y-4">
          {filteredRecharges.map((recharge) => (
            <Card key={recharge.id} className="bg-white shadow-lg">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{recharge.id}</p>
                    <p className="text-sm text-gray-500">{recharge.rechargeDate}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {recharge.phoneNumber}
                    </p>
                    <p className="text-sm text-gray-600">{recharge.transactionId}</p>
                  </div>
                  
                  <div>
                    <Badge className={recharge.network === "Nexitel Purple" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
                      {recharge.network}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-lg font-bold text-green-600">${recharge.amount}</p>
                    <p className="text-xs text-gray-500">Amount</p>
                  </div>
                  
                  <div>
                    <Badge className={getStatusColor(recharge.status)}>
                      {recharge.status}
                    </Badge>
                  </div>
                  
                  <div className="text-right">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecharges.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recharge records found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}