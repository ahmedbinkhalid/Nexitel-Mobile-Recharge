import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Printer, Phone, Calendar, MapPin, User, CreditCard } from "lucide-react";

interface CustomerReceiptProps {
  activation: {
    id: string;
    customerName: string;
    phoneNumber: string;
    iccid: string;
    planName: string;
    planPrice: string;
    carrier: string;
    activationDate: string;
    retailerName: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  onPrint: () => void;
}

export function CustomerReceipt({ activation, onPrint }: CustomerReceiptProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-md mx-auto">
      <div className="print:shadow-none print:border-none">
        <Card className="bg-white border-2 border-gray-200">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 text-white p-3 rounded-full">
                <Phone className="w-6 h-6" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-gray-800">
              Nexitel Services
            </CardTitle>
            <p className="text-sm text-gray-600">Mobile Activation Receipt</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Receipt Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Receipt #</span>
                <span className="text-sm font-mono text-gray-800">{activation.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Date</span>
                <span className="text-sm text-gray-800">{currentDate}</span>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{activation.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{activation.phoneNumber}</span>
                </div>
                {activation.address && (
                  <div className="flex flex-col">
                    <span className="text-gray-600 mb-1">Address:</span>
                    <div className="text-right">
                      <div className="font-medium">{activation.address}</div>
                      <div className="font-medium">
                        {activation.city}, {activation.state} {activation.zipCode}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Service Details */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Service Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">{activation.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carrier:</span>
                  <Badge variant="secondary" className="text-xs">
                    {activation.carrier.replace('nexitel-', 'Nexitel ').replace('purple', 'Purple').replace('blue', 'Blue')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ICCID:</span>
                  <span className="font-mono text-xs">{activation.iccid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Activation Date:</span>
                  <span className="font-medium">{activation.activationDate}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Billing Summary */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing Summary
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Plan Cost:</span>
                  <span className="font-medium">{activation.planPrice}/month</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Activation Fee:</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total Paid:</span>
                  <span className="text-2xl font-bold text-blue-600">{activation.planPrice}</span>
                </div>
              </div>
            </div>

            {/* Retailer Information */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <p>Activated by: {activation.retailerName}</p>
              <p className="mt-2">Thank you for choosing Nexitel Services!</p>
              <p>Customer Service: 1-800-NEXITEL</p>
            </div>

            {/* Print Button - Only show on screen, not in print */}
            <div className="print:hidden pt-4">
              <Button 
                onClick={onPrint} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Print-specific styles
export const printStyles = `
  @media print {
    @page {
      size: A4;
      margin: 0.5in;
    }
    
    body {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    .print\\:shadow-none {
      box-shadow: none !important;
    }
    
    .print\\:border-none {
      border: none !important;
    }
    
    .print\\:hidden {
      display: none !important;
    }
  }
`;