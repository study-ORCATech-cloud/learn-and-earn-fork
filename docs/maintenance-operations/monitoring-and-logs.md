
# Monitoring and Log Analysis Guide

## Overview

This guide provides comprehensive instructions for setting up monitoring and log analysis for the LabDojo Learning Platform. Proper monitoring ensures optimal performance, quick issue resolution, and data-driven decision making.

## Table of Contents

1. [Monitoring Strategy](#monitoring-strategy)
2. [Application Performance Monitoring](#application-performance-monitoring)
3. [Log Management](#log-management)
4. [Error Tracking](#error-tracking)
5. [User Analytics](#user-analytics)
6. [Infrastructure Monitoring](#infrastructure-monitoring)
7. [Alerting and Notifications](#alerting-and-notifications)
8. [Dashboards and Visualization](#dashboards-and-visualization)
9. [Log Analysis Techniques](#log-analysis-techniques)
10. [Performance Metrics](#performance-metrics)
11. [Security Monitoring](#security-monitoring)
12. [Compliance and Audit Logs](#compliance-and-audit-logs)
13. [Troubleshooting](#troubleshooting)
14. [Best Practices](#best-practices)

## Monitoring Strategy

### Monitoring Objectives

- **Performance Optimization**: Track application speed and responsiveness
- **Error Detection**: Identify and resolve issues quickly
- **User Experience**: Monitor user interactions and satisfaction
- **Resource Usage**: Track system resource consumption
- **Security**: Detect suspicious activities and vulnerabilities
- **Business Metrics**: Monitor learning outcomes and engagement

### Monitoring Levels

```
┌─────────────────────────────────────┐
│         Business Metrics            │
├─────────────────────────────────────┤
│         Application Layer           │
├─────────────────────────────────────┤
│         Infrastructure Layer        │
├─────────────────────────────────────┤
│         Network Layer               │
└─────────────────────────────────────┘
```

### Key Metrics Categories

1. **Golden Signals**
   - Latency
   - Traffic
   - Errors
   - Saturation

2. **Learning-Specific Metrics**
   - Course completion rates
   - User engagement time
   - Assessment scores
   - Progress tracking

3. **Technical Metrics**
   - Response times
   - Error rates
   - Resource utilization
   - Availability

## Application Performance Monitoring

### Frontend Performance Monitoring

#### Web Vitals Tracking

```typescript
// utils/performanceMonitoring.ts
export class PerformanceMonitor {
  static trackWebVitals(): void {
    // Track Core Web Vitals
    this.trackLCP(); // Largest Contentful Paint
    this.trackFID(); // First Input Delay
    this.trackCLS(); // Cumulative Layout Shift
  }

  private static trackLCP(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      console.log('LCP:', lastEntry.startTime);
      this.sendMetric('lcp', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }

  private static trackFID(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log('FID:', entry.processingStart - entry.startTime);
        this.sendMetric('fid', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });
  }

  private static trackCLS(): void {
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      console.log('CLS:', clsValue);
      this.sendMetric('cls', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private static sendMetric(name: string, value: number): void {
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'web_vital', {
        name,
        value: Math.round(value),
        event_category: 'Performance'
      });
    }
  }
}
```

#### Resource Loading Monitoring

```typescript
// utils/resourceMonitoring.ts
export class ResourceMonitor {
  static trackResourceLoading(): void {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource');

      this.analyzeNavigationTiming(navigation);
      this.analyzeResourceTiming(resources);
    });
  }

  private static analyzeNavigationTiming(navigation: PerformanceNavigationTiming): void {
    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ssl: navigation.connectEnd - navigation.secureConnectionStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      download: navigation.responseEnd - navigation.responseStart,
      domReady: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      windowLoad: navigation.loadEventEnd - navigation.navigationStart
    };

    console.log('Navigation Timing:', metrics);
    this.sendNavigationMetrics(metrics);
  }

  private static analyzeResourceTiming(resources: PerformanceEntry[]): void {
    const slowResources = resources
      .filter((resource: any) => resource.duration > 1000)
      .map((resource: any) => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize
      }));

    if (slowResources.length > 0) {
      console.warn('Slow Resources:', slowResources);
      this.reportSlowResources(slowResources);
    }
  }

  private static sendNavigationMetrics(metrics: any): void {
    // Send to monitoring service
  }

  private static reportSlowResources(resources: any[]): void {
    // Report to error tracking service
  }
}
```

### Backend Performance Monitoring

#### API Response Time Tracking

```typescript
// utils/apiMonitoring.ts
export class APIMonitor {
  static wrapFetch(originalFetch: typeof fetch): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit) => {
      const startTime = Date.now();
      const url = typeof input === 'string' ? input : input.toString();

      try {
        const response = await originalFetch(input, init);
        const duration = Date.now() - startTime;

        this.logAPICall({
          url,
          method: init?.method || 'GET',
          status: response.status,
          duration,
          success: response.ok
        });

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.logAPICall({
          url,
          method: init?.method || 'GET',
          status: 0,
          duration,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        throw error;
      }
    };
  }

  private static logAPICall(data: {
    url: string;
    method: string;
    status: number;
    duration: number;
    success: boolean;
    error?: string;
  }): void {
    console.log('API Call:', data);

    // Send to monitoring service
    if (window.gtag) {
      window.gtag('event', 'api_call', {
        api_endpoint: data.url,
        http_method: data.method,
        response_time: data.duration,
        status_code: data.status,
        success: data.success
      });
    }

    // Alert on slow requests
    if (data.duration > 5000) {
      console.warn('Slow API call detected:', data);
    }

    // Alert on errors
    if (!data.success) {
      console.error('API call failed:', data);
    }
  }
}

// Initialize API monitoring
if (typeof window !== 'undefined') {
  window.fetch = APIMonitor.wrapFetch(window.fetch);
}
```

## Log Management

### Structured Logging

```typescript
// utils/logger.ts
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
  sessionId?: string;
  courseId?: string;
  action?: string;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  static getInstance(): Logger {
    if (!this.instance) {
      this.instance = new Logger();
    }
    return this.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  error(message: string, context?: any): void {
    this.log(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  private log(level: LogLevel, message: string, context?: any): void {
    if (level > this.logLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      courseId: this.getCurrentCourseId(),
      action: this.getCurrentAction()
    };

    // Console output
    this.outputToConsole(entry);

    // Buffer for batch sending
    this.addToBuffer(entry);

    // Send critical errors immediately
    if (level === LogLevel.ERROR) {
      this.sendLog(entry);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.split('T')[1].split('.')[0];
    const levelStr = LogLevel[entry.level];
    const prefix = `[${timestamp}] ${levelStr}:`;

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.context);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.context);
        break;
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.context);
        break;
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);

    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flushBuffer();
    }
  }

  private async flushBuffer(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await this.sendLogs(logs);
    } catch (error) {
      console.error('Failed to send logs:', error);
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...logs);
    }
  }

  private async sendLog(entry: LogEntry): Promise<void> {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  }

  private async sendLogs(logs: LogEntry[]): Promise<void> {
    try {
      await fetch('/api/logs/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs })
      });
    } catch (error) {
      console.error('Failed to send logs batch:', error);
    }
  }

  private getCurrentUserId(): string | undefined {
    // Get from auth context or localStorage
    return localStorage.getItem('userId') || undefined;
  }

  private getSessionId(): string | undefined {
    // Get or generate session ID
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private getCurrentCourseId(): string | undefined {
    // Extract from current URL or context
    const path = window.location.pathname;
    const match = path.match(/\/courses\/([^\/]+)/);
    return match ? match[1] : undefined;
  }

  private getCurrentAction(): string | undefined {
    // Extract current action from context
    return window.location.pathname;
  }
}

export const logger = Logger.getInstance();
```

### Learning Activity Logging

```typescript
// utils/learningLogger.ts
export class LearningLogger {
  static logCourseStart(courseId: string): void {
    logger.info('Course started', {
      action: 'course_start',
      courseId,
      timestamp: Date.now()
    });
  }

  static logCourseComplete(courseId: string, duration: number): void {
    logger.info('Course completed', {
      action: 'course_complete',
      courseId,
      duration,
      timestamp: Date.now()
    });
  }

  static logLessonStart(courseId: string, lessonId: string): void {
    logger.info('Lesson started', {
      action: 'lesson_start',
      courseId,
      lessonId,
      timestamp: Date.now()
    });
  }

  static logLessonComplete(courseId: string, lessonId: string, duration: number): void {
    logger.info('Lesson completed', {
      action: 'lesson_complete',
      courseId,
      lessonId,
      duration,
      timestamp: Date.now()
    });
  }

  static logQuizAttempt(courseId: string, quizId: string, score: number): void {
    logger.info('Quiz attempted', {
      action: 'quiz_attempt',
      courseId,
      quizId,
      score,
      timestamp: Date.now()
    });
  }

  static logSearchQuery(query: string, resultsCount: number): void {
    logger.info('Search performed', {
      action: 'search',
      query,
      resultsCount,
      timestamp: Date.now()
    });
  }

  static logUserProgress(courseId: string, progress: number): void {
    logger.debug('Progress updated', {
      action: 'progress_update',
      courseId,
      progress,
      timestamp: Date.now()
    });
  }
}
```

## Error Tracking

### Error Boundary with Logging

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('React Error Boundary caught an error', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    });

    // Send to error tracking service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: true
      });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              We apologize for the inconvenience. The error has been logged.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Global Error Handler

```typescript
// utils/errorHandler.ts
export class GlobalErrorHandler {
  static initialize(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise,
        url: window.location.href,
        timestamp: Date.now()
      });

      // Prevent console error
      event.preventDefault();
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      logger.error('JavaScript error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        url: window.location.href,
        timestamp: Date.now()
      });
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      const target = event.target as HTMLElement;
      if (target && target !== window) {
        logger.error('Resource loading error', {
          tagName: target.tagName,
          source: (target as any).src || (target as any).href,
          url: window.location.href,
          timestamp: Date.now()
        });
      }
    }, true);
  }
}
```

## User Analytics

### User Behavior Tracking

```typescript
// utils/analyticsTracker.ts
export class AnalyticsTracker {
  private static pageStartTime = Date.now();

  static trackPageView(path: string): void {
    this.pageStartTime = Date.now();
    
    logger.info('Page view', {
      action: 'page_view',
      path,
      referrer: document.referrer,
      timestamp: Date.now()
    });

    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path
      });
    }
  }

  static trackPageExit(path: string): void {
    const timeOnPage = Date.now() - this.pageStartTime;
    
    logger.info('Page exit', {
      action: 'page_exit',
      path,
      timeOnPage,
      timestamp: Date.now()
    });
  }

  static trackUserInteraction(element: string, action: string): void {
    logger.debug('User interaction', {
      action: 'user_interaction',
      element,
      interactionType: action,
      timestamp: Date.now()
    });

    if (window.gtag) {
      window.gtag('event', action, {
        event_category: 'User Interaction',
        event_label: element
      });
    }
  }

  static trackLearningMilestone(milestone: string, courseId: string): void {
    logger.info('Learning milestone', {
      action: 'learning_milestone',
      milestone,
      courseId,
      timestamp: Date.now()
    });

    if (window.gtag) {
      window.gtag('event', 'learning_milestone', {
        event_category: 'Learning',
        event_label: milestone,
        custom_parameter_1: courseId
      });
    }
  }
}
```

### A/B Testing Integration

```typescript
// utils/abTesting.ts
export class ABTesting {
  private experiments: Map<string, string> = new Map();

  constructor() {
    this.loadExperiments();
  }

  private loadExperiments(): void {
    // Load active experiments from configuration
    const experiments = {
      'course_layout': ['variant_a', 'variant_b'],
      'cta_button': ['blue', 'green', 'orange']
    };

    Object.entries(experiments).forEach(([experiment, variants]) => {
      const variant = this.assignVariant(experiment, variants);
      this.experiments.set(experiment, variant);
    });
  }

  private assignVariant(experiment: string, variants: string[]): string {
    const userId = localStorage.getItem('userId') || 'anonymous';
    const hash = this.hashString(userId + experiment);
    const index = hash % variants.length;
    
    const variant = variants[index];
    
    logger.info('A/B Test assignment', {
      experiment,
      variant,
      userId: userId !== 'anonymous' ? userId : undefined
    });

    return variant;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  getVariant(experiment: string): string | null {
    return this.experiments.get(experiment) || null;
  }

  trackConversion(experiment: string, conversionType: string): void {
    const variant = this.getVariant(experiment);
    if (!variant) return;

    logger.info('A/B Test conversion', {
      action: 'ab_conversion',
      experiment,
      variant,
      conversionType,
      timestamp: Date.now()
    });

    if (window.gtag) {
      window.gtag('event', 'ab_test_conversion', {
        experiment_name: experiment,
        variant_name: variant,
        conversion_type: conversionType
      });
    }
  }
}

export const abTesting = new ABTesting();
```

## Infrastructure Monitoring

### Client-Side Resource Monitoring

```typescript
// utils/resourceMonitor.ts
export class ResourceMonitor {
  private static observer: PerformanceObserver | null = null;

  static startMonitoring(): void {
    this.monitorMemoryUsage();
    this.monitorNetworkStatus();
    this.monitorBatteryStatus();
  }

  private static monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const memoryInfo = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        };

        logger.debug('Memory usage', memoryInfo);

        // Alert on high memory usage
        if (memoryInfo.usagePercentage > 80) {
          logger.warn('High memory usage detected', memoryInfo);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private static monitorNetworkStatus(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const logNetworkInfo = () => {
        const networkInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };

        logger.info('Network status', networkInfo);
      };

      connection.addEventListener('change', logNetworkInfo);
      logNetworkInfo(); // Initial log
    }

    // Monitor online/offline status
    window.addEventListener('online', () => {
      logger.info('Network connection restored');
    });

    window.addEventListener('offline', () => {
      logger.warn('Network connection lost');
    });
  }

  private static async monitorBatteryStatus(): Promise<void> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        
        const logBatteryInfo = () => {
          const batteryInfo = {
            level: battery.level,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
          };

          logger.debug('Battery status', batteryInfo);

          // Alert on low battery
          if (battery.level < 0.2 && !battery.charging) {
            logger.warn('Low battery detected', batteryInfo);
          }
        };

        battery.addEventListener('levelchange', logBatteryInfo);
        battery.addEventListener('chargingchange', logBatteryInfo);
        logBatteryInfo(); // Initial log
      } catch (error) {
        logger.debug('Battery API not available');
      }
    }
  }
}
```

## Alerting and Notifications

### Alert Manager

```typescript
// utils/alertManager.ts
export interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  resolved: boolean;
  metadata?: any;
}

export class AlertManager {
  private static alerts: Alert[] = [];
  private static listeners: ((alert: Alert) => void)[] = [];

  static createAlert(
    severity: Alert['severity'],
    title: string,
    message: string,
    metadata?: any
  ): Alert {
    const alert: Alert = {
      id: crypto.randomUUID(),
      severity,
      title,
      message,
      timestamp: Date.now(),
      resolved: false,
      metadata
    };

    this.alerts.push(alert);
    this.notifyListeners(alert);
    this.logAlert(alert);

    // Auto-send critical alerts
    if (severity === 'critical') {
      this.sendImmediateNotification(alert);
    }

    return alert;
  }

  static resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      logger.info('Alert resolved', { alertId, title: alert.title });
    }
  }

  static getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  static addListener(listener: (alert: Alert) => void): void {
    this.listeners.push(listener);
  }

  private static notifyListeners(alert: Alert): void {
    this.listeners.forEach(listener => {
      try {
        listener(alert);
      } catch (error) {
        console.error('Alert listener error:', error);
      }
    });
  }

  private static logAlert(alert: Alert): void {
    const logLevel = {
      low: 'debug',
      medium: 'info',
      high: 'warn',
      critical: 'error'
    }[alert.severity] as keyof typeof logger;

    logger[logLevel](`Alert: ${alert.title}`, {
      alertId: alert.id,
      message: alert.message,
      metadata: alert.metadata
    });
  }

  private static async sendImmediateNotification(alert: Alert): Promise<void> {
    try {
      // Send to notification service
      await fetch('/api/alerts/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
    } catch (error) {
      console.error('Failed to send alert notification:', error);
    }
  }
}
```

### Performance Thresholds

```typescript
// utils/performanceThresholds.ts
export class PerformanceThresholds {
  private static thresholds = {
    pageLoadTime: 3000,
    apiResponseTime: 2000,
    errorRate: 0.05, // 5%
    memoryUsage: 0.8, // 80%
    networkLatency: 1000
  };

  static checkPageLoadTime(duration: number): void {
    if (duration > this.thresholds.pageLoadTime) {
      AlertManager.createAlert(
        'medium',
        'Slow page load detected',
        `Page loaded in ${duration}ms (threshold: ${this.thresholds.pageLoadTime}ms)`,
        { duration, threshold: this.thresholds.pageLoadTime }
      );
    }
  }

  static checkAPIResponseTime(endpoint: string, duration: number): void {
    if (duration > this.thresholds.apiResponseTime) {
      AlertManager.createAlert(
        'medium',
        'Slow API response',
        `${endpoint} responded in ${duration}ms (threshold: ${this.thresholds.apiResponseTime}ms)`,
        { endpoint, duration, threshold: this.thresholds.apiResponseTime }
      );
    }
  }

  static checkErrorRate(endpoint: string, errorCount: number, totalRequests: number): void {
    const errorRate = errorCount / totalRequests;
    if (errorRate > this.thresholds.errorRate) {
      AlertManager.createAlert(
        'high',
        'High error rate detected',
        `${endpoint} has ${(errorRate * 100).toFixed(2)}% error rate (threshold: ${(this.thresholds.errorRate * 100).toFixed(2)}%)`,
        { endpoint, errorRate, threshold: this.thresholds.errorRate }
      );
    }
  }
}
```

## Dashboards and Visualization

### Real-time Dashboard Component

```typescript
// components/MonitoringDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface MetricData {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        const data = await response.json();
        setMetrics(data.metrics);
        setAlerts(data.alerts);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">System Monitoring Dashboard</h1>
      
      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-red-600">Active Alerts</h2>
          {alerts.map((alert) => (
            <Alert key={alert.id} className="border-red-200">
              <AlertTitle className="text-red-800">{alert.title}</AlertTitle>
              <AlertDescription className="text-red-700">
                {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {metric.value}{metric.unit}
                </span>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

## Best Practices

### Implementation Guidelines

1. **Structured Logging**
   - Use consistent log formats
   - Include relevant context
   - Avoid logging sensitive data
   - Use appropriate log levels

2. **Performance Monitoring**
   - Monitor Core Web Vitals
   - Track API response times
   - Monitor resource usage
   - Set up alerting thresholds

3. **Error Tracking**
   - Implement global error handlers
   - Use error boundaries in React
   - Log errors with context
   - Set up error notifications

4. **Security Monitoring**
   - Monitor authentication failures
   - Track suspicious activities
   - Log security-related events
   - Set up security alerts

5. **Data Privacy**
   - Avoid logging PII
   - Implement data retention policies
   - Use data anonymization
   - Comply with regulations

### Monitoring Checklist

- [ ] Application performance monitoring set up
- [ ] Error tracking implemented
- [ ] User analytics configured
- [ ] Infrastructure monitoring active
- [ ] Alerting rules configured
- [ ] Dashboards created
- [ ] Log aggregation set up
- [ ] Security monitoring enabled
- [ ] Compliance logging implemented
- [ ] Documentation updated

---

This monitoring and log analysis setup provides comprehensive visibility into your LabDojo Learning Platform's performance, user behavior, and system health. Regular review and adjustment of monitoring strategies ensure optimal platform operation and user experience.
