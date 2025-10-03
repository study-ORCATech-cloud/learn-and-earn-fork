import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { XCircle, ArrowLeft, RefreshCw, Home, AlertCircle, Package } from 'lucide-react';

export default function PurchaseCancel() {
  const [searchParams] = useSearchParams();
  
  const transactionId = searchParams.get('transaction_id');
  const error = searchParams.get('error');
  const reason = searchParams.get('reason');

  const getTitle = () => {
    if (error) return 'Payment Failed';
    if (reason === 'cancelled') return 'Payment Cancelled';
    return 'Payment Not Completed';
  };

  const getDescription = () => {
    if (error) return 'There was an issue processing your payment.';
    if (reason === 'cancelled') return 'You cancelled the payment process.';
    return 'Your payment was not completed.';
  };

  const getIcon = () => {
    if (error) return AlertCircle;
    return XCircle;
  };

  const Icon = getIcon();
  const iconColor = error ? 'text-destructive' : 'text-orange-500';
  const bgColor = error ? 'bg-destructive/10' : 'bg-orange-100 dark:bg-orange-900';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${bgColor}`}>
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
          <CardTitle className={`text-2xl ${iconColor}`}>
            {getTitle()}
          </CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Details */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {decodeURIComponent(error)}
              </AlertDescription>
            </Alert>
          )}

          {/* Transaction Info */}
          {transactionId && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Transaction Information</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Transaction ID</span>
                <span className="text-sm font-mono">{transactionId}</span>
              </div>
            </div>
          )}

          <Separator />

          {/* Help Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">What can you do?</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              {reason === 'cancelled' ? (
                <>
                  <li>• Try the purchase again if you want to continue</li>
                  <li>• Browse other available packages</li>
                  <li>• Contact support if you experienced any issues</li>
                </>
              ) : (
                <>
                  <li>• Check your payment method and try again</li>
                  <li>• Ensure you have sufficient funds</li>
                  <li>• Contact support if the problem persists</li>
                  <li>• Try using a different payment method</li>
                </>
              )}
            </ul>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            {reason === 'cancelled' ? (
              <Button asChild className="w-full">
                <Link to="/packages">
                  <Package className="h-4 w-4 mr-2" />
                  Browse Packages
                </Link>
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link to="/packages">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Link>
              </Button>
            )}
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              
              <Button variant="outline" asChild className="flex-1">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
            </div>
          </div>

          {/* Support Contact */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">
              Having trouble? We're here to help.
            </p>
            <Button variant="link" size="sm" asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>

          {/* Additional Information */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              No charges were made to your payment method.
              {transactionId && ` Reference: ${transactionId}`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}