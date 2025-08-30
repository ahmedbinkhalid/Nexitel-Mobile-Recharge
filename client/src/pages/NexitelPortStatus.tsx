import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Phone, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { handleBackNavigation } from "@shared/constants";

const SAMPLE_PORT_REQUESTS = [
  {
    id: "PORT-2025-001",
    phoneNumber: "+1 (555) 123-4567",
    fromCarrier: "Verizon",
    toNetwork: "Nexitel Purple",
    status: "Completed",
    submittedDate: "2025-01-10",
    completedDate: "2025-01-12",
    estimatedCompletion: "2025-01-12",
    customerName: "John Doe"
  },
  {
    id: "PORT-2025-002",
    phoneNumber: "+1 (555) 987-6543",
    fromCarrier: "T-Mobile",
    toNetwork: "Nexitel Blue",
    status: "In Progress",
    submittedDate: "2025-01-11",
    completedDate: null,
    estimatedCompletion: "2025-01-13",
    customerName: "Jane Smith"
  },
  {
    id: "PORT-2025-003",
    phoneNumber: "+1 (555) 456-7890",
    fromCarrier: "AT&T",
    toNetwork: "Nexitel Purple",
    status: "Pending Validation",
    submittedDate: "2025-01-12",
    completedDate: null,
    estimatedCompletion: "2025-01-14",
    customerName: "Mike Johnson"
  },
  {
    id: "PORT-2025-004",
    phoneNumber: "+1 (555) 321-0987",
    fromCarrier: "Sprint", 
    toNetwork: "Nexitel Blue",
    status: "Failed",
    submittedDate: "2025-01-09",
    completedDate: null,
    estimatedCompletion: "2025-01-11",
    customerName: "Sarah Wilson"
  }
];

export default function NexitelPortStatus() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const handleBackNavigationClick = () => {
    handleBackNavigation(user?.role);
  };
  
  const filteredRequests = SAMPLE_PORT_REQUESTS.filter(request =>
    request.phoneNumber.includes(searchTerm) ||
    request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "In Progress": return <Clock className="w-5 h-5 text-blue-600" />;
      case "Pending Validation": return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "Failed": return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Pending Validation": return "bg-yellow-100 text-yellow-800";
      case "Failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={handleBackNavigationClick}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {user?.role === "retailer" ? "Back to Dashboard" : "Back to Home"}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Phone className="w-8 h-8 text-green-600 mr-3" />
            Nexitel Port-In Status
          </h1>
          <p className="text-gray-600 mt-2">Track your number porting requests</p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{filteredRequests.filter(r => r.status === "Completed").length}</p>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{filteredRequests.filter(r => r.status === "In Progress").length}</p>
                  <p className="text-gray-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{filteredRequests.filter(r => r.status === "Pending Validation").length}</p>
                  <p className="text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{filteredRequests.filter(r => r.status === "Failed").length}</p>
                  <p className="text-gray-600">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by phone number, request ID, or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Port Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="bg-white shadow-lg">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Request Info */}
                  <div>
                    <div className="flex items-center mb-2">
                      {getStatusIcon(request.status)}
                      <span className="ml-2 font-semibold">{request.id}</span>
                    </div>
                    <p className="text-sm text-gray-600">{request.customerName}</p>
                    <p className="text-sm text-gray-600">{request.phoneNumber}</p>
                  </div>

                  {/* Carrier Info */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">From → To</p>
                    <p className="font-medium">{request.fromCarrier}</p>
                    <p className="text-sm">↓</p>
                    <Badge className={request.toNetwork === "Nexitel Purple" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
                      {request.toNetwork}
                    </Badge>
                  </div>

                  {/* Status and Dates */}
                  <div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Submitted: {request.submittedDate}</p>
                      <p>Expected: {request.estimatedCompletion}</p>
                      {request.completedDate && (
                        <p className="text-green-600">Completed: {request.completedDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {request.status === "Failed" && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Retry Request
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Timeline */}
                {request.status !== "Failed" && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${request.status === "Completed" || request.status === "In Progress" || request.status === "Pending Validation" ? "bg-green-600" : "bg-gray-300"}`}></div>
                        <div className={`h-0.5 w-16 ${request.status === "Completed" || request.status === "In Progress" ? "bg-green-600" : "bg-gray-300"}`}></div>
                        <div className={`w-3 h-3 rounded-full ${request.status === "Completed" || request.status === "In Progress" ? "bg-green-600" : "bg-gray-300"}`}></div>
                        <div className={`h-0.5 w-16 ${request.status === "Completed" ? "bg-green-600" : "bg-gray-300"}`}></div>
                        <div className={`w-3 h-3 rounded-full ${request.status === "Completed" ? "bg-green-600" : "bg-gray-300"}`}></div>
                      </div>
                      <div className="flex text-xs text-gray-500 space-x-12">
                        <span>Submitted</span>
                        <span>Validating</span>
                        <span>Complete</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No port-in requests found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}