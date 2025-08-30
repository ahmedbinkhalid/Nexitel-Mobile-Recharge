import { User } from "@shared/schema";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const getStoredAuth = (): AuthState => {
  try {
    const stored = localStorage.getItem("pos_auth");
    if (!stored) return { user: null, isAuthenticated: false };
    
    const parsed = JSON.parse(stored);
    return {
      user: parsed.user,
      isAuthenticated: !!parsed.user,
    };
  } catch {
    return { user: null, isAuthenticated: false };
  }
};

export const setStoredAuth = (user: User | null): void => {
  if (user) {
    localStorage.setItem("pos_auth", JSON.stringify({ user }));
  } else {
    localStorage.removeItem("pos_auth");
  }
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem("pos_auth");
};

export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === "admin") return true;
  
  // Role-specific permissions
  const rolePermissions: Record<string, string[]> = {
    employee: ["view_financial_reports", "manage_transactions"],
    retailer: ["create_transactions", "view_own_transactions"],
    customer: ["create_transactions", "view_own_transactions", "manage_saved_numbers"],
  };
  
  return rolePermissions[user.role]?.includes(permission) || false;
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case "admin": return "role-admin";
    case "employee": return "role-employee";
    case "retailer": return "role-retailer";
    case "customer": return "role-customer";
    default: return "bg-gray-500";
  }
};

export const getRoleBorderColor = (role: string): string => {
  switch (role) {
    case "admin": return "border-role-admin";
    case "employee": return "border-role-employee";
    case "retailer": return "border-role-retailer";
    case "customer": return "border-role-customer";
    default: return "border-gray-500";
  }
};
