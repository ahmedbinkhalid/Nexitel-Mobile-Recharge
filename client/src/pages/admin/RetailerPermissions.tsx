import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, DollarSign, Users, CheckCircle, XCircle, Edit2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface UserWalletPermission {
  id: number;
  userId: number;
  canAddFunds: boolean;
  maxDailyFunding: string | null;
  maxMonthlyFunding: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ATTPermissions {
  id: number;
  userId: number;
  canActivate: boolean;
  canRecharge: boolean;
  canSimSwap: boolean;
  canSellDataAddons: boolean;
  canPortIn: boolean;
  canEnableWifiCalling: boolean;
  canBulkActivate: boolean;
  maxDailyActivations: number;
  maxDailyRecharges: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  balance: string;
  isActive: boolean;
}

export default function RetailerPermissions() {
  const { toast } = useToast();
  const [selectedRetailer, setSelectedRetailer] = useState<User | null>(null);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  
  // AT&T Permissions state
  const [attPermissions, setAttPermissions] = useState<ATTPermissions | null>(null);
  const [canActivate, setCanActivate] = useState(false);
  const [canRecharge, setCanRecharge] = useState(false);
  const [canSimSwap, setCanSimSwap] = useState(false);
  const [canSellDataAddons, setCanSellDataAddons] = useState(false);
  const [canPortIn, setCanPortIn] = useState(false);
  const [canEnableWifiCalling, setCanEnableWifiCalling] = useState(false);
  const [canBulkActivate, setCanBulkActivate] = useState(false);
  const [maxDailyActivations, setMaxDailyActivations] = useState("50");
  const [maxDailyRecharges, setMaxDailyRecharges] = useState("100");

  // Get all retailers
  const { data: retailers = [], isLoading: loadingRetailers } = useQuery<User[]>({
    queryKey: ["/api/users/role/retailer"],
  });

  // Get all AT&T permissions - we'll fetch individually for now
  const { data: permissions = [], isLoading: loadingPermissions } = useQuery<ATTPermissions[]>({
    queryKey: ["/api/att/permissions/all"],
    enabled: false, // We'll fetch individual permissions instead
  });

  const updatePermissionMutation = useMutation({
    mutationFn: async (data: ATTPermissions) => {
      const response = await fetch(`/api/att/permissions/${data.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          canActivate: data.canActivate,
          canRecharge: data.canRecharge,
          canSimSwap: data.canSimSwap,
          canSellDataAddons: data.canSellDataAddons,
          canPortIn: data.canPortIn,
          canEnableWifiCalling: data.canEnableWifiCalling,
          canBulkActivate: data.canBulkActivate,
          maxDailyActivations: data.maxDailyActivations,
          maxDailyRecharges: data.maxDailyRecharges,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update AT&T permissions");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "AT&T permissions updated successfully",
      });
      setIsPermissionDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update AT&T permissions",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedRetailer(null);
    setAttPermissions(null);
    setCanActivate(false);
    setCanRecharge(false);
    setCanSimSwap(false);
    setCanSellDataAddons(false);
    setCanPortIn(false);
    setCanEnableWifiCalling(false);
    setCanBulkActivate(false);
    setMaxDailyActivations("50");
    setMaxDailyRecharges("100");
  };

  const handleEditPermissions = async (retailer: User) => {
    setSelectedRetailer(retailer);
    
    // Fetch AT&T permissions for this retailer
    try {
      console.log("Fetching AT&T permissions for retailer:", retailer.id);
      const response = await fetch(`/api/att/permissions/${retailer.id}`);
      if (response.ok) {
        const attPerms = await response.json();
        console.log("AT&T permissions fetched:", attPerms);
        setAttPermissions(attPerms);
        
        // Set form values from fetched permissions
        setCanActivate(attPerms.canActivate);
        setCanRecharge(attPerms.canRecharge);
        setCanSimSwap(attPerms.canSimSwap);
        setCanSellDataAddons(attPerms.canSellDataAddons);
        setCanPortIn(attPerms.canPortIn);
        setCanEnableWifiCalling(attPerms.canEnableWifiCalling);
        setCanBulkActivate(attPerms.canBulkActivate);
        setMaxDailyActivations(attPerms.maxDailyActivations.toString());
        setMaxDailyRecharges(attPerms.maxDailyRecharges.toString());
      } else {
        console.log("AT&T permissions not found, using defaults");
        setAttPermissions(null);
        // Set default values
        setCanActivate(false);
        setCanRecharge(false);
        setCanSimSwap(false);
        setCanSellDataAddons(false);
        setCanPortIn(false);
        setCanEnableWifiCalling(false);
        setCanBulkActivate(false);
        setMaxDailyActivations("50");
        setMaxDailyRecharges("100");
      }
    } catch (error) {
      console.error("Failed to fetch AT&T permissions:", error);
      setAttPermissions(null);
    }
    
    setIsPermissionDialogOpen(true);
  };

  const handleSavePermissions = () => {
    if (!selectedRetailer) return;

    const data: ATTPermissions = {
      id: attPermissions?.id || 0,
      userId: selectedRetailer.id,
      canActivate,
      canRecharge,
      canSimSwap,
      canSellDataAddons,
      canPortIn,
      canEnableWifiCalling,
      canBulkActivate,
      maxDailyActivations: parseInt(maxDailyActivations) || 50,
      maxDailyRecharges: parseInt(maxDailyRecharges) || 100,
    };

    updatePermissionMutation.mutate(data);
  };

  const getPermissionForRetailer = (retailerId: number): ATTPermissions | undefined => {
    return attPermissions && attPermissions.userId === retailerId ? attPermissions : undefined;
  };

  if (loadingRetailers || loadingPermissions) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AT&T Retailer Permissions</h1>
            <p className="text-gray-600">Control AT&T service access and limits for each retailer</p>
          </div>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AT&T Retailer Permissions</h1>
          <p className="text-gray-600">Control AT&T service access and limits for each retailer</p>
        </div>
      </div>

      <div className="grid gap-4">
        {(retailers as User[]).map((retailer: User) => {
          
          return (
            <Card key={retailer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{retailer.username}</h3>
                      <p className="text-gray-600 text-sm">{retailer.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">Balance:</span>
                        <span className="font-medium text-green-600">${retailer.balance}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-2">
                        AT&T Services
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Click Edit to Configure
                      </Badge>
                    </div>
                    
                    <Button
                      onClick={() => handleEditPermissions(retailer)}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit AT&T Permissions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              AT&T Permissions - {selectedRetailer?.username}
            </DialogTitle>
            <DialogDescription>
              Configure AT&T service access and daily limits for this retailer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Core Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Core Services</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Activation Services</Label>
                    <p className="text-xs text-gray-500">Enable new line activations</p>
                  </div>
                  <Switch
                    checked={canActivate}
                    onCheckedChange={setCanActivate}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Recharge Services</Label>
                    <p className="text-xs text-gray-500">Top-up existing lines</p>
                  </div>
                  <Switch
                    checked={canRecharge}
                    onCheckedChange={setCanRecharge}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">SIM Swap</Label>
                    <p className="text-xs text-gray-500">Replace damaged SIM cards</p>
                  </div>
                  <Switch
                    checked={canSimSwap}
                    onCheckedChange={setCanSimSwap}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Data Add-ons</Label>
                    <p className="text-xs text-gray-500">Sell additional data packages</p>
                  </div>
                  <Switch
                    checked={canSellDataAddons}
                    onCheckedChange={setCanSellDataAddons}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Advanced Services</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Port-In Services</Label>
                    <p className="text-xs text-gray-500">Transfer numbers from other carriers</p>
                  </div>
                  <Switch
                    checked={canPortIn}
                    onCheckedChange={setCanPortIn}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">WiFi Calling</Label>
                    <p className="text-xs text-gray-500">Enable WiFi calling features</p>
                  </div>
                  <Switch
                    checked={canEnableWifiCalling}
                    onCheckedChange={setCanEnableWifiCalling}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Bulk Activation</Label>
                    <p className="text-xs text-gray-500">Process multiple activations</p>
                  </div>
                  <Switch
                    checked={canBulkActivate}
                    onCheckedChange={setCanBulkActivate}
                  />
                </div>
              </div>
            </div>

            {/* Daily Limits */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Daily Limits</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxDailyActivations">Max Daily Activations</Label>
                  <Input
                    id="maxDailyActivations"
                    type="number"
                    value={maxDailyActivations}
                    onChange={(e) => setMaxDailyActivations(e.target.value)}
                    min="1"
                    max="1000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxDailyRecharges">Max Daily Recharges</Label>
                  <Input
                    id="maxDailyRecharges"
                    type="number"
                    value={maxDailyRecharges}
                    onChange={(e) => setMaxDailyRecharges(e.target.value)}
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsPermissionDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={updatePermissionMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updatePermissionMutation.isPending ? "Saving..." : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}