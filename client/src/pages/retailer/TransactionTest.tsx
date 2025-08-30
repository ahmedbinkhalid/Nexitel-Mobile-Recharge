import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";

export default function TransactionTest() {
  const { user } = useAuth();

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ["/api/transactions/user", user?.id],
    enabled: !!user?.id,
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Transaction Test</h1>
      
      <div className="mb-4">
        <p><strong>User ID:</strong> {user?.id}</p>
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error ? JSON.stringify(error) : 'None'}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Raw Transaction Data:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(transactions, null, 2)}
        </pre>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Transaction Count:</h2>
        <p>{Array.isArray(transactions) ? transactions.length : 0} transactions found</p>
      </div>
    </div>
  );
}