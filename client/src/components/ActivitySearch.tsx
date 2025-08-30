import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Calendar, Filter } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ActivitySearchProps {
  userRole: 'admin' | 'employee' | 'retailer';
}

interface SearchFilters {
  searchType: 'iccid' | 'mobile_number' | 'email' | 'customer_name';
  searchTerm: string;
  serviceType: 'all' | 'nexitel_activation' | 'nexitel_recharge' | 'global_recharge';
  status: 'all' | 'pending' | 'completed' | 'failed';
  dateFrom: string;
  dateTo: string;
}

interface ActivityRecord {
  id: number;
  iccid?: string;
  mobileNumber?: string;
  customerName?: string;
  email?: string;
  serviceType: string;
  status: string;
  createdAt: string;
  amount?: string;
  commission?: string;
}

export function ActivitySearch({ userRole }: ActivitySearchProps) {
  const { toast } = useToast();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchType: 'iccid',
    searchTerm: '',
    serviceType: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    activations: ActivityRecord[];
    recharges: ActivityRecord[];
    total: number;
  } | null>(null);

  const searchMutation = useMutation({
    mutationFn: async (filters: SearchFilters) => {
      let cleanedFilters = { ...filters };
      
      // Clean phone numbers (remove formatting)
      if (filters.searchType === 'mobile_number' && filters.searchTerm) {
        cleanedFilters.searchTerm = filters.searchTerm.replace(/[\s\-\(\)]/g, '');
      }
      
      if (cleanedFilters.searchTerm.length < 3) {
        throw new Error('Search term must be at least 3 characters');
      }

      return await apiRequest("/api/activities/search", {
        method: "POST",
        body: cleanedFilters
      });
    },
    onSuccess: (data) => {
      setSearchResults(data);
      toast({
        title: "Search Complete",
        description: `Found ${data.total} results`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const quickSearchMutation = useMutation({
    mutationFn: async ({ type, value }: { type: 'iccid' | 'mobile', value: string }) => {
      const endpoint = type === 'iccid' 
        ? `/api/activities/search/iccid/${encodeURIComponent(value)}`
        : `/api/activities/search/mobile/${encodeURIComponent(value)}`;
      
      return await apiRequest(endpoint);
    },
    onSuccess: (data) => {
      setSearchResults({
        activations: data.activations || [],
        recharges: data.recharges || [],
        total: (data.activations?.length || 0) + (data.recharges?.length || 0)
      });
      toast({
        title: "Quick Search Complete",
        description: `Found ${(data.activations?.length || 0) + (data.recharges?.length || 0)} results`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleQuickSearch = () => {
    if (!searchFilters.searchTerm.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    let searchValue = searchFilters.searchTerm.trim();
    
    // For phone numbers, clean up formatting (remove spaces, dashes, parentheses)
    if (searchFilters.searchType === 'mobile_number') {
      searchValue = searchValue.replace(/[\s\-\(\)]/g, '');
    }

    if (searchFilters.searchType === 'iccid') {
      quickSearchMutation.mutate({ type: 'iccid', value: searchValue });
    } else if (searchFilters.searchType === 'mobile_number') {
      quickSearchMutation.mutate({ type: 'mobile', value: searchValue });
    } else {
      searchMutation.mutate(searchFilters);
    }
  };

  const handleAdvancedSearch = () => {
    searchMutation.mutate(searchFilters);
  };

  const exportResults = () => {
    if (!searchResults) return;

    const allRecords = [
      ...searchResults.activations.map(a => ({ ...a, type: 'activation' })),
      ...searchResults.recharges.map(r => ({ ...r, type: 'recharge' }))
    ];

    const csv = [
      'Type,ID,ICCID,Mobile Number,Customer Name,Email,Service Type,Status,Amount,Commission,Created At',
      ...allRecords.map(r => 
        `"${r.type}","${r.id}","${r.iccid || ''}","${r.mobileNumber || ''}","${r.customerName || ''}","${r.email || ''}","${r.serviceType}","${r.status}","${r.amount || ''}","${r.commission || ''}","${new Date(r.createdAt).toISOString()}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_search_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Activity Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="searchType">Search By</Label>
              <Select 
                value={searchFilters.searchType} 
                onValueChange={(value: any) => setSearchFilters(prev => ({ ...prev, searchType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select search type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iccid">ICCID</SelectItem>
                  <SelectItem value="mobile_number">Mobile Number</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="customer_name">Customer Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="searchTerm">Search Term</Label>
              <Input
                id="searchTerm"
                value={searchFilters.searchTerm}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder={searchFilters.searchType === 'mobile_number' 
                  ? "Enter mobile number (any format: 5551234567, 555-123-4567, etc.)..."
                  : searchFilters.searchType === 'iccid'
                  ? "Enter ICCID..."
                  : `Enter ${searchFilters.searchType.replace('_', ' ')}...`}
                onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
              />
            </div>
            
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={handleQuickSearch}
                disabled={quickSearchMutation.isPending || searchMutation.isPending}
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                variant="outline" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced
              </Button>
            </div>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select 
                  value={searchFilters.serviceType} 
                  onValueChange={(value: any) => setSearchFilters(prev => ({ ...prev, serviceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="nexitel_activation">Nexitel Activation</SelectItem>
                    <SelectItem value="nexitel_recharge">Nexitel Recharge</SelectItem>
                    <SelectItem value="global_recharge">Global Recharge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={searchFilters.status} 
                  onValueChange={(value: any) => setSearchFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={searchFilters.dateFrom}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={searchFilters.dateTo}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>

              <div className="md:col-span-4">
                <Button onClick={handleAdvancedSearch} disabled={searchMutation.isPending} className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Advanced Search
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Search Results ({searchResults.total} records found)
            </CardTitle>
            {searchResults.total > 0 && (
              <Button onClick={exportResults} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {searchResults.total === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No records found matching your search criteria
              </div>
            ) : (
              <div className="space-y-6">
                {searchResults.activations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Activations ({searchResults.activations.length})</h3>
                    <div className="grid gap-3">
                      {searchResults.activations.map((activation) => (
                        <div key={`activation-${activation.id}`} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm flex-1">
                              <div>
                                <span className="font-medium">ICCID:</span> {activation.iccid}
                              </div>
                              <div>
                                <span className="font-medium">Customer:</span> {activation.customerName}
                              </div>
                              <div>
                                <span className="font-medium">Email:</span> {activation.email}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span> {format(new Date(activation.createdAt), 'MMM dd, yyyy')}
                              </div>
                            </div>
                            <Badge variant={getStatusBadgeVariant(activation.status)}>
                              {activation.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.recharges.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recharges ({searchResults.recharges.length})</h3>
                    <div className="grid gap-3">
                      {searchResults.recharges.map((recharge) => (
                        <div key={`recharge-${recharge.id}`} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm flex-1">
                              <div>
                                <span className="font-medium">Mobile:</span> {recharge.mobileNumber}
                              </div>
                              <div>
                                <span className="font-medium">Amount:</span> ${recharge.amount}
                              </div>
                              <div>
                                <span className="font-medium">Commission:</span> ${recharge.commission}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span> {format(new Date(recharge.createdAt), 'MMM dd, yyyy')}
                              </div>
                            </div>
                            <Badge variant={getStatusBadgeVariant(recharge.status)}>
                              {recharge.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}