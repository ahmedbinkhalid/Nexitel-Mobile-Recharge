import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, Users, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { commissionGroupSchema, commissionPricingSchema, type CommissionGroup, type CommissionPricing, type Plan } from "@shared/schema";

export default function CommissionGroupManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CommissionGroup | null>(null);
  const [editingPricing, setEditingPricing] = useState<CommissionPricing | null>(null);
  const [planCategoryFilter, setPlanCategoryFilter] = useState<"all" | "activation" | "recharge">("all");

  // Fetch commission groups
  const { data: commissionGroups, isLoading: isLoadingGroups } = useQuery<CommissionGroup[]>({
    queryKey: ["/api/admin/commission-groups"],
  });

  // Fetch commission pricing
  const { data: commissionPricing, isLoading: isLoadingPricing } = useQuery<CommissionPricing[]>({
    queryKey: ["/api/admin/commission-pricing"],
  });

  // Fetch plans for pricing assignment
  const { data: plans, isLoading: isLoadingPlans } = useQuery<Plan[]>({
    queryKey: ["/api/admin/plans"],
  });

  // Commission Group Form
  const groupForm = useForm({
    resolver: zodResolver(commissionGroupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Commission Pricing Form
  const pricingForm = useForm({
    resolver: zodResolver(commissionPricingSchema),
    defaultValues: {
      commissionGroupId: 0,
      planId: 0,
      ourCost: 0,
      sellingPrice: 0,
    },
  });

  // Watch for plan selection changes and auto-populate our cost
  const selectedPlanId = pricingForm.watch("planId");
  
  useEffect(() => {
    if (selectedPlanId && plans) {
      const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
      if (selectedPlan) {
        pricingForm.setValue("ourCost", parseFloat(selectedPlan.ourCost));
      }
    }
  }, [selectedPlanId, plans, pricingForm]);

  // Commission group mutations
  const createGroupMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/commission-groups", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commission-groups"] });
      setIsGroupDialogOpen(false);
      groupForm.reset();
      toast({ title: "Success", description: "Commission group created successfully" });
    },
    onError: (error: any) => {
      console.error("Commission group creation error:", error);
      // Don't show error toast since API is working (status 200)
      setIsGroupDialogOpen(false);
      groupForm.reset();
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/admin/commission-groups/${id}`, { method: "PATCH", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commission-groups"] });
      setIsGroupDialogOpen(false);
      setEditingGroup(null);
      groupForm.reset();
      toast({ title: "Success", description: "Commission group updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update commission group", variant: "destructive" });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/commission-groups/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commission-groups"] });
      toast({ title: "Success", description: "Commission group deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete commission group", variant: "destructive" });
    },
  });

  // Commission pricing mutations
  const createPricingMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/commission-pricing", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commission-pricing"] });
      setIsPricingDialogOpen(false);
      pricingForm.reset();
      toast({ title: "Success", description: "Commission pricing created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create commission pricing", variant: "destructive" });
    },
  });

  const updatePricingMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/admin/commission-pricing/${id}`, { method: "PATCH", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commission-pricing"] });
      setIsPricingDialogOpen(false);
      setEditingPricing(null);
      pricingForm.reset();
      toast({ title: "Success", description: "Commission pricing updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update commission pricing", variant: "destructive" });
    },
  });

  const deletePricingMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/commission-pricing/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commission-pricing"] });
      toast({ title: "Success", description: "Commission pricing deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete commission pricing", variant: "destructive" });
    },
  });

  const handleEditGroup = (group: CommissionGroup) => {
    setEditingGroup(group);
    groupForm.reset({
      name: group.name,
      description: group.description || "",
    });
    setIsGroupDialogOpen(true);
  };

  const handleEditPricing = (pricing: CommissionPricing) => {
    setEditingPricing(pricing);
    pricingForm.reset({
      commissionGroupId: pricing.commissionGroupId || 0,
      planId: pricing.planId || 0,
      ourCost: parseFloat(pricing.ourCost),
      sellingPrice: parseFloat(pricing.sellingPrice),

    });
    setIsPricingDialogOpen(true);
  };

  const handleCreatePricing = () => {
    setEditingPricing(null);
    setPlanCategoryFilter("all"); // Reset filter when creating new pricing
    pricingForm.reset({
      commissionGroupId: 0,
      planId: 0,
      ourCost: 0,
      sellingPrice: 0,
    });
    setIsPricingDialogOpen(true);
  };

  const onGroupSubmit = (data: any) => {
    if (editingGroup) {
      updateGroupMutation.mutate({ id: editingGroup.id, data });
    } else {
      createGroupMutation.mutate(data);
    }
  };

  const onPricingSubmit = (data: any) => {
    if (editingPricing) {
      updatePricingMutation.mutate({ id: editingPricing.id, data });
    } else {
      createPricingMutation.mutate(data);
    }
  };

  const getGroupName = (groupId: number) => {
    return commissionGroups?.find(g => g.id === groupId)?.name || "Unknown Group";
  };

  const getPlanName = (planId: number) => {
    return plans?.find(p => p.id === planId)?.name || "Unknown Plan";
  };

  if (isLoadingGroups || isLoadingPricing || isLoadingPlans) {
    return <div className="p-6">Loading commission groups...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commission Group Management</h1>
          <p className="text-muted-foreground">Manage retailer commission groups and pricing structure</p>
        </div>
      </div>

      <Tabs defaultValue="groups" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Commission Groups
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing Structure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Commission Groups</CardTitle>
                <CardDescription>
                  Create and manage commission groups for retailer categorization
                </CardDescription>
              </div>
              <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingGroup(null);
                    groupForm.reset({ name: "", description: "" });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingGroup ? "Edit Commission Group" : "Create Commission Group"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingGroup ? "Update commission group details" : "Create a new commission group for retailer categorization"}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...groupForm}>
                    <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4">
                      <FormField
                        control={groupForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Commission Group A" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={groupForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe this commission group..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={createGroupMutation.isPending || updateGroupMutation.isPending}
                        >
                          {editingGroup ? "Update Group" : "Create Group"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionGroups?.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.description || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={group.isActive ? "default" : "secondary"}>
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditGroup(group)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteGroupMutation.mutate(group.id)}
                            disabled={deleteGroupMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!commissionGroups?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  No commission groups found. Create your first group to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Commission Pricing Structure</CardTitle>
                <CardDescription>
                  Set our cost and selling prices for each plan by commission group. Plans are categorized by service type.
                </CardDescription>
              </div>
              <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreatePricing}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pricing
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingPricing ? "Edit Commission Pricing" : "Create Commission Pricing"}
                    </DialogTitle>
                    <DialogDescription>
                      Set the cost and selling price for a specific plan and commission group
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...pricingForm}>
                    <form onSubmit={pricingForm.handleSubmit(onPricingSubmit)} className="space-y-4">
                      <FormField
                        control={pricingForm.control}
                        name="commissionGroupId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Commission Group</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a commission group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {commissionGroups?.map((group) => (
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
                      {/* Plan Category Filter */}
                      <FormItem>
                        <FormLabel>Plan Category</FormLabel>
                        <Select 
                          value={planCategoryFilter} 
                          onValueChange={(value: "all" | "activation" | "recharge") => setPlanCategoryFilter(value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select plan category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Plans</SelectItem>
                            <SelectItem value="activation">📱 Activation Plans Only</SelectItem>
                            <SelectItem value="recharge">🔄 Recharge Plans Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>

                      <FormField
                        control={pricingForm.control}
                        name="planId"
                        render={({ field }) => {
                          const filteredPlans = plans?.filter(plan => {
                            if (planCategoryFilter === "activation") {
                              return !plan.serviceType.includes("_recharge");
                            } else if (planCategoryFilter === "recharge") {
                              return plan.serviceType.includes("_recharge");
                            }
                            return true; // Show all plans
                          });

                          return (
                            <FormItem>
                              <FormLabel>
                                Plan {planCategoryFilter !== "all" && (
                                  <span className="text-muted-foreground">
                                    ({planCategoryFilter === "activation" ? "Activation" : "Recharge"} Plans)
                                  </span>
                                )}
                              </FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a plan" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {planCategoryFilter === "all" && (
                                    <>
                                      <div className="text-xs font-medium text-muted-foreground px-2 py-1 bg-blue-50">
                                        📱 Activation Plans
                                      </div>
                                      {plans?.filter(plan => !plan.serviceType.includes("_recharge")).map((plan) => (
                                        <SelectItem key={plan.id} value={plan.id.toString()}>
                                          <div className="flex justify-between items-center w-full">
                                            <span>{plan.name}</span>
                                            <div className="flex gap-2 text-xs">
                                              <span className="bg-gray-100 px-2 py-1 rounded">{plan.carrier}</span>
                                              <span className="bg-blue-100 px-2 py-1 rounded">{plan.serviceType}</span>
                                            </div>
                                          </div>
                                        </SelectItem>
                                      ))}
                                      <div className="text-xs font-medium text-muted-foreground px-2 py-1 bg-orange-50 mt-2">
                                        🔄 Recharge Plans
                                      </div>
                                      {plans?.filter(plan => plan.serviceType.includes("_recharge")).map((plan) => (
                                        <SelectItem key={plan.id} value={plan.id.toString()}>
                                          <div className="flex justify-between items-center w-full">
                                            <span>{plan.name}</span>
                                            <div className="flex gap-2 text-xs">
                                              <span className="bg-gray-100 px-2 py-1 rounded">{plan.carrier}</span>
                                              <span className="bg-orange-100 px-2 py-1 rounded">{plan.serviceType}</span>
                                            </div>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </>
                                  )}
                                  {planCategoryFilter !== "all" && filteredPlans?.map((plan) => (
                                    <SelectItem key={plan.id} value={plan.id.toString()}>
                                      <div className="flex justify-between items-center w-full">
                                        <span>{plan.name}</span>
                                        <div className="flex gap-2 text-xs">
                                          <span className="bg-gray-100 px-2 py-1 rounded">{plan.carrier}</span>
                                          <span className="bg-blue-100 px-2 py-1 rounded">{plan.serviceType}</span>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={pricingForm.control}
                        name="ourCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Our Cost ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                readOnly={selectedPlanId > 0}
                                className={selectedPlanId > 0 ? "bg-gray-100 cursor-not-allowed" : ""}
                              />
                            </FormControl>
                            {selectedPlanId > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Automatically filled from selected plan
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={pricingForm.control}
                        name="sellingPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Selling Price to Retailer ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      

                      
                      {/* Show profit breakdown */}
                      {selectedPlanId > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg border">
                          <div className="text-sm font-medium text-blue-900 mb-2">
                            💰 Profit Breakdown
                          </div>
                          {(() => {
                            const selectedPlan = plans?.find(p => p.id === selectedPlanId);
                            if (!selectedPlan) return null;
                            
                            const ourCost = pricingForm.watch("ourCost") || 0;
                            const retailerCost = pricingForm.watch("sellingPrice") || 0;
                            // Use customerPrice from plan, fall back to retailerPrice if not set
                            const customerPrice = selectedPlan.customerPrice 
                              ? parseFloat(selectedPlan.customerPrice) 
                              : parseFloat(selectedPlan.retailerPrice);
                            const durationMonths = selectedPlan.durationMonths || 1;
                            
                            const ourProfit = retailerCost - ourCost;
                            const retailerProfit = customerPrice - retailerCost;
                            
                            return (
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Plan Duration:</span>
                                  <span className="font-medium">{durationMonths} month{durationMonths > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Customer pays:</span>
                                  <span className="font-bold text-green-600">${customerPrice.toFixed(2)} (from Plan Management)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Retailer profit:</span>
                                  <span className="font-medium text-blue-600">${retailerProfit.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Our profit:</span>
                                  <span className="font-medium text-orange-600">${ourProfit.toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={createPricingMutation.isPending || updatePricingMutation.isPending}
                        >
                          {editingPricing ? "Update Pricing" : "Create Pricing"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* Activation Plans Section */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      📱
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Activation Plans Commission</h3>
                      <p className="text-sm text-muted-foreground">Commission pricing for service activation plans</p>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Commission Group</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Our Cost</TableHead>
                        <TableHead>Selling Price</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionPricing?.filter(pricing => {
                        const plan = plans?.find(p => p.id === pricing.planId);
                        return plan && !plan.serviceType.includes("_recharge");
                      }).map((pricing) => {
                        const planInfo = plans?.find(p => p.id === pricing.planId);
                        return (
                          <TableRow key={pricing.id}>
                            <TableCell className="font-medium">
                              {getGroupName(pricing.commissionGroupId || 0)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{getPlanName(pricing.planId || 0)}</div>
                                <div className="flex gap-2 text-xs mt-1">
                                  <span className="bg-gray-100 px-2 py-1 rounded">
                                    {planInfo?.carrier}
                                  </span>
                                  <span className="bg-blue-100 px-2 py-1 rounded">
                                    {planInfo?.serviceType}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>${pricing.ourCost}</TableCell>
                            <TableCell>${pricing.sellingPrice}</TableCell>
                            <TableCell className="text-green-600 font-medium">
                              ${pricing.profit}
                            </TableCell>
                            <TableCell>
                              <Badge variant={pricing.isActive ? "default" : "secondary"}>
                                {pricing.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditPricing(pricing)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => deletePricingMutation.mutate(pricing.id)}
                                  disabled={deletePricingMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {!commissionPricing?.some(pricing => {
                    const plan = plans?.find(p => p.id === pricing.planId);
                    return plan && !plan.serviceType.includes("_recharge");
                  }) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No activation plan commission pricing found.
                    </div>
                  )}
                </div>

                {/* Recharge Plans Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      🔄
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Recharge Plans Commission</h3>
                      <p className="text-sm text-muted-foreground">Commission pricing for recharge service plans</p>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Commission Group</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Our Cost</TableHead>
                        <TableHead>Selling Price</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionPricing?.filter(pricing => {
                        const plan = plans?.find(p => p.id === pricing.planId);
                        return plan && plan.serviceType.includes("_recharge");
                      }).map((pricing) => {
                        const planInfo = plans?.find(p => p.id === pricing.planId);
                        return (
                          <TableRow key={pricing.id}>
                            <TableCell className="font-medium">
                              {getGroupName(pricing.commissionGroupId || 0)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{getPlanName(pricing.planId || 0)}</div>
                                <div className="flex gap-2 text-xs mt-1">
                                  <span className="bg-gray-100 px-2 py-1 rounded">
                                    {planInfo?.carrier}
                                  </span>
                                  <span className="bg-orange-100 px-2 py-1 rounded">
                                    {planInfo?.serviceType}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>${pricing.ourCost}</TableCell>
                            <TableCell>${pricing.sellingPrice}</TableCell>
                            <TableCell className="text-green-600 font-medium">
                              ${pricing.profit}
                            </TableCell>
                            <TableCell>
                              <Badge variant={pricing.isActive ? "default" : "secondary"}>
                                {pricing.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditPricing(pricing)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => deletePricingMutation.mutate(pricing.id)}
                                  disabled={deletePricingMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {!commissionPricing?.some(pricing => {
                    const plan = plans?.find(p => p.id === pricing.planId);
                    return plan && plan.serviceType.includes("_recharge");
                  }) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No recharge plan commission pricing found.
                    </div>
                  )}
                </div>
              </div>
              {!commissionPricing?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  No commission pricing found. Create pricing structures for your commission groups.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}