import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Home, Receipt, Loader2 } from 'lucide-react';

interface TransactionDetails {
  id: string;
  status: string;
  amount?: string;
  currency?: string;
  packageName?: string;
  coins?: number;
  createdAt?: string;
  message?: string;
}

export default function PurchaseSuccess() {
  const [searchParams] = useSearchParams();
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!transactionId) {
        setError('No transaction ID provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch transaction details from backend
        const backendUrl = import.meta.env.VITE_BACKEND_BASE_PATH;
        const response = await fetch(`${backendUrl}/api/v1/transactions/${transactionId}`, {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Transaction not found. The payment may still be processing, or there may have been an issue with the webhook. Please contact support if this persists.');
          }
          if (response.status >= 500) {
            throw new Error('Server error occurred while fetching transaction details. Please contact support.');
          }
          throw new Error(`Failed to fetch transaction details: ${response.statusText}. Please contact support if this issue persists.`);
        }

        const data = await response.json();
        
        // Extract the transaction data from the wrapper
        const transaction = data.transaction || data;
        
        // Validate that we got the expected data structure from your backend
        if (!transaction || (!transaction.id && !transaction.paddle_transaction_id)) {
          throw new Error('Invalid transaction data received from server. Please contact support.');
        }

        // Map the backend data structure to frontend structure
        setTransactionDetails({
          id: transaction.paddle_transaction_id || transaction.id,
          status: transaction.status,
          amount: transaction.amount_usd ? `$${transaction.amount_usd}` : undefined,
          currency: 'USD',
          packageName: transaction.package?.name,
          coins: transaction.coins_granted || transaction.package_coin_amount || transaction.package?.coin_amount,
          createdAt: transaction.created_at,
          message: transaction.message,
        });
        
      } catch (err) {
        console.error('Failed to fetch transaction details:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load transaction details. Please contact support.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading transaction details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !transactionDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <Receipt className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-destructive text-xl">Unable to Load Transaction Details</CardTitle>
            <CardDescription className="text-base">
              {error || 'Transaction not found'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What you can do:</h4>
              <ul className="text-sm space-y-1">
                <li>• Wait a few minutes and refresh this page</li>
                <li>• Check your email for a payment confirmation</li>
                <li>• Contact our support team for assistance</li>
              </ul>
            </div>
            
            {transactionId && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-sm">{transactionId}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please include this ID when contacting support
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/contact">Contact Support</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/">Return Home</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {transactionDetails.status === 'pending' ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                <Loader2 className="h-8 w-8 text-yellow-600 dark:text-yellow-400 animate-spin" />
              </div>
              <CardTitle className="text-2xl text-yellow-600 dark:text-yellow-400">
                Payment Processing
              </CardTitle>
              <CardDescription>
                {transactionDetails.message || 'Your payment is being processed. This may take a few minutes.'}
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                Payment Successful!
              </CardTitle>
              <CardDescription>
                Thank you for your purchase. Your transaction has been completed successfully.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Transaction Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Transaction Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Transaction ID</span>
                <span className="text-sm font-mono">{transactionDetails.id}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge 
                  variant="default" 
                  className={
                    transactionDetails.status === 'pending'
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400"
                      : transactionDetails.status === 'completed'
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400"
                  }
                >
                  {transactionDetails.status.charAt(0).toUpperCase() + transactionDetails.status.slice(1)}
                </Badge>
              </div>

              {transactionDetails.packageName && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Package</span>
                  <span className="text-sm font-medium">{transactionDetails.packageName}</span>
                </div>
              )}

              {transactionDetails.amount && transactionDetails.currency && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-sm font-medium">
                    {transactionDetails.currency} {transactionDetails.amount}
                  </span>
                </div>
              )}

              {transactionDetails.coins && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Coins Added</span>
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    +{transactionDetails.coins.toLocaleString()} coins
                  </span>
                </div>
              )}

              {transactionDetails.createdAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm">
                    {new Date(transactionDetails.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Status Message */}
          <div className="text-center space-y-2">
            {transactionDetails.status === 'pending' ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Your payment is being processed. Coins will be added to your account once the payment is confirmed.
                </p>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  This usually takes a few minutes. You'll receive an email confirmation when it's complete.
                </p>
              </>
            ) : transactionDetails.status === 'completed' ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Your coins have been added to your account and are ready to use!
                </p>
                {transactionDetails.coins && (
                  <p className="text-sm font-medium text-primary">
                    You now have access to premium content and features.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Please check your email for payment confirmation details.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/packages">
                <Package className="h-4 w-4 mr-2" />
                View More Packages
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Return to Homepage
              </Link>
            </Button>
          </div>

          {/* Receipt Note */}
          <div className="text-center">
            {transactionDetails.status === 'completed' ? (
              <p className="text-xs text-muted-foreground">
                A receipt has been sent to your email address.
              </p>
            ) : transactionDetails.status === 'pending' ? (
              <p className="text-xs text-muted-foreground">
                A receipt will be sent to your email address once payment is confirmed.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Check your email for payment details and receipt.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}