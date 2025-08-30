import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

interface UseEmployeeVerificationProps {
  operationType: string;
  operationDetails?: string;
}

export function useEmployeeVerification({ operationType, operationDetails }: UseEmployeeVerificationProps) {
  const { user } = useAuth();
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [verifiedEmployeeId, setVerifiedEmployeeId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireEmployeeVerification = (action: () => void) => {
    // If user is not an employee, execute action immediately
    if (!user || user.role !== "employee") {
      action();
      return;
    }

    // If user is main admin (username 'admin') or admin-level employee, give full access
    if (user.username === "admin" || user.employeeRole === "admin") {
      action();
      return;
    }

    // If already verified for this session, execute action
    if (verifiedEmployeeId) {
      action();
      return;
    }

    // Store the action to execute after verification
    setPendingAction(() => action);
    setIsVerificationOpen(true);
  };

  const handleVerificationSuccess = (employeeId: string) => {
    setVerifiedEmployeeId(employeeId);
    setIsVerificationOpen(false);
    
    // Execute the pending action
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleVerificationCancel = () => {
    setIsVerificationOpen(false);
    setPendingAction(null);
  };

  const resetVerification = () => {
    setVerifiedEmployeeId(null);
  };

  return {
    isVerificationOpen,
    verifiedEmployeeId,
    requireEmployeeVerification,
    handleVerificationSuccess,
    handleVerificationCancel,
    resetVerification,
    operationType,
    operationDetails,
    isEmployeeRole: user?.role === "employee",
  };
}