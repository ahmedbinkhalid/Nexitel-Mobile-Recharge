import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, ArrowLeft, AlertCircle, CheckCircle, Clock, XCircle, Search } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Base schema for Nexitel port status
const baseNexitelPortStatusSchema = z.object({
  searchQuery: z.string().min(1, "Phone number or port request ID is required"),
  employeeId: z.string().optional(),
});

// Create schema with conditional employeeId requirement based on user role
const createNexitelPortStatusSchema = (userRole: string) => {
  return baseNexitelPortStatusSchema.extend({
    employeeId: userRole === 'admin' ? z.string().min(1, "Employee ID is required") : z.string().optional(),
  });
};

type NexitelPortStatusRequest = z.infer<typeof baseNexitelPortStatusSchema>;

interface PortStatus {
  id: string;
  phoneNumber: string;
  fromCarrier: string;
  requestDate: string;
  status: "pending" | "in-progress" | "completed" | "failed" | "cancelled";
  estimatedCompletion: string;
  notes?: string;
  customerName: string;
  customerEmail: string;
}

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  failed: "bg-red-100 text-red-800 border-red-300",
  cancelled: "bg-gray-100 text-gray-800 border-gray-300",
};

const STATUS_ICONS = {
  pending: Clock,
  "in-progress": ArrowRightLeft,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
};

export default function NexitelPortStatus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portStatus, setPortStatus] = useState<PortStatus | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

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

  const form = useForm<NexitelPortStatusRequest>({
    resolver: zodResolver(createNexitelPortStatusSchema(user?.role || 'retailer')),
    defaultValues: {
      searchQuery: "",
      employeeId: "",
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (data: NexitelPortStatusRequest) => {
      return apiRequest('/api/nexitel/port-status', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (result) => {
      setPortStatus(result);
      setSearchPerformed(true);
      if (result) {
        toast({
          title: "Port Status Found",
          description: `Found port request for ${result.phoneNumber}`,
          variant: "default",
        });
      } else {
        toast({
          title: "No Results",
          description: "No port request found for the provided information",
          variant: "default",
        });
      }
    },
    onError: (error: Error) => {
      setPortStatus(null);
      setSearchPerformed(true);
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NexitelPortStatusRequest) => {
    statusMutation.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50">
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
                <ArrowRightLeft className="w-8 h-8 text-teal-600 mr-3" />
                Nexitel Port-In Status
              </h1>
              <p className="text-gray-600 mt-2">Check and manage number porting requests for Nexitel</p>
            </div>
          </div>
          
          {/* Balance Display */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Your Balance</div>
            <div className="text-2xl font-bold text-teal-600">${user?.balance || "0.00"}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 text-teal-600 mr-2" />
                  Search Port Request
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

                    {/* Search Field */}
                    <FormField
                      control={form.control}
                      name="searchQuery"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number or Port Request ID</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter phone number or port request ID"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      disabled={statusMutation.isPending}
                    >
                      {statusMutation.isPending ? "Searching..." : "Search Port Status"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Port Status Results */}
            {searchPerformed && (
              <Card className="bg-white shadow-lg mt-6">
                <CardHeader>
                  <CardTitle>Port Status Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {portStatus ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone Number</label>
                          <div className="text-lg font-semibold">{portStatus.phoneNumber}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <div className="flex items-center mt-1">
                            <Badge className={STATUS_COLORS[portStatus.status]}>
                              {getStatusIcon(portStatus.status)}
                              <span className="ml-1 capitalize">{portStatus.status.replace('-', ' ')}</span>
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Customer Name</label>
                          <div className="text-lg">{portStatus.customerName}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">From Carrier</label>
                          <div className="text-lg">{portStatus.fromCarrier}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Request Date</label>
                          <div className="text-lg">{new Date(portStatus.requestDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Estimated Completion</label>
                          <div className="text-lg">{new Date(portStatus.estimatedCompletion).toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Customer Email</label>
                        <div className="text-lg">{portStatus.customerEmail}</div>
                      </div>

                      {portStatus.notes && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Notes</label>
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md mt-1">
                            {portStatus.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Port Request Found</h3>
                      <p className="text-gray-600">
                        No port request was found for the provided phone number or request ID.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Information Sidebar */}
          <div>
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Port-In Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      Search by phone number or port request ID
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      Real-time status updates
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      Estimated completion dates provided
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      Customer notification history
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Port Status Types</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                      <span className="text-sm text-gray-600">Awaiting processing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                        <ArrowRightLeft className="w-3 h-3 mr-1" />
                        In Progress
                      </Badge>
                      <span className="text-sm text-gray-600">Being processed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                      <span className="text-sm text-gray-600">Successfully ported</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Typical Timeline</h4>
                  <div className="text-sm text-gray-600">
                    • Wireless ports: 2-4 hours
                    • Landline ports: 3-5 business days
                    • Complex ports: 7-10 business days
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