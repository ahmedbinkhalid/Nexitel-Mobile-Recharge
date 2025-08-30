import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { Smartphone, Users, ArrowRight } from "lucide-react";
import nexitelLogo from "@assets/ChatGPT Image Aug 11, 2025 at 04_17_52 PM_1755567830590.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="container mx-auto">
        <div className="max-w-sm sm:max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4">
              <img 
                src={nexitelLogo} 
                alt="Nexitel Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Welcome to Nexitel
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-medium mt-2">
              Next Generation Network
            </p>
          </div>
          

          
          <div className="space-y-4">
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 sm:py-4 rounded-xl shadow-lg text-base min-h-[44px]">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Login
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </Link>
            

          </div>
        </div>
      </div>
    </div>
  );
}