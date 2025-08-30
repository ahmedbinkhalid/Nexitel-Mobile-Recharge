import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye, 
  DollarSign,
  Store,
  Users,
  Upload,
  FileText,
  Wallet,
  CreditCard,
  Shield
} from "lucide-react";
import { 
  insertUserSchema, 
  insertUserWalletPermissionSchema,
  type User, 
  type CommissionGroup, 
  type RetailerDocument,
  type InsertUserWalletPermission,
  type UserWalletPermission
} from "@shared/schema";

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
import { ObjectUploader } from "@/components/ObjectUploader";
import { RetailerDocumentUploader } from "@/components/RetailerDocumentUploader";
import { RetailerPermissionsDialog } from "@/components/RetailerPermissionsDialog";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const retailerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  canAddFunds: z.boolean().default(false),
  maxDailyFunding: z.string().optional(),
  maxMonthlyFunding: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RetailerFormData = z.infer<typeof retailerSchema>;

export default function RetailerManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRetailer, setSelectedRetailer] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissionsRetailer, setPermissionsRetailer] = useState<User | null>(null);

  const { toast } = useToast();

  const form = useForm<RetailerFormData>({
    resolver: zodResolver(retailerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      role: "retailer",
      employeeRole: "",
      balance: "0.00",
      isActive: true,
      commissionGroupId: undefined,
      canAddFunds: false,
      maxDailyFunding: "",
      maxMonthlyFunding: "",
    },
  });

  // Fetch retailers
  const { data: retailers = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/role/retailer"],
  });

  // Fetch commission groups
  const { data: commissionGroups = [] } = useQuery<CommissionGroup[]>({
    queryKey: ["/api/admin/commission-groups"],
  });

  // Create retailer mutation
  const createRetailerMutation = useMutation({
    mutationFn: async (data: RetailerFormData) => {
      const { confirmPassword, ...retailerData } = data;
      return await apiRequest("/api/users", { method: "POST", body: retailerData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/role/retailer"] });
      toast({
        title: "Success",
        description: "Retailer created successfully",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create retailer",
        variant: "destructive",
      });
    },
  });

  // Update retailer mutation
  const updateRetailerMutation = useMutation({
    mutationFn: async (data: RetailerFormData) => {
      const { confirmPassword, password, canAddFunds, maxDailyFunding, maxMonthlyFunding, ...updateData } = data;
      const payload = password ? { ...updateData, password } : updateData;
      return await apiRequest(`/api/users/${selectedRetailer?.id}`, { method: "PATCH", body: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/role/retailer"] });
      toast({
        title: "Success",
        description: "Retailer updated successfully",
      });
      setDialogOpen(false);
      form.reset();
      setSelectedRetailer(null);
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update retailer",
        variant: "destructive",
      });
    },
  });

  // Delete retailer mutation
  const deleteRetailerMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/users/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/role/retailer"] });
      toast({
        title: "Success",
        description: "Retailer deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete retailer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RetailerFormData) => {
    if (isEditing && selectedRetailer) {
      updateRetailerMutation.mutate(data);
    } else {
      createRetailerMutation.mutate(data);
    }
  };

  const handleEdit = (retailer: User) => {
    setSelectedRetailer(retailer);
    setIsEditing(true);
    form.reset({
      username: retailer.username,
      password: "",
      confirmPassword: "",
      email: retailer.email || "",
      role: "retailer",
      employeeRole: retailer.employeeRole || "",
      balance: retailer.balance || "0.00",
      isActive: retailer.isActive || false,
      commissionGroupId: retailer.commissionGroupId || undefined,
      canAddFunds: false, // Will be loaded separately from permissions
      maxDailyFunding: "",
      maxMonthlyFunding: "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this retailer?")) {
      deleteRetailerMutation.mutate(id);
    }
  };

  const openCreateDialog = () => {
    setIsEditing(false);
    setSelectedRetailer(null);
    form.reset({
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      role: "retailer",
      employeeRole: "",
      balance: "0.00",
      isActive: true,
      commissionGroupId: undefined,
      canAddFunds: false,
      maxDailyFunding: "",
      maxMonthlyFunding: "",
    });
    setDialogOpen(true);
  };

  const filteredRetailers = retailers.filter((retailer: User) =>
    retailer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    retailer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBalance = retailers.reduce((sum: number, retailer: User) => 
    sum + parseFloat(retailer.balance || "0"), 0
  );

  const getCommissionGroupName = (commissionGroupId: number | null | undefined) => {
    if (!commissionGroupId) return "Not Assigned";
    const group = commissionGroups.find(g => g.id === commissionGroupId);
    return group ? group.name : "Unknown Group";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Retailer Management</h1>
          <p className="text-muted-foreground">
            Manage retailer accounts and portal balances
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Retailers</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retailers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active retailer partners
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Retailers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retailers.filter((r: User) => r.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Combined retailer balances
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search retailers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Retailer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Retailer" : "Create New Retailer"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password {isEditing && "(leave empty to keep current)"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirm password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="commissionGroupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Group</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select commission group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {commissionGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Balance</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Wallet Funding Permissions */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-medium">Wallet Funding Permissions</h4>
                  
                  <FormField
                    control={form.control}
                    name="canAddFunds"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Allow Self-Funding</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Enable retailer to add funds to their wallet
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("canAddFunds") && (
                    <>
                      <FormField
                        control={form.control}
                        name="maxDailyFunding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Funding Limit ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                min="0"
                                placeholder="No limit"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="maxMonthlyFunding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Funding Limit ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                min="0"
                                placeholder="No limit"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createRetailerMutation.isPending || updateRetailerMutation.isPending}
                  >
                    {isEditing ? "Update" : "Create"} Retailer
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Retailers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Retailers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading retailers...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Commission Group</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRetailers.map((retailer: User) => (
                  <TableRow key={retailer.id}>
                    <TableCell className="font-medium">
                      {retailer.username}
                    </TableCell>
                    <TableCell>{retailer.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getCommissionGroupName(retailer.commissionGroupId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">
                        ${parseFloat(retailer.balance || "0").toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={retailer.isActive ? "default" : "secondary"}>
                        {retailer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {retailer.createdAt ? new Date(retailer.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(retailer)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(retailer.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRetailer(retailer);
                            setShowDocumentDialog(true);
                          }}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRetailer(retailer);
                            setShowWalletDialog(true);
                          }}
                        >
                          <Wallet className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPermissionsRetailer(retailer);
                            setShowPermissions(true);
                          }}
                          title="All Service Permissions"
                        >
                          <Shield className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Document Upload Dialog */}
      <DocumentUploadDialog 
        retailer={selectedRetailer}
        open={showDocumentDialog}
        onClose={() => setShowDocumentDialog(false)}
      />

      {/* Wallet Permissions Dialog */}
      <WalletPermissionsDialog 
        retailer={selectedRetailer}
        open={showWalletDialog}
        onClose={() => setShowWalletDialog(false)}
      />

      {/* Retailer Permissions Dialog */}
      <RetailerPermissionsDialog
        retailer={permissionsRetailer}
        open={showPermissions}
        onClose={() => {
          setShowPermissions(false);
          setPermissionsRetailer(null);
        }}
      />


    </div>
  );
}

// Document types for retailer uploads
const DOCUMENT_TYPES = [
  { value: "reseller_certificate", label: "Reseller Certificate" },
  { value: "business_certificate", label: "Business Certificate" },
  { value: "ein_certificate", label: "EIN Certificate" },
  { value: "ach_sign_form", label: "ACH Sign Form" },
  { value: "dealer_agreement", label: "Dealer Agreement" }
] as const;

// Document Upload Dialog Component
function DocumentUploadDialog({ 
  retailer, 
  open, 
  onClose 
}: { 
  retailer: User | null; 
  open: boolean; 
  onClose: () => void; 
}) {
  // Fetch retailer documents
  const { data: documents = [], refetch: refetchDocuments } = useQuery<RetailerDocument[]>({
    queryKey: [`/api/retailer-documents/${retailer?.id}`],
    enabled: !!retailer?.id && open
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Management - {retailer?.username}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {retailer && (
            <RetailerDocumentUploader
              retailerId={retailer.id}
              documents={documents}
              onDocumentUploaded={refetchDocuments}
              showDownloadButtons={true}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Wallet Permissions Dialog Component
function WalletPermissionsDialog({ 
  retailer, 
  open, 
  onClose 
}: { 
  retailer: User | null; 
  open: boolean; 
  onClose: () => void; 
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const walletForm = useForm<InsertUserWalletPermission>({
    resolver: zodResolver(insertUserWalletPermissionSchema),
    defaultValues: {
      canAddFunds: false,
      maxDailyFunding: "0",
      maxMonthlyFunding: "0",
    }
  });

  // Fetch current wallet permissions
  const { data: currentPermissions, refetch } = useQuery<UserWalletPermission>({
    queryKey: [`/api/wallet/permissions/${retailer?.id}`],
    enabled: !!retailer?.id && open
  });

  // Update form when permissions are loaded
  useEffect(() => {
    if (currentPermissions) {
      walletForm.reset({
        userId: retailer?.id,
        canAddFunds: currentPermissions.canAddFunds || false,
        maxDailyFunding: currentPermissions.maxDailyFunding || "0",
        maxMonthlyFunding: currentPermissions.maxMonthlyFunding || "0",
      });
    } else if (retailer?.id) {
      walletForm.reset({
        userId: retailer.id,
        canAddFunds: false,
        maxDailyFunding: "0",
        maxMonthlyFunding: "0",
      });
    }
  }, [currentPermissions, retailer, walletForm]);

  const saveWalletPermissions = useMutation({
    mutationFn: async (data: InsertUserWalletPermission) => {
      if (!retailer?.id) throw new Error("No retailer selected");
      
      // Check if permissions exist
      if (currentPermissions) {
        return apiRequest(`/api/wallet/permissions/${retailer.id}`, { method: "PUT", body: data });
      } else {
        return apiRequest("/api/wallet/permissions", { method: "POST", body: { ...data, userId: retailer.id } });
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Wallet permissions updated successfully",
      });
      refetch();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update wallet permissions",
        variant: "destructive",
      });
    }
  });

  const onSubmitWalletPermissions = (data: InsertUserWalletPermission) => {
    saveWalletPermissions.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Permissions - {retailer?.username}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...walletForm}>
          <form onSubmit={walletForm.handleSubmit(onSubmitWalletPermissions)} className="space-y-4">
            <FormField
              control={walletForm.control}
              name="canAddFunds"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Allow Wallet Funding</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this retailer to add funds to their wallet using payment cards
                    </div>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-5 h-5"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={walletForm.control}
              name="maxDailyFunding"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Daily Funding Limit ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01"
                      placeholder="Enter daily limit (0 = no limit)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={walletForm.control}
              name="maxMonthlyFunding"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Monthly Funding Limit ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01"
                      placeholder="Enter monthly limit (0 = no limit)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saveWalletPermissions.isPending}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {saveWalletPermissions.isPending ? "Saving..." : "Save Permissions"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
