import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Wallet, Plus, Search, Users, Store, ArrowUp, ArrowDown } from "lucide-react";

export default function FundManagement() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [userType, setUserType] = useState("retailer");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: retailers, isLoading: loadingRetailers } = useQuery({
    queryKey: ["/api/users/role/retailer"],
  });

  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ["/api/users/employee"],
  });

  const addFundsMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: number; amount: string; description: string }) => {
      return await apiRequest(`/api/fund-transfers`, {
        method: "POST",
        body: { toUserId: userId, amount: parseFloat(amount), description },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Funds added successfully",
      });
      setAmount("");
      setDescription("");
      setSelectedUser(null);
      // Invalidate all user-related queries to refresh balances
      queryClient.invalidateQueries({ queryKey: ["/api/users/role/retailer"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/employee"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      // Invalidate individual user queries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${selectedUser.id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add funds",
        variant: "destructive",
      });
    },
  });

  const handleAddFunds = () => {
    if (!selectedUser || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please select a user and enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    addFundsMutation.mutate({
      userId: selectedUser.id,
      amount: parseFloat(amount).toFixed(2),
      description: description || `Fund addition by admin`,
    });
  };

  const currentUsers = userType === "retailer" ? retailers : employees;
  const isLoading = userType === "retailer" ? loadingRetailers : loadingEmployees;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Fund Management</h1>
        <p className="text-gray-600">Add funds to retailer and employee accounts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Funds Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add Funds
            </CardTitle>
            <CardDescription>
              Select a user and add funds to their account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">User Type</Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retailer">Retailers</SelectItem>
                  <SelectItem value="employee">Employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Select User</Label>
              <Select
                value={selectedUser?.id?.toString() || ""}
                onValueChange={(value) => {
                  const user = Array.isArray(currentUsers) ? currentUsers.find((u: any) => u.id.toString() === value) : null;
                  setSelectedUser(user);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(currentUsers) ? currentUsers : []).map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username} - ${user.balance || "0.00"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUser && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedUser.username}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">${selectedUser.balance || "0.00"}</p>
                    <p className="text-sm text-gray-500">Current Balance</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Add</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Fund addition reason..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleAddFunds}
              className="w-full"
              disabled={addFundsMutation.isPending || !selectedUser || !amount}
            >
              {addFundsMutation.isPending ? "Adding Funds..." : "Add Funds"}
            </Button>
          </CardContent>
        </Card>

        {/* User Balance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Balance Overview
            </CardTitle>
            <CardDescription>
              Current balance status for all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(Array.isArray(currentUsers) ? currentUsers : []).map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                        userType === "retailer" ? "bg-purple-100" : "bg-green-100"
                      }`}>
                        {userType === "retailer" ? (
                          <Store className={`w-5 h-5 ${userType === "retailer" ? "text-purple-600" : "text-green-600"}`} />
                        ) : (
                          <Users className={`w-5 h-5 ${userType === "retailer" ? "text-purple-600" : "text-green-600"}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">${user.balance || "0.00"}</p>
                      <p className="text-sm text-gray-500">Balance</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Retailer Balance</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${(Array.isArray(retailers) ? retailers : []).reduce((sum: number, r: any) => sum + parseFloat(r.balance || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Store className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employee Balance</p>
                <p className="text-2xl font-bold text-green-900">
                  ${(Array.isArray(employees) ? employees : []).reduce((sum: number, e: any) => sum + parseFloat(e.balance || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(Array.isArray(retailers) ? retailers.length : 0) + (Array.isArray(employees) ? employees.length : 0)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}