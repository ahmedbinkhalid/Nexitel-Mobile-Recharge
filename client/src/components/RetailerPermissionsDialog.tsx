import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { RetailerPermission, type User } from "@shared/schema";
import { 
  Shield, 
  Globe, 
  Phone, 
  Wallet, 
  Activity, 
  RefreshCw, 
  ArrowRightLeft, 
  BarChart3, 
  Users,
  Smartphone
} from "lucide-react";

const retailerPermissionSchema = z.object({
  voipServiceAccess: z.boolean().default(false),
  globalRechargeAccess: z.boolean().default(false),
  usaRechargeAccess: z.boolean().default(false),
  walletFundingAccess: z.boolean().default(false),
  maxDailyFunding: z.string().optional(),
  maxMonthlyFunding: z.string().optional(),
  nexitelActivationAccess: z.boolean().default(false),
  simSwapAccess: z.boolean().default(false),
  portInAccess: z.boolean().default(false),
  reportAccess: z.boolean().default(true),
  bulkActivationAccess: z.boolean().default(false),
  notes: z.string().optional(),
  // AT&T permissions
  attActivationAccess: z.boolean().default(false),
  attRechargeAccess: z.boolean().default(false),
  attSimSwapAccess: z.boolean().default(false),
  attDataAddonsAccess: z.boolean().default(false),
  attPortInAccess: z.boolean().default(false),
  attWifiCallingAccess: z.boolean().default(false),
  attBulkActivationAccess: z.boolean().default(false),
  attMaxDailyActivations: z.string().default("50"),
  attMaxDailyRecharges: z.string().default("100"),
});

type RetailerPermissionFormData = z.infer<typeof retailerPermissionSchema>;

interface RetailerPermissionsDialogProps {
  retailer: User | null;
  open: boolean;
  onClose: () => void;
}

const PERMISSION_CATEGORIES = [
  {
    title: "Core Services",
    description: "Primary service access controls",
    permissions: [
      {
        key: "voipServiceAccess" as keyof RetailerPermissionFormData,
        label: "VoIP Service Access",
        description: "Access to VoIP calling activation services",
        icon: Phone,
        color: "text-blue-600"
      },
      {
        key: "globalRechargeAccess" as keyof RetailerPermissionFormData,
        label: "Global Recharge Access",
        description: "International mobile recharge services",
        icon: Globe,
        color: "text-green-600"
      },
      {
        key: "usaRechargeAccess" as keyof RetailerPermissionFormData,
        label: "USA Recharge Access", 
        description: "Domestic US carrier recharge services",
        icon: Smartphone,
        color: "text-red-600"
      },
      {
        key: "walletFundingAccess" as keyof RetailerPermissionFormData,
        label: "Wallet Funding Access",
        description: "Add funds to wallet functionality",
        icon: Wallet,
        color: "text-purple-600"
      }
    ]
  },
  {
    title: "Nexitel Services",
    description: "Nexitel carrier-specific services",
    permissions: [
      {
        key: "nexitelActivationAccess" as keyof RetailerPermissionFormData,
        label: "Nexitel Activation",
        description: "New Nexitel service activations",
        icon: Activity,
        color: "text-orange-600"
      },
      {
        key: "simSwapAccess" as keyof RetailerPermissionFormData,
        label: "SIM Swap Access",
        description: "SIM card replacement services",
        icon: RefreshCw,
        color: "text-cyan-600"
      },
      {
        key: "portInAccess" as keyof RetailerPermissionFormData,
        label: "Port-In Access",
        description: "Number porting services",
        icon: ArrowRightLeft,
        color: "text-indigo-600"
      }
    ]
  },
  {
    title: "AT&T Services",
    description: "AT&T carrier-specific permissions",
    permissions: [
      {
        key: "attActivationAccess" as keyof RetailerPermissionFormData,
        label: "AT&T Activation",
        description: "AT&T new line activations",
        icon: Activity,
        color: "text-blue-700"
      },
      {
        key: "attRechargeAccess" as keyof RetailerPermissionFormData,
        label: "AT&T Recharge",
        description: "AT&T top-up services",
        icon: RefreshCw,
        color: "text-blue-600"
      },
      {
        key: "attSimSwapAccess" as keyof RetailerPermissionFormData,
        label: "AT&T SIM Swap",
        description: "AT&T SIM replacement",
        icon: ArrowRightLeft,
        color: "text-blue-500"
      },
      {
        key: "attDataAddonsAccess" as keyof RetailerPermissionFormData,
        label: "AT&T Data Add-ons",
        description: "AT&T data packages",
        icon: Smartphone,
        color: "text-blue-800"
      },
      {
        key: "attPortInAccess" as keyof RetailerPermissionFormData,
        label: "AT&T Port-In",
        description: "AT&T number porting",
        icon: Phone,
        color: "text-blue-400"
      },
      {
        key: "attWifiCallingAccess" as keyof RetailerPermissionFormData,
        label: "AT&T WiFi Calling",
        description: "AT&T WiFi calling features",
        icon: Globe,
        color: "text-blue-900"
      },
      {
        key: "attBulkActivationAccess" as keyof RetailerPermissionFormData,
        label: "AT&T Bulk Activation",
        description: "AT&T bulk processes",
        icon: Users,
        color: "text-blue-300"
      }
    ]
  },
  {
    title: "Advanced Features",
    description: "Additional tools and reporting",
    permissions: [
      {
        key: "reportAccess" as keyof RetailerPermissionFormData,
        label: "Report Access",
        description: "View reports and analytics",
        icon: BarChart3,
        color: "text-emerald-600"
      },
      {
        key: "bulkActivationAccess" as keyof RetailerPermissionFormData,
        label: "Bulk Activation",
        description: "Bulk activation capabilities",
        icon: Users,
        color: "text-pink-600"
      }
    ]
  }
];

export function RetailerPermissionsDialog({ retailer, open, onClose }: RetailerPermissionsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RetailerPermissionFormData>({
    resolver: zodResolver(retailerPermissionSchema),
    defaultValues: {
      voipServiceAccess: false,
      globalRechargeAccess: false,
      usaRechargeAccess: false,
      walletFundingAccess: false,
      maxDailyFunding: "",
      maxMonthlyFunding: "",
      nexitelActivationAccess: false,
      simSwapAccess: false,
      portInAccess: false,
      reportAccess: true,
      bulkActivationAccess: false,
      notes: "",
      // AT&T defaults
      attActivationAccess: false,
      attRechargeAccess: false,
      attSimSwapAccess: false,
      attDataAddonsAccess: false,
      attPortInAccess: false,
      attWifiCallingAccess: false,
      attBulkActivationAccess: false,
      attMaxDailyActivations: "50",
      attMaxDailyRecharges: "100",
    },
  });

  // Fetch existing permissions
  const { data: permissions, isLoading } = useQuery<RetailerPermission>({
    queryKey: [`/api/retailer-permissions/${retailer?.id}`],
    enabled: !!retailer?.id && open,
  });

  // Fetch AT&T permissions separately
  const [attPermissions, setAttPermissions] = useState<any>(null);

  useEffect(() => {
    if (retailer && open) {
      // Fetch AT&T permissions
      fetch(`/api/att/permissions/${retailer.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => setAttPermissions(data))
        .catch(() => setAttPermissions(null));
    }
  }, [retailer, open]);

  // Update form when permissions data is loaded
  useEffect(() => {
    if (permissions || attPermissions) {
      form.reset({
        voipServiceAccess: permissions?.voipServiceAccess || false,
        globalRechargeAccess: permissions?.globalRechargeAccess || false,
        usaRechargeAccess: permissions?.usaRechargeAccess || false,
        walletFundingAccess: permissions?.walletFundingAccess || false,
        maxDailyFunding: permissions?.maxDailyFunding?.toString() || "",
        maxMonthlyFunding: permissions?.maxMonthlyFunding?.toString() || "",
        nexitelActivationAccess: permissions?.nexitelActivationAccess || false,
        simSwapAccess: permissions?.simSwapAccess || false,
        portInAccess: permissions?.portInAccess || false,
        reportAccess: permissions?.reportAccess !== false, // Default true
        bulkActivationAccess: permissions?.bulkActivationAccess || false,
        notes: permissions?.notes || "",
        // AT&T permissions
        attActivationAccess: attPermissions?.canActivate || false,
        attRechargeAccess: attPermissions?.canRecharge || false,
        attSimSwapAccess: attPermissions?.canSimSwap || false,
        attDataAddonsAccess: attPermissions?.canSellDataAddons || false,
        attPortInAccess: attPermissions?.canPortIn || false,
        attWifiCallingAccess: attPermissions?.canEnableWifiCalling || false,
        attBulkActivationAccess: attPermissions?.canBulkActivate || false,
        attMaxDailyActivations: attPermissions?.maxDailyActivations?.toString() || "50",
        attMaxDailyRecharges: attPermissions?.maxDailyRecharges?.toString() || "100",
      });
    }
  }, [permissions, attPermissions, form]);

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async (data: RetailerPermissionFormData) => {
      // Save regular permissions
      const regularPermissions = {
        voipServiceAccess: data.voipServiceAccess,
        globalRechargeAccess: data.globalRechargeAccess,
        usaRechargeAccess: data.usaRechargeAccess,
        walletFundingAccess: data.walletFundingAccess,
        maxDailyFunding: data.maxDailyFunding,
        maxMonthlyFunding: data.maxMonthlyFunding,
        nexitelActivationAccess: data.nexitelActivationAccess,
        simSwapAccess: data.simSwapAccess,
        portInAccess: data.portInAccess,
        reportAccess: data.reportAccess,
        bulkActivationAccess: data.bulkActivationAccess,
        notes: data.notes,
      };

      // Save AT&T permissions
      const attPermissionsData = {
        userId: retailer?.id,
        canActivate: data.attActivationAccess,
        canRecharge: data.attRechargeAccess,
        canSimSwap: data.attSimSwapAccess,
        canSellDataAddons: data.attDataAddonsAccess,
        canPortIn: data.attPortInAccess,
        canEnableWifiCalling: data.attWifiCallingAccess,
        canBulkActivate: data.attBulkActivationAccess,
        maxDailyActivations: parseInt(data.attMaxDailyActivations) || 50,
        maxDailyRecharges: parseInt(data.attMaxDailyRecharges) || 100,
      };

      // Save both in parallel
      const [regularResult, attResult] = await Promise.all([
        apiRequest(`/api/retailer-permissions/${retailer?.id}`, { 
          method: "PATCH", 
          body: regularPermissions 
        }),
        fetch(`/api/att/permissions/${retailer?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attPermissionsData),
        }).then(res => res.json())
      ]);

      return { regularResult, attResult };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/retailer-permissions/${retailer?.id}`] });
      toast({
        title: "Success",
        description: "Retailer permissions updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update permissions",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: RetailerPermissionFormData) => {
    setIsSubmitting(true);
    try {
      await updatePermissionsMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const walletFundingEnabled = form.watch("walletFundingAccess");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Permissions Management - {retailer?.username}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">Loading permissions...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Permission Categories */}
              {PERMISSION_CATEGORIES.map((category) => (
                <Card key={category.title}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.permissions.map((permission) => {
                        const Icon = permission.icon;
                        return (
                          <FormField
                            key={permission.key}
                            control={form.control}
                            name={permission.key}
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Icon className={`w-5 h-5 ${permission.color}`} />
                                  <div>
                                    <FormLabel className="text-sm font-medium">
                                      {permission.label}
                                    </FormLabel>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {permission.description}
                                    </p>
                                  </div>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value as boolean}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Wallet Funding Limits */}
              {walletFundingEnabled && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-purple-600" />
                      Wallet Funding Limits
                    </CardTitle>
                    <CardDescription>Set daily and monthly funding limits for this retailer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AT&T Daily Limits */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">AT&T Daily Limits</CardTitle>
                  <CardDescription>Set daily transaction limits for AT&T services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="attMaxDailyActivations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Daily Activations</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="1000"
                              placeholder="50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="attMaxDailyRecharges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Daily Recharges</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="1000"
                              placeholder="100"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Admin Notes */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Admin Notes</CardTitle>
                  <CardDescription>Optional notes about these permission settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any notes about the permission settings..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Permissions"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}