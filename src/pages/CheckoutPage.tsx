import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import paddleService from '@/services/paddleService';
import { errorLoggingService } from '@/services/errorLoggingService';

type CheckoutState = 'loading' | 'ready' | 'error' | 'processing' | 'redirecting';

export default function CheckoutPage() {
  const [state, setState] = useState<CheckoutState>('loading');
  const [error, setError] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initializeCheckout = async () => {
    try {
      setState('loading');
      setError('');

      // Extract transaction ID from URL parameters
      const ptxn = searchParams.get('_ptxn');
      if (!ptxn) {
        throw new Error('No transaction ID found in URL. Please start the purchase process again.');
      }

      setTransactionId(ptxn);

      // Initialize Paddle
      await paddleService.initialize();
      
      setState('ready');

      // Open Paddle checkout immediately
      await openPaddleCheckout(ptxn);

    } catch (err) {
      console.error('Checkout initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize checkout');
      setState('error');
    }
  };

  const openPaddleCheckout = async (txnId: string) => {
    try {
      setState('processing');

      // Open checkout with transaction ID using the service method
      await paddleService.openCheckoutWithTransactionId(txnId, {
        // Event callback - this is crucial for handling completion
        eventCallback: handleCheckoutEvent,
        // Settings for the checkout
        displayMode: 'overlay',
        theme: 'light',
        locale: 'en',
        allowLogout: false,
        showAddTaxId: false,
        showAddDiscounts: false,
      });

    } catch (err) {
      console.error('Paddle checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to open checkout');
      setState('error');
    }
  };

  const handleCheckoutEvent = (data: any) => {
    switch (data.name) {
      case 'checkout.completed':
        // Payment successful - redirect to success page
        navigate(`/purchase/success?transaction_id=${data.data?.transaction?.id || data.data?.transaction_id || transactionId}`, {
          replace: true
        });
        break;

      case 'checkout.error':
        // Payment failed - redirect to cancel page with error
        navigate(`/purchase/cancel?transaction_id=${transactionId}&error=${encodeURIComponent(data.data?.error?.message || 'Payment failed')}`, {
          replace: true
        });
        break;

      case 'checkout.closed':
        // User closed checkout without completing - redirect to cancel
        navigate(`/purchase/cancel?transaction_id=${transactionId}&reason=cancelled`, {
          replace: true
        });
        break;

      case 'checkout.loaded':
        setState('ready');
        break;

      case 'checkout.warning':
        // Log warning to backend for monitoring
        errorLoggingService.logError(
          new Error(`Paddle checkout warning: ${JSON.stringify(data.data)}`),
          undefined,
          {
            feature: 'paddle-checkout',
            action: 'checkout-warning',
            metadata: {
              transactionId,
              eventData: data.data,
              eventName: data.name,
            },
          }
        );
        break;

      default:
        // Log unhandled events to backend for debugging
        errorLoggingService.logError(
          new Error(`Unhandled Paddle event: ${data.name}`),
          undefined,
          {
            feature: 'paddle-checkout',
            action: 'unhandled-event',
            metadata: {
              transactionId,
              eventData: data.data,
              eventName: data.name,
            },
          }
        );
    }
  };

  const handleRetry = () => {
    initializeCheckout();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    initializeCheckout();
  }, [searchParams]);

  // Add multiple event listeners to catch Paddle events
  useEffect(() => {
    const handleMessageEvent = (event: MessageEvent) => {
      if (event.origin.includes('paddle.com')) {
        
        // Handle Paddle postMessage events (they use event_name, not type)
        const eventName = event.data?.event_name;
        
        if (eventName === 'checkout.completed') {
          setState('redirecting');
          
          const transactionIdFromEvent = event.data?.callback_data?.transaction?.id || transactionId;
          
          // Close Paddle checkout modal before navigation
          const paddle = paddleService.getInstance();
          if (paddle?.Checkout?.close) {
            paddle.Checkout.close();
          }
          
          // Use React Router navigation to avoid full page reload
          setTimeout(() => {
            navigate(`/purchase/success?transaction_id=${transactionIdFromEvent}`, { replace: true });
          }, 300);
          
        } else if (eventName === 'checkout.error') {
          setState('redirecting');
          
          // Close Paddle checkout modal before navigation
          const paddle = paddleService.getInstance();
          if (paddle?.Checkout?.close) {
            paddle.Checkout.close();
          }
          
          setTimeout(() => {
            navigate(`/purchase/cancel?transaction_id=${transactionId}&error=payment_failed`, { replace: true });
          }, 300);
          
        } else if (eventName === 'checkout.closed') {
          // Don't auto-redirect on close - user might just be looking around
        }
      }
    };

    const handleGlobalPaddleEvent = (event: any) => {
      if (event.detail) {
        handleCheckoutEvent(event.detail);
      }
    };

    // Listen for postMessage events from Paddle iframe
    window.addEventListener('message', handleMessageEvent);
    
    // Listen for custom Paddle events on window
    window.addEventListener('paddle_checkout_completed', handleGlobalPaddleEvent);
    window.addEventListener('paddle_checkout_error', handleGlobalPaddleEvent);
    window.addEventListener('paddle_checkout_closed', handleGlobalPaddleEvent);

    return () => {
      window.removeEventListener('message', handleMessageEvent);
      window.removeEventListener('paddle_checkout_completed', handleGlobalPaddleEvent);
      window.removeEventListener('paddle_checkout_error', handleGlobalPaddleEvent);
      window.removeEventListener('paddle_checkout_closed', handleGlobalPaddleEvent);
    };
  }, [transactionId, navigate]);

  // Cleanup effect to close Paddle modal when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Close Paddle checkout modal when component is unmounting
      try {
        const paddle = paddleService.getInstance();
        if (paddle?.Checkout?.close) {
          paddle.Checkout.close();
        }
      } catch (error) {
        console.warn('Failed to close Paddle checkout on cleanup:', error);
      }
    };
  }, []);

  // Handle browser back button and route changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        const paddle = paddleService.getInstance();
        if (paddle?.Checkout?.close) {
          paddle.Checkout.close();
        }
      } catch (error) {
        console.warn('Failed to close Paddle checkout on beforeunload:', error);
      }
    };

    const handlePopState = () => {
      try {
        const paddle = paddleService.getInstance();
        if (paddle?.Checkout?.close) {
          paddle.Checkout.close();
        }
      } catch (error) {
        console.warn('Failed to close Paddle checkout on popstate:', error);
      }
    };

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handlePopState);
    // Listen for page unload (including refresh)
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Preparing Your Checkout</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we set up your payment...
              </p>
            </div>
          </div>
        );

      case 'redirecting':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Redirecting you to the confirmation page...
              </p>
            </div>
          </div>
        );

      case 'ready':
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Opening Payment Form</h3>
              <p className="text-sm text-muted-foreground">
                The payment overlay should appear shortly. Complete your payment in the popup window.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Transaction ID: {transactionId}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={handleRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Checkout
              </Button>
              <Button 
                variant="outline" 
                onClick={handleGoBack}
              >
                Return Home
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleRetry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleGoBack} className="flex-1">
                Go Back
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Secure Checkout</CardTitle>
          <CardDescription>
            Complete your purchase securely through Paddle
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}