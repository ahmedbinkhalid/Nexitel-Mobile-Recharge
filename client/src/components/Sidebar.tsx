import { Link, useLocation } from "wouter";
import { useAuth } from "./AuthProvider";
import { getRoleColor, getRoleBorderColor } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import {
  BarChart3,
  Users,
  Store,
  TrendingUp,
  Settings,
  Calculator,
  Receipt,
  Scale,
  Smartphone,
  History,
  PieChart,
  Wallet,
  BookOpen,
  UserCog,
  Shield,
  UserCheck,
  LogOut,
  Crown,
  Menu,
  X,
  MessageCircle,
  Send,
  Percent,
  Plus,
  Globe,
  Phone,
  Search,
  FileText
} from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { type: "agent", message: "Hello! I'm Sarah from customer support. How can I help you today?", time: "Now" }
  ]);

  if (!user) return null;

  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case "admin":
        return [
          { href: "/admin", icon: BarChart3, label: "Dashboard" },
          { href: "/admin/recharge", icon: Crown, label: "Admin Recharge" },
          { href: "/admin/global-recharge", icon: Globe, label: "Global Recharge" },
          { href: "/admin/employees", icon: Users, label: "Employee Management" },
          { href: "/admin/retailers", icon: Store, label: "Retailer Management" },
          { href: "/admin/retailer-permissions", icon: Shield, label: "Retailer Permissions" },
          { href: "/admin/analytics", icon: TrendingUp, label: "Analytics" },
          { href: "/admin/reports", icon: FileText, label: "Download Reports" },
          { href: "/admin/plan-management", icon: Settings, label: "Plan Management" },
          { href: "/admin/commission-management", icon: Percent, label: "Commission Management" },
          { href: "/admin/fund-management", icon: Wallet, label: "Fund Management" },
          { href: "/admin/profit-payouts", icon: TrendingUp, label: "Profit Payouts" },
          { href: "/activity-management", icon: Search, label: "Activity Management" },
          { href: "/admin/settings", icon: Settings, label: "System Settings" },
        ];
      case "employee":
        return [
          { href: "/employee", icon: BarChart3, label: "Dashboard" },
          { href: "/employee/reports", icon: Calculator, label: "Financial Reports" },
          { href: "/employee/transactions", icon: Receipt, label: "Transaction Oversight" },
          { href: "/employee/balance", icon: Scale, label: "Balance Management" },
          { href: "/activity-management", icon: Search, label: "Activity Management" },
        ];
      case "retailer":
        return [
          { href: "/retailer/dashboard", icon: Smartphone, label: "Dashboard" },
          { href: "/retailer/wallet", icon: Wallet, label: "Wallet Funding" },
          { href: "/retailer/transactions", icon: History, label: "Transaction History" },
          { href: "/retailer/reports", icon: PieChart, label: "Daily Reports" },
          { href: "/activity-management", icon: Search, label: "Activity Management" },
        ];
      default:
        return [];
    }
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case "admin": return Shield;
      case "employee": return UserCheck;
      case "retailer": return Store;
      default: return UserCog;
    }
  };

  const RoleIcon = getRoleIcon();
  const navItems = getNavItems();
  const roleColor = getRoleColor(user.role);
  const roleBorderColor = getRoleBorderColor(user.role);

  const getRoleDisplayName = () => {
    if (user.role === "employee" && user.employeeRole) {
      return user.employeeRole.charAt(0).toUpperCase() + user.employeeRole.slice(1);
    }
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      type: "user",
      message: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage("");
    
    // Simulate agent response
    setTimeout(() => {
      const responses = [
        "Thanks for reaching out! I'm looking into that for you.",
        "I understand your concern. Let me check our system.",
        "That's a great question! I'll get you the information you need.",
        "I'm here to help! Can you provide a bit more detail about the issue?",
        "Let me connect you with our technical team for this specific matter."
      ];
      
      const agentResponse = {
        type: "agent",
        message: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, agentResponse]);
    }, 1000 + Math.random() * 2000);
  };

  // Chat Widget
  const ChatWidget = () => {
    if (!chatOpen) return null;

    return (
      <div className="fixed bottom-4 right-4 chat-widget bg-white border border-gray-300 rounded-lg shadow-xl z-50 flex flex-col">
        {/* Chat Header */}
        <div className="bg-green-600 text-white p-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <span className="font-medium">Live Agent - Sarah</span>
          </div>
          <Button
            onClick={() => setChatOpen(false)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-green-700 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs p-2 rounded-lg ${
                msg.type === "user" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 text-gray-900"
              }`}>
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${
                  msg.type === "user" ? "text-blue-100" : "text-gray-500"
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Mobile hamburger menu
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <RoleIcon className="w-6 h-6 text-gray-700" />
              <div>
                <h2 className="font-semibold text-gray-900">{getRoleDisplayName()}</h2>
                <p className="text-sm text-gray-600">{user.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50" 
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className={`p-6 ${roleColor} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RoleIcon className="w-6 h-6" />
                <div>
                  <h2 className="font-semibold">{getRoleDisplayName()} Portal</h2>
                  <p className="text-sm opacity-90">{user.username}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Mobile Customer Support Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Customer Support</h3>
              <div className="space-y-1 text-xs text-blue-800">
                <div className="flex items-center">
                  <UserCog className="w-3 h-3 mr-2" />
                  <span>Contact: Sarah Johnson</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 mr-2 text-center">📞</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 mr-2 text-center">✉️</span>
                  <span>support@posrecharge.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <nav className="mt-4 pb-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || location.startsWith(item.href + "/");
              
              return (
                <a
                  key={item.href}
                  className={`flex items-center px-6 py-4 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer ${
                    isActive ? `text-gray-700 bg-gray-100 border-r-2 ${roleBorderColor}` : ""
                  }`}
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = item.href;
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="ml-3 text-base">{item.label}</span>
                </a>
              );
            })}
          </nav>
          
          {/* Live Chat Button */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={() => setChatOpen(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Live Agent Chat
            </Button>
          </div>

        </div>
        
        {/* Chat Widget */}
        <ChatWidget />
      </>
    );
  }

  // Desktop sidebar
  return (
    <>
      <div className="w-64 bg-white shadow-lg flex flex-col h-screen">
        <div className={`p-6 ${roleColor} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RoleIcon className="w-6 h-6" />
              <div>
                <h2 className="font-semibold">{getRoleDisplayName()} Portal</h2>
                <p className="text-sm opacity-90">{user.username}</p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          {user.role === "retailer" && user.balance && (
            <div className="mt-4 p-3 bg-white/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/80">Account Balance</span>
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div className="text-lg font-bold text-white">${user.balance}</div>
            </div>
          )}
        </div>
        
        {/* Customer Support Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Customer Support</h3>
            <div className="space-y-1 text-xs text-blue-800">
              <div className="flex items-center">
                <UserCog className="w-3 h-3 mr-2" />
                <span>Contact: Sarah Johnson</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 mr-2 text-center">📞</span>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 mr-2 text-center">✉️</span>
                <span>support@posrecharge.com</span>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto mt-4 pb-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href + "/");
            
            return (
              <a
                key={item.href}
                className={`flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer ${
                  isActive ? `text-gray-700 bg-gray-100 border-r-2 ${roleBorderColor}` : ""
                }`}
                onClick={() => window.location.href = item.href}
              >
                <Icon className="w-5 h-5" />
                <span className="ml-3">{item.label}</span>
              </a>
            );
          })}
        </nav>
        
        {/* Live Chat Button */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <Button
            onClick={() => setChatOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Live Agent Chat
          </Button>
        </div>

      </div>
      
      {/* Chat Widget */}
      <ChatWidget />
    </>
  );
}