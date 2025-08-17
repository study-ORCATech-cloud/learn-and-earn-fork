// Error logging service for backend reporting

export interface ErrorLogData {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  errorType: 'general' | 'orca_coins_error' | 'lab_access_error' | 'analytics_error';
  context: {
    route: string;
    userRole?: string;
    feature?: string;
    action?: string;
    metadata?: Record<string, any>;
  };
}

export interface ErrorLogRequest {
  error: ErrorLogData;
  user: {
    id?: string;
    email?: string;
    role?: string;
  };
  session: {
    sessionId?: string;
    ip?: string;
    duration?: number; // seconds since page load
  };
  environment: {
    version?: string;
    environment: 'development' | 'staging' | 'production';
    platform: 'web' | 'mobile';
    browser?: string;
    os?: string;
  };
}

class ErrorLoggingService {
  private readonly baseUrl: string;
  private sessionStartTime = Date.now();

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_BASE_PATH;
  }

  /**
   * Log error to backend for monitoring and support
   */
  async logError(error: Error, errorInfo?: React.ErrorInfo, context?: Partial<ErrorLogData['context']>): Promise<void> {
    try {
      const errorLogData = await this.buildErrorLogData(error, errorInfo, context);
      
      const response = await fetch(`${this.baseUrl}/api/v1/log/error`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(errorLogData),
      });

      if (!response.ok) {
        // Don't throw - we don't want error logging to cause more errors
        console.warn('Failed to log error to backend:', response.status, response.statusText);
      }
    } catch (loggingError) {
      // Fail silently to avoid infinite error loops
      console.warn('Error logging service failed:', loggingError);
    }
  }

  /**
   * Log JavaScript errors that aren't caught by React Error Boundary
   */
  async logJavaScriptError(
    message: string, 
    filename?: string, 
    lineno?: number, 
    colno?: number, 
    error?: Error,
    context?: Partial<ErrorLogData['context']>
  ): Promise<void> {
    const syntheticError = error || new Error(message);
    syntheticError.stack = syntheticError.stack || `at ${filename}:${lineno}:${colno}`;
    
    await this.logError(syntheticError, undefined, {
      ...context,
      feature: 'javascript-error',
      metadata: {
        filename,
        lineno,
        colno,
        ...context?.metadata,
      },
    });
  }

  /**
   * Build comprehensive error log data
   */
  private async buildErrorLogData(
    error: Error, 
    errorInfo?: React.ErrorInfo, 
    context?: Partial<ErrorLogData['context']> & { errorType?: ErrorLogData['errorType'] }
  ): Promise<ErrorLogRequest> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Get user info from memory or API
    const userData = await this.getCurrentUserData();
    
    return {
      error: {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: userData.id,
        timestamp: new Date().toISOString(),
        severity: this.determineSeverity(error),
        errorType: context?.errorType || 'general',
        context: {
          route: window.location.pathname,
          userRole: userData.role,
          feature: context?.feature || 'unknown',
          action: context?.action || 'unknown',
          metadata: {
            referrer: document.referrer,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            ...context?.metadata,
          },
        },
      },
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
      },
      session: {
        sessionId: this.getSessionId(),
        duration: Math.floor((Date.now() - this.sessionStartTime) / 1000),
      },
      environment: {
        version: import.meta.env.VITE_APP_VERSION || 'unknown',
        environment: (import.meta.env.MODE as any) || 'development',
        platform: 'web',
        browser: this.getBrowserInfo(),
        os: this.getOSInfo(),
      },
    };
  }

  /**
   * Determine error severity based on error type and message
   */
  private determineSeverity(error: Error): ErrorLogData['severity'] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Critical errors
    if (
      message.includes('network error') ||
      message.includes('failed to fetch') ||
      message.includes('authentication') ||
      message.includes('authorization') ||
      stack.includes('useauth') ||
      stack.includes('managementcontext')
    ) {
      return 'critical';
    }

    // High severity
    if (
      message.includes('failed to load') ||
      message.includes('permission denied') ||
      message.includes('cannot read property') ||
      message.includes('undefined is not a function') ||
      stack.includes('managementsystem')
    ) {
      return 'high';
    }

    // Medium severity
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('not found') ||
      stack.includes('form')
    ) {
      return 'medium';
    }

    // Default to medium
    return 'medium';
  }

  /**
   * Set current user data (to be called from auth context)
   */
  private currentUser: { id?: string; email?: string; role?: string } = {};
  
  setCurrentUser(user: { id?: string; email?: string; role?: string }) {
    this.currentUser = user;
  }

  /**
   * Get current user data from memory (set by auth context) or try to fetch from API
   */
  private async getCurrentUserData(): Promise<{ id?: string; email?: string; role?: string }> {
    // Return cached user data if available
    if (this.currentUser.id || this.currentUser.email) {
      return this.currentUser;
    }

    // Try to fetch user data directly from API as fallback
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_AUTH_URL || `${this.baseUrl}/auth`;
      const response = await fetch(`${baseUrl}/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return {
          id: userData.id,
          email: userData.email,
          role: userData.role,
        };
      }
    } catch (e) {
      // Ignore API errors - error logging should still work without user data
    }
    
    return {};
  }

  /**
   * Get or generate session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  /**
   * Get browser information
   */
  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  /**
   * Get OS information
   */
  private getOSInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Log Orca Coins related errors
   */
  async logOrcaCoinsError(
    error: Error,
    context: {
      feature: string;
      action: string;
      walletBalance?: number;
      transactionId?: string;
      labUrl?: string;
    }
  ) {
    await this.logError(error, undefined, {
      ...context,
      errorType: 'orca_coins_error',
      metadata: {
        walletBalance: context.walletBalance,
        transactionId: context.transactionId,
        labUrl: context.labUrl,
      }
    });
  }

  /**
   * Log lab access related errors
   */
  async logLabAccessError(
    error: Error,
    context: {
      feature: string;
      action: string;
      labUrl?: string;
      hasAccess?: boolean;
      premiumCost?: number;
    }
  ) {
    await this.logError(error, undefined, {
      ...context,
      errorType: 'lab_access_error',
      metadata: {
        labUrl: context.labUrl,
        hasAccess: context.hasAccess,
        premiumCost: context.premiumCost,
      }
    });
  }

  /**
   * Log analytics related errors
   */
  async logAnalyticsError(
    error: Error,
    context: {
      feature: string;
      action: string;
      dashboardSection?: string;
      dataType?: string;
    }
  ) {
    await this.logError(error, undefined, {
      ...context,
      errorType: 'analytics_error',
      metadata: {
        dashboardSection: context.dashboardSection,
        dataType: context.dataType,
      }
    });
  }
}

export const errorLoggingService = new ErrorLoggingService();

// Global error handler for unhandled JavaScript errors
window.addEventListener('error', (event) => {
  errorLoggingService.logJavaScriptError(
    event.message,
    event.filename,
    event.lineno,
    event.colno,
    event.error,
    {
      feature: 'global-error-handler',
      action: 'unhandled-error',
    }
  );
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
  
  errorLoggingService.logError(error, undefined, {
    feature: 'global-error-handler',
    action: 'unhandled-promise-rejection',
    metadata: {
      promiseReason: String(event.reason),
    },
  });
});