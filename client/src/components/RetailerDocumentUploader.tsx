import { useState } from "react";
import { ObjectUploader } from "./ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentType {
  key: string;
  label: string;
  description: string;
  required: boolean;
  allowedTypes?: string[];
}

interface RetailerDocument {
  id: number;
  documentType: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
}

interface RetailerDocumentUploaderProps {
  retailerId: number;
  documents: RetailerDocument[];
  onDocumentUploaded: () => void;
  showDownloadButtons?: boolean;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    key: 'reseller_agreement',
    label: 'Reseller Agreement',
    description: 'Signed reseller agreement document',
    required: true,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  {
    key: 'reseller_certificate',
    label: 'Reseller Certificate',
    description: 'State-issued reseller certificate',
    required: true,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  {
    key: 'copy_of_ein',
    label: 'Copy of EIN',
    description: 'IRS Employer Identification Number document',
    required: true,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  {
    key: 'state_business_certificate',
    label: 'State Business Certificate',
    description: 'Official state business registration certificate',
    required: true,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  {
    key: 'retailer_photo_id',
    label: 'Retailer Photo ID',
    description: 'Government-issued photo identification',
    required: true,
    allowedTypes: ['image/jpeg', 'image/png']
  },
  {
    key: 'void_check',
    label: 'Void Check',
    description: 'Voided check for payment verification',
    required: true,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
];

export function RetailerDocumentUploader({ 
  retailerId, 
  documents, 
  onDocumentUploaded,
  showDownloadButtons = false 
}: RetailerDocumentUploaderProps) {
  const { toast } = useToast();
  const [uploadingDocuments, setUploadingDocuments] = useState<Set<string>>(new Set());

  const getDocumentStatus = (documentType: string) => {
    return documents.find(doc => doc.documentType === documentType);
  };

  const handleGetUploadParameters = async (documentType: string) => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL } = await response.json();
      return {
        method: 'PUT' as const,
        url: uploadURL,
      };
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to initialize upload. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = async (
    documentType: string, 
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => {
    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];
      
      try {
        // Save document information to database
        const response = await fetch('/api/retailer-documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            retailerId,
            documentType,
            fileName: file.name,
            originalFileName: file.name,
            filePath: file.uploadURL,
            fileSize: file.size,
            mimeType: file.type,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save document information');
        }

        toast({
          title: "Upload Successful",
          description: `${DOCUMENT_TYPES.find(dt => dt.key === documentType)?.label} has been uploaded successfully.`,
        });

        onDocumentUploaded();
      } catch (error) {
        toast({
          title: "Save Error", 
          description: "File uploaded but failed to save information. Please contact admin.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Upload Failed",
        description: "Document upload was not successful. Please try again.",
        variant: "destructive",
      });
    }

    setUploadingDocuments(prev => {
      const newSet = new Set(prev);
      newSet.delete(documentType);
      return newSet;
    });
  };

  const handleStartUpload = (documentType: string) => {
    setUploadingDocuments(prev => new Set(prev).add(documentType));
  };

  const handleDownloadDocument = async (document: RetailerDocument) => {
    try {
      const response = await fetch(document.filePath);
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.originalFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: `Downloading ${document.originalFileName}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      approved: "default",
      rejected: "destructive", 
      pending: "secondary"
    };
    
    return (
      <Badge variant={variants[status] || "secondary"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Required Documents</h3>
        <p className="text-sm text-gray-600">
          Please upload all required documents. Supported formats: PDF, JPEG, PNG (max 10MB each)
        </p>
      </div>

      <div className="grid gap-4">
        {DOCUMENT_TYPES.map((docType) => {
          const existingDoc = getDocumentStatus(docType.key);
          const isUploading = uploadingDocuments.has(docType.key);
          
          return (
            <Card key={docType.key} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <CardTitle className="text-base font-medium">
                        {docType.label}
                        {docType.required && <span className="text-red-500 ml-1">*</span>}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{docType.description}</p>
                    </div>
                  </div>
                  {existingDoc && (
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(existingDoc.status)}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    {existingDoc ? (
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{existingDoc.originalFileName}</p>
                        <p className="text-gray-500">
                          Uploaded on {new Date(existingDoc.createdAt).toLocaleDateString()}
                        </p>
                        {existingDoc.notes && (
                          <p className="text-red-600 text-xs mt-1">{existingDoc.notes}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No document uploaded</p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {existingDoc && showDownloadButtons && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(existingDoc)}
                        className="flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </Button>
                    )}
                    
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760} // 10MB
                      allowedFileTypes={docType.allowedTypes}
                      onGetUploadParameters={() => handleGetUploadParameters(docType.key)}
                      onComplete={(result) => handleUploadComplete(docType.key, result)}
                      buttonClassName={`${
                        existingDoc?.status === 'approved' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading ? 'Uploading...' : existingDoc ? 'Replace' : 'Upload'}
                    </ObjectUploader>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Document Review Process</h4>
            <p className="text-sm text-yellow-700 mt-1">
              All uploaded documents will be reviewed by our admin team. You will receive 
              notifications once documents are approved or if additional information is needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}