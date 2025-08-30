import { ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { Sidebar } from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className={`${isMobile ? 'flex flex-col' : 'flex'} h-screen bg-gray-50`}>
      <Sidebar />
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'pt-20' : ''}`}>
        {children}
      </div>
    </div>
  );
}
