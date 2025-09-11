
# Analytics Setup Guide

This guide covers implementing tracking and analytics for the LabDojo Learning Platform to monitor user engagement, course performance, and platform usage.

## Table of Contents

1. [Analytics Strategy](#analytics-strategy)
2. [Google Analytics 4 Setup](#google-analytics-4-setup)
3. [Event Tracking](#event-tracking)
4. [User Journey Analytics](#user-journey-analytics)
5. [Performance Monitoring](#performance-monitoring)
6. [Learning Analytics](#learning-analytics)
7. [Privacy Compliance](#privacy-compliance)
8. [Dashboard Setup](#dashboard-setup)
9. [Custom Reporting](#custom-reporting)
10. [Troubleshooting](#troubleshooting)

## Analytics Strategy

### Key Metrics to Track

#### User Engagement
- Page views and sessions
- Time on site/page
- Bounce rate
- User flow through learning paths
- Search queries and results

#### Learning Performance
- Course enrollment rates
- Course completion rates
- Lesson completion times
- Quiz scores and attempts
- Progress tracking
- Dropout points

#### Content Performance
- Most popular courses/paths
- Content engagement rates
- Resource download rates
- Video completion rates
- User feedback and ratings

#### Business Metrics
- Conversion rates
- User acquisition sources
- Retention rates
- Feature usage
- Support ticket correlation

## Google Analytics 4 Setup

### 1. Create GA4 Property

```javascript
// Install gtag via npm or CDN
npm install gtag

// Basic GA4 configuration
import { gtag } from 'gtag';

const GA_TRACKING_ID = 'G-XXXXXXXXXX';

// Initialize GA4
gtag('config', GA_TRACKING_ID, {
  page_title: document.title,
  page_location: window.location.href,
});
```

### 2. React Integration

```typescript
// utils/analytics.ts
interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export class Analytics {
  private static isInitialized = false;

  static init(trackingId: string) {
    if (typeof window === 'undefined' || this.isInitialized) return;

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', trackingId, {
      send_page_view: false, // Handle manually for SPA
    });

    this.isInitialized = true;
  }

  static trackPageView(path: string, title?: string) {
    if (!this.isInitialized) return;

    window.gtag('config', GA_TRACKING_ID, {
      page_path: path,
      page_title: title,
    });
  }

  static trackEvent({ action, category, label, value }: AnalyticsEvent) {
    if (!this.isInitialized) return;

    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  static trackCustomEvent(eventName: string, parameters: Record<string, any>) {
    if (!this.isInitialized) return;

    window.gtag('event', eventName, parameters);
  }
}
```

### 3. Router Integration

```typescript
// hooks/useAnalytics.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Analytics } from '../utils/analytics';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    Analytics.trackPageView(location.pathname + location.search);
  }, [location]);

  return {
    trackEvent: Analytics.trackEvent,
    trackCustomEvent: Analytics.trackCustomEvent,
  };
};
```

## Event Tracking

### 1. Learning Events

```typescript
// utils/learningAnalytics.ts
export const LearningAnalytics = {
  // Course Events
  trackCourseStart: (courseId: string, courseName: string) => {
    Analytics.trackCustomEvent('course_start', {
      course_id: courseId,
      course_name: courseName,
      timestamp: Date.now(),
    });
  },

  trackCourseComplete: (courseId: string, completionTime: number) => {
    Analytics.trackCustomEvent('course_complete', {
      course_id: courseId,
      completion_time_minutes: completionTime,
      timestamp: Date.now(),
    });
  },

  trackLessonComplete: (courseId: string, lessonId: string, timeSpent: number) => {
    Analytics.trackCustomEvent('lesson_complete', {
      course_id: courseId,
      lesson_id: lessonId,
      time_spent_seconds: timeSpent,
    });
  },

  // Progress Events
  trackProgressUpdate: (courseId: string, progressPercentage: number) => {
    Analytics.trackCustomEvent('progress_update', {
      course_id: courseId,
      progress_percentage: progressPercentage,
    });
  },

  // Engagement Events
  trackResourceDownload: (resourceId: string, resourceType: string) => {
    Analytics.trackCustomEvent('resource_download', {
      resource_id: resourceId,
      resource_type: resourceType,
    });
  },

  trackVideoPlay: (videoId: string, courseId: string) => {
    Analytics.trackCustomEvent('video_play', {
      video_id: videoId,
      course_id: courseId,
    });
  },

  trackVideoComplete: (videoId: string, watchTime: number) => {
    Analytics.trackCustomEvent('video_complete', {
      video_id: videoId,
      watch_time_seconds: watchTime,
    });
  },

  // Quiz Events
  trackQuizStart: (quizId: string, courseId: string) => {
    Analytics.trackCustomEvent('quiz_start', {
      quiz_id: quizId,
      course_id: courseId,
    });
  },

  trackQuizComplete: (quizId: string, score: number, attempts: number) => {
    Analytics.trackCustomEvent('quiz_complete', {
      quiz_id: quizId,
      score: score,
      attempts: attempts,
    });
  },
};
```

### 2. User Interaction Events

```typescript
// utils/interactionAnalytics.ts
export const InteractionAnalytics = {
  // Search Events
  trackSearch: (query: string, resultCount: number) => {
    Analytics.trackCustomEvent('search', {
      search_term: query,
      result_count: resultCount,
    });
  },

  trackSearchResultClick: (query: string, resultId: string, position: number) => {
    Analytics.trackCustomEvent('search_result_click', {
      search_term: query,
      result_id: resultId,
      position: position,
    });
  },

  // Navigation Events
  trackMenuClick: (menuItem: string) => {
    Analytics.trackEvent({
      action: 'click',
      category: 'Navigation',
      label: menuItem,
    });
  },

  trackExternalLinkClick: (url: string, context: string) => {
    Analytics.trackCustomEvent('external_link_click', {
      url: url,
      context: context,
    });
  },

  // Feature Usage
  trackFeatureUsage: (feature: string, action: string) => {
    Analytics.trackCustomEvent('feature_usage', {
      feature_name: feature,
      action: action,
    });
  },
};
```

## User Journey Analytics

### 1. Funnel Tracking

```typescript
// utils/funnelAnalytics.ts
export const FunnelAnalytics = {
  // Learning Path Funnel
  trackLearningPathView: (pathId: string) => {
    Analytics.trackCustomEvent('learning_path_view', {
      path_id: pathId,
      funnel_step: 'awareness',
    });
  },

  trackLearningPathEnroll: (pathId: string) => {
    Analytics.trackCustomEvent('learning_path_enroll', {
      path_id: pathId,
      funnel_step: 'conversion',
    });
  },

  trackLearningPathProgress: (pathId: string, progress: number) => {
    Analytics.trackCustomEvent('learning_path_progress', {
      path_id: pathId,
      progress_percentage: progress,
      funnel_step: 'retention',
    });
  },

  // Course Discovery Funnel
  trackCourseDiscovery: (source: string, courseId: string) => {
    Analytics.trackCustomEvent('course_discovery', {
      source: source, // 'search', 'recommendation', 'browse'
      course_id: courseId,
    });
  },
};
```

### 2. Cohort Analysis

```typescript
// utils/cohortAnalytics.ts
export const CohortAnalytics = {
  trackUserCohort: (userId: string, signupDate: string) => {
    const cohortMonth = new Date(signupDate).toISOString().slice(0, 7);
    
    Analytics.trackCustomEvent('user_cohort', {
      user_id: userId,
      cohort_month: cohortMonth,
    });
  },

  trackRetentionMetric: (userId: string, daysActive: number) => {
    Analytics.trackCustomEvent('retention_metric', {
      user_id: userId,
      days_active: daysActive,
    });
  },
};
```

## Performance Monitoring

### 1. Core Web Vitals

```typescript
// utils/performanceAnalytics.ts
export const PerformanceAnalytics = {
  trackWebVitals: () => {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      Analytics.trackCustomEvent('web_vital_lcp', {
        value: Math.round(lastEntry.startTime),
        metric_name: 'largest_contentful_paint',
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        Analytics.trackCustomEvent('web_vital_fid', {
          value: Math.round(entry.processingStart - entry.startTime),
          metric_name: 'first_input_delay',
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let cumulativeLayoutShift = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          cumulativeLayoutShift += entry.value;
        }
      });

      Analytics.trackCustomEvent('web_vital_cls', {
        value: Math.round(cumulativeLayoutShift * 1000) / 1000,
        metric_name: 'cumulative_layout_shift',
      });
    }).observe({ entryTypes: ['layout-shift'] });
  },

  trackPageLoadTime: (pageName: string) => {
    const loadTime = performance.now();
    
    Analytics.trackCustomEvent('page_load_time', {
      page_name: pageName,
      load_time_ms: Math.round(loadTime),
    });
  },
};
```

### 2. Error Tracking

```typescript
// utils/errorAnalytics.ts
export const ErrorAnalytics = {
  trackError: (error: Error, context: string) => {
    Analytics.trackCustomEvent('javascript_error', {
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500), // Limit stack trace
      context: context,
      user_agent: navigator.userAgent,
      url: window.location.href,
    });
  },

  trackApiError: (endpoint: string, statusCode: number, errorMessage: string) => {
    Analytics.trackCustomEvent('api_error', {
      endpoint: endpoint,
      status_code: statusCode,
      error_message: errorMessage,
    });
  },

  setupGlobalErrorHandling: () => {
    window.addEventListener('error', (event) => {
      ErrorAnalytics.trackError(event.error, 'global_error_handler');
    });

    window.addEventListener('unhandledrejection', (event) => {
      ErrorAnalytics.trackError(
        new Error(event.reason),
        'unhandled_promise_rejection'
      );
    });
  },
};
```

## Learning Analytics

### 1. Progress Tracking

```typescript
// utils/progressAnalytics.ts
export const ProgressAnalytics = {
  trackStudySession: (sessionId: string, duration: number, coursesStudied: string[]) => {
    Analytics.trackCustomEvent('study_session', {
      session_id: sessionId,
      duration_minutes: duration,
      courses_studied: coursesStudied.join(','),
      courses_count: coursesStudied.length,
    });
  },

  trackLearningStreak: (userId: string, streakDays: number) => {
    Analytics.trackCustomEvent('learning_streak', {
      user_id: userId,
      streak_days: streakDays,
    });
  },

  trackSkillAssessment: (skillId: string, beforeScore: number, afterScore: number) => {
    Analytics.trackCustomEvent('skill_assessment', {
      skill_id: skillId,
      score_before: beforeScore,
      score_after: afterScore,
      improvement: afterScore - beforeScore,
    });
  },
};
```

### 2. Content Effectiveness

```typescript
// utils/contentAnalytics.ts
export const ContentAnalytics = {
  trackContentRating: (contentId: string, contentType: string, rating: number) => {
    Analytics.trackCustomEvent('content_rating', {
      content_id: contentId,
      content_type: contentType,
      rating: rating,
    });
  },

  trackContentFeedback: (contentId: string, feedbackType: 'helpful' | 'not_helpful' | 'report_issue') => {
    Analytics.trackCustomEvent('content_feedback', {
      content_id: contentId,
      feedback_type: feedbackType,
    });
  },

  trackContentDifficulty: (contentId: string, difficultyRating: string) => {
    Analytics.trackCustomEvent('content_difficulty', {
      content_id: contentId,
      difficulty_rating: difficultyRating,
    });
  },
};
```

## Privacy Compliance

### 1. GDPR Compliance

```typescript
// utils/privacyAnalytics.ts
export const PrivacyAnalytics = {
  // Cookie consent management
  initializeWithConsent: (hasConsent: boolean) => {
    if (hasConsent) {
      Analytics.init(GA_TRACKING_ID);
    } else {
      // Initialize in privacy mode
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
      });
    }
  },

  updateConsent: (hasConsent: boolean) => {
    window.gtag('consent', 'update', {
      analytics_storage: hasConsent ? 'granted' : 'denied',
      ad_storage: hasConsent ? 'granted' : 'denied',
    });
  },

  // Data anonymization
  anonymizeIP: () => {
    window.gtag('config', GA_TRACKING_ID, {
      anonymize_ip: true,
    });
  },

  // User data deletion
  requestDataDeletion: (userId: string) => {
    // Implement data deletion request
    Analytics.trackCustomEvent('data_deletion_request', {
      user_id: userId,
      timestamp: Date.now(),
    });
  },
};
```

### 2. Data Minimization

```typescript
// Only collect necessary data
const collectMinimalData = (eventData: any) => {
  // Remove PII and sensitive information
  const sanitizedData = { ...eventData };
  delete sanitizedData.email;
  delete sanitizedData.phone;
  delete sanitizedData.fullName;
  
  return sanitizedData;
};
```

## Dashboard Setup

### 1. Custom GA4 Dashboard

```yaml
# GA4 Dashboard Configuration
dashboard_name: "LabDojo Learning Platform"

widgets:
  - name: "Active Users"
    type: "metric"
    metric: "activeUsers"
    dimension: "date"
    
  - name: "Course Completions"
    type: "custom_event"
    event_name: "course_complete"
    dimension: "course_id"
    
  - name: "Learning Path Funnel"
    type: "funnel"
    steps:
      - "learning_path_view"
      - "learning_path_enroll"
      - "course_start"
      - "course_complete"
      
  - name: "User Retention"
    type: "cohort"
    cohort_dimension: "firstSessionDate"
    retention_dimension: "nthDay"
```

### 2. Custom Reports

```typescript
// utils/customReports.ts
export const CustomReports = {
  generateLearningReport: async (startDate: string, endDate: string) => {
    // This would integrate with GA4 Reporting API
    const reportData = {
      courseCompletions: await fetchCourseCompletions(startDate, endDate),
      userEngagement: await fetchUserEngagement(startDate, endDate),
      contentPerformance: await fetchContentPerformance(startDate, endDate),
    };
    
    return reportData;
  },

  generateInstructorReport: async (instructorId: string) => {
    // Generate instructor-specific analytics
    return {
      coursesCreated: await fetchInstructorCourses(instructorId),
      studentEngagement: await fetchStudentEngagement(instructorId),
      courseRatings: await fetchCourseRatings(instructorId),
    };
  },
};
```

## Custom Reporting

### 1. Learning Analytics API

```typescript
// api/analyticsAPI.ts
export class AnalyticsAPI {
  private baseURL = '/api/analytics';

  async getLearningMetrics(params: {
    startDate: string;
    endDate: string;
    courseId?: string;
    userId?: string;
  }) {
    const response = await fetch(`${this.baseURL}/learning-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    return response.json();
  }

  async getUserJourney(userId: string) {
    return fetch(`${this.baseURL}/user-journey/${userId}`)
      .then(res => res.json());
  }

  async getContentPerformance(contentType: 'course' | 'lesson' | 'quiz') {
    return fetch(`${this.baseURL}/content-performance?type=${contentType}`)
      .then(res => res.json());
  }
}
```

### 2. Real-time Analytics

```typescript
// utils/realtimeAnalytics.ts
export const RealtimeAnalytics = {
  setupRealtimeTracking: () => {
    // Track real-time user activity
    let activityTimer: NodeJS.Timeout;
    
    const trackActivity = () => {
      Analytics.trackCustomEvent('user_activity', {
        timestamp: Date.now(),
        page: window.location.pathname,
      });
    };

    // Track every 30 seconds of activity
    const resetTimer = () => {
      clearTimeout(activityTimer);
      activityTimer = setTimeout(trackActivity, 30000);
    };

    // Reset timer on user interaction
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();
  },

  trackLiveSession: (sessionId: string) => {
    const startTime = Date.now();
    
    // Track session end
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - startTime;
      
      Analytics.trackCustomEvent('session_end', {
        session_id: sessionId,
        duration_ms: sessionDuration,
      });
    });
  },
};
```

## Implementation Checklist

### Phase 1: Basic Setup
- [ ] Install and configure Google Analytics 4
- [ ] Set up basic page view tracking
- [ ] Implement consent management
- [ ] Add error tracking

### Phase 2: Learning Analytics
- [ ] Implement course event tracking
- [ ] Add progress tracking
- [ ] Set up quiz analytics
- [ ] Track resource usage

### Phase 3: Advanced Analytics
- [ ] Implement funnel analysis
- [ ] Add cohort tracking
- [ ] Set up custom dashboards
- [ ] Configure automated reports

### Phase 4: Performance & Privacy
- [ ] Add performance monitoring
- [ ] Implement data anonymization
- [ ] Set up GDPR compliance
- [ ] Create data retention policies

## Troubleshooting

### Common Issues

1. **Events not appearing in GA4**
   - Check if tracking ID is correct
   - Verify gtag is loaded
   - Check browser console for errors

2. **Duplicate page views**
   - Ensure single Analytics.init() call
   - Check router integration

3. **Missing user data**
   - Verify consent management
   - Check privacy settings

4. **Performance impact**
   - Use event batching
   - Implement sampling for high-volume events

### Debug Mode

```typescript
// Enable debug mode
window.gtag('config', GA_TRACKING_ID, {
  debug_mode: true,
});

// Log events to console
const originalTrackEvent = Analytics.trackEvent;
Analytics.trackEvent = (event) => {
  console.log('Analytics Event:', event);
  originalTrackEvent(event);
};
```

## Best Practices

1. **Event Design**
   - Use consistent naming conventions
   - Include relevant context
   - Avoid sending PII

2. **Performance**
   - Batch events when possible
   - Use sampling for high-volume events
   - Implement lazy loading

3. **Privacy**
   - Always request consent
   - Anonymize sensitive data
   - Provide opt-out options

4. **Testing**
   - Use debug mode in development
   - Test with browser extensions disabled
   - Verify cross-browser compatibility

5. **Maintenance**
   - Regular data quality checks
   - Update tracking as features change
   - Monitor for tracking errors

This analytics setup provides comprehensive tracking for learning platform metrics while maintaining user privacy and performance standards.
