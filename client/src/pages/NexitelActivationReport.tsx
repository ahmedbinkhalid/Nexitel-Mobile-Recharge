import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, FileText, Calendar, Phone } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { handleBackNavigation } from "@shared/constants";

interface ActivationRecord {
  id: number;
  iccid: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  carrier: string;
  plan: string;
  status: string;
  activationDate: string;
  createdAt: string;
}

export default function NexitelActivationReport() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const handleBackNavigationClick = () => {
    handleBackNavigation(user?.role);
  };

  // Fetch real activation data from database
  const { data: activations = [], isLoading, error } = useQuery<ActivationRecord[]>({
    queryKey: ['/api/nexitel-activations'],
    retry: 2,
  });

  // Clean phone number for search (remove formatting)
  const cleanPhoneNumber = (phone: string) => {
    return phone.replace(/[\s\-\(\)+]/g, '');
  };

  // Filter activations based on search term
  const filteredActivations = activations.filter((activation: ActivationRecord) => {
    if (!searchTerm) return true;
    
    const searchTermClean = cleanPhoneNumber(searchTerm);
    const phoneClean = cleanPhoneNumber(activation.customerInfo?.phone || '');
    
    return phoneClean.includes(searchTermClean) ||
           activation.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           activation.iccid.toLowerCase().includes(searchTerm.toLowerCase()) ||
           activation.id.toString().includes(searchTerm);
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-lg">Loading activation records...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-600 text-lg mb-2">Error loading activation records</div>
              <div className="text-gray-600">Please try refreshing the page</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={handleBackNavigationClick}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {user?.role === "retailer" ? "Back to Dashboard" : "Back to Home"}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            Nexitel Activation Report
          </h1>
          <p className="text-gray-600 mt-2">View and manage activation records</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by phone number (any format: 5551234567, 555-123-4567, etc.), customer name, or ICCID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="w-4 h-4 mr-2" />
                Filter by Date
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredActivations.length} of {activations.length} activation records
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </CardContent>
        </Card>

        {/* Activations List */}
        <div className="space-y-4">
          {filteredActivations.map((activation: ActivationRecord) => (
            <Card key={activation.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div>
                    <p className="font-semibold text-gray-900">ACT-{activation.id}</p>
                    <p className="text-sm text-gray-500">
                      {activation.activationDate ? new Date(activation.activationDate).toLocaleDateString() : 
                       new Date(activation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium">{activation.customerInfo?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {activation.customerInfo?.phone || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <Badge className={activation.carrier === "Nexitel Purple" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
                      {activation.carrier}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">{activation.plan}</p>
                    <p className="text-xs text-gray-500">Plan</p>
                  </div>
                  
                  <div>
                    <Badge className={getStatusColor(activation.status)}>
                      {activation.status}
                    </Badge>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">ICCID</p>
                    <p className="text-sm font-mono text-gray-700">{activation.iccid}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredActivations.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? `No activation records found matching "${searchTerm}"`
                  : "No activation records available yet"}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}