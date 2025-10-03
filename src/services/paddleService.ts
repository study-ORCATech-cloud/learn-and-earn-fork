import { initializePaddle, InitializePaddleOptions, Paddle } from '@paddle/paddle-js';

class PaddleService {
  private paddleInstance: Paddle | null = null;
  private isInitializing = false;

  async initialize(): Promise<Paddle> {
    if (this.paddleInstance) {
      return this.paddleInstance;
    }

    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (!this.paddleInstance) {
        throw new Error('Paddle initialization failed');
      }
      return this.paddleInstance;
    }

    try {
      this.isInitializing = true;
      
      const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT || 'sandbox';
      const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;

      if (!token) {
        throw new Error('Paddle client token not found in environment variables');
      }

      const options: InitializePaddleOptions = {
        environment: environment as 'sandbox' | 'production',
        token: token,
      };

      this.paddleInstance = await initializePaddle(options);

      if (!this.paddleInstance) {
        throw new Error('Failed to initialize Paddle instance');
      }

      return this.paddleInstance;
    } catch (error) {
      console.error('Failed to initialize Paddle:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  getInstance(): Paddle | null {
    return this.paddleInstance;
  }

  async openCheckout(items: any[], settings?: any): Promise<void> {
    const paddle = await this.initialize();
    
    return paddle.Checkout.open({
      items,
      settings,
    });
  }

  async openCheckoutWithTransactionId(transactionId: string, options?: any): Promise<void> {
    const paddle = await this.initialize();
    
    // Extract eventCallback and other settings
    const { eventCallback, ...checkoutSettings } = options || {};
    
    // Paddle.Checkout.open expects settings and eventCallback at the top level
    const checkoutOptions: any = {
      transactionId,
    };

    // Add settings if provided
    if (Object.keys(checkoutSettings).length > 0) {
      checkoutOptions.settings = checkoutSettings;
    }

    // Add eventCallback if provided
    if (eventCallback) {
      checkoutOptions.eventCallback = eventCallback;
    }

    return paddle.Checkout.open(checkoutOptions);
  }

  async getTransactionDetails(_transactionId: string): Promise<any> {
    // This would typically be a backend API call
    // Paddle doesn't provide client-side transaction details for security
    throw new Error('Transaction details should be fetched from backend API');
  }
}

export default new PaddleService();