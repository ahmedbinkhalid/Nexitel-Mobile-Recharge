import { useLocation } from "wouter";
import { useEffect } from "react";

export default function CommissionManagement() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect to the new commission group management
    navigate("/admin/commission-group-management");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Commission Groups...</p>
      </div>
    </div>
  );
}