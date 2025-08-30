import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge, ShieldCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const employeeVerificationSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
});

type EmployeeVerificationForm = z.infer<typeof employeeVerificationSchema>;

interface EmployeeVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (employeeId: string) => void;
  operationType: string; // "activation", "recharge", "fund_transfer", etc.
  operationDetails?: string;
}

export function EmployeeVerificationDialog({
  isOpen,
  onClose,
  onVerified,
  operationType,
  operationDetails,
}: EmployeeVerificationDialogProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const form = useForm<EmployeeVerificationForm>({
    resolver: zodResolver(employeeVerificationSchema),
    defaultValues: {
      employeeId: "",
    },
  });

  const onSubmit = async (data: EmployeeVerificationForm) => {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      // Verify employee ID with current session
      const response = await fetch("/api/auth/verify-employee-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId: data.employeeId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Employee ID verification failed");
      }

      // Verification successful
      onVerified(data.employeeId);
      form.reset();
      onClose();
    } catch (error: any) {
      setVerificationError(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setVerificationError(null);
    onClose();
  };

  const getOperationTypeLabel = () => {
    switch (operationType) {
      case "nexitel_activation":
        return "Nexitel Activation";
      case "wifi_calling_enable":
        return "WiFi Calling Enable";
      case "fund_transfer":
        return "Fund Transfer";
      case "global_recharge":
        return "Global Recharge";
      case "usa_recharge":
        return "USA Carrier Recharge";
      case "voip_activation":
        return "VoIP Activation";
      case "bulk_activation":
        return "Bulk Activation";
      default:
        return "Operation";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Employee Verification Required</span>
          </DialogTitle>
          <DialogDescription>
            Please verify your Employee ID to proceed with this operation.
            <br />
            <span className="text-xs text-gray-500 mt-1">
              Note: Admin-level employees have full access to all operations.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Operation Details</span>
            </div>
            <p className="text-sm text-blue-800">
              <strong>Type:</strong> {getOperationTypeLabel()}
            </p>
            {operationDetails && (
              <p className="text-xs text-blue-700 mt-1">{operationDetails}</p>
            )}
          </div>

          {verificationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{verificationError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your Employee ID"
                        autoComplete="off"
                        disabled={isVerifying}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isVerifying}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isVerifying}>
                  {isVerifying ? "Verifying..." : "Verify & Continue"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}