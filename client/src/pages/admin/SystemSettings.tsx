import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Settings,
  Database,
  Shield,
  Bell,
  Globe,
  CreditCard,
  Mail,
  Phone,
  Server,
  Users,
  AlertTriangle,
  CheckCircle,
  Save
} from "lucide-react";

interface SystemConfig {
  id: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maxTransactionAmount: number;
  minTransactionAmount: number;
  systemCurrency: string;
  defaultCommissionRate: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  backupEnabled: boolean;
  lastBackup: string;
}

export default function SystemSettings() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Mock system configuration data (in real app, this would come from API)
  const mockConfig: SystemConfig = {
    id: "1",
    companyName: "Mobile Recharge POS",
    companyEmail: "admin@mobilerecharge.com",
    companyPhone: "+1-800-555-0123",
    supportEmail: "support@mobilerecharge.com",
    maintenanceMode: false,
    allowRegistration: false,
    emailNotifications: true,
    smsNotifications: true,
    maxTransactionAmount: 1000,
    minTransactionAmount: 5,
    systemCurrency: "USD",
    defaultCommissionRate: 5.0,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    backupEnabled: true,
    lastBackup: "2025-01-13T02:00:00Z"
  };

  const [config, setConfig] = useState<SystemConfig>(mockConfig);

  const updateConfigMutation = useMutation({
    mutationFn: async (updatedConfig: Partial<SystemConfig>) => {
      // In real app, this would be: return await apiRequest('/api/admin/system-config', { method: 'PATCH', body: updatedConfig });
      return new Promise(resolve => setTimeout(() => resolve(updatedConfig), 1000));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "System settings updated successfully",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update system settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateConfigMutation.mutate(config);
  };

  const handleInputChange = (field: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button 
              onClick={handleSave} 
              disabled={updateConfigMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {updateConfigMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          )}
          <Button 
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Settings"}
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">System Status</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Maintenance Mode</span>
              <Badge variant={config.maintenanceMode ? "destructive" : "secondary"}>
                {config.maintenanceMode ? (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Backup</span>
              <span className="text-xs text-muted-foreground">
                {new Date(config.lastBackup).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={config.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyEmail">Company Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={config.companyEmail}
                onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Company Phone</Label>
              <Input
                id="companyPhone"
                value={config.companyPhone}
                onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={config.supportEmail}
                onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={config.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={config.maxLoginAttempts}
                onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
                disabled={!isEditing}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowRegistration">Allow User Registration</Label>
              <Switch
                id="allowRegistration"
                checked={config.allowRegistration}
                onCheckedChange={(checked) => handleInputChange('allowRegistration', checked)}
                disabled={!isEditing}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <Switch
                id="maintenanceMode"
                checked={config.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Transaction Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transaction Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minTransactionAmount">Minimum Transaction Amount</Label>
              <Input
                id="minTransactionAmount"
                type="number"
                value={config.minTransactionAmount}
                onChange={(e) => handleInputChange('minTransactionAmount', parseFloat(e.target.value))}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTransactionAmount">Maximum Transaction Amount</Label>
              <Input
                id="maxTransactionAmount"
                type="number"
                value={config.maxTransactionAmount}
                onChange={(e) => handleInputChange('maxTransactionAmount', parseFloat(e.target.value))}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemCurrency">System Currency</Label>
              <Input
                id="systemCurrency"
                value={config.systemCurrency}
                onChange={(e) => handleInputChange('systemCurrency', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultCommissionRate">Default Commission Rate</Label>
              <Input
                id="defaultCommissionRate"
                type="number"
                step="0.1"
                value={config.defaultCommissionRate}
                onChange={(e) => handleInputChange('defaultCommissionRate', parseFloat(e.target.value))}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Send transaction confirmations via email
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={config.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                disabled={!isEditing}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Send transaction alerts via SMS
                </p>
              </div>
              <Switch
                id="smsNotifications"
                checked={config.smsNotifications}
                onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup & Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Backups</Label>
                <p className="text-xs text-muted-foreground">
                  Daily system backups
                </p>
              </div>
              <Switch
                checked={config.backupEnabled}
                onCheckedChange={(checked) => handleInputChange('backupEnabled', checked)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Backup</Label>
              <p className="text-sm">
                {new Date(config.lastBackup).toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Manual Backup</Label>
              <Button variant="outline" size="sm" disabled={!isEditing}>
                Create Backup Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}