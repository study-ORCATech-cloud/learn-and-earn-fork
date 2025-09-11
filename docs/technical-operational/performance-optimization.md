
# Performance Optimization Guide

This guide covers best practices for maintaining optimal performance in the LabDojo Learning Platform, including optimization strategies, monitoring techniques, and troubleshooting performance issues.

## Table of Contents

1. [Overview](#overview)
2. [Bundle Optimization](#bundle-optimization)
3. [Component Performance](#component-performance)
4. [Image and Asset Optimization](#image-and-asset-optimization)
5. [Memory Management](#memory-management)
6. [Loading Strategies](#loading-strategies)
7. [Caching Strategies](#caching-strategies)
8. [Performance Monitoring](#performance-monitoring)
9. [Build Optimization](#build-optimization)
10. [Runtime Performance](#runtime-performance)
11. [Mobile Performance](#mobile-performance)
12. [SEO Performance](#seo-performance)
13. [Common Performance Issues](#common-performance-issues)
14. [Performance Testing](#performance-testing)
15. [Troubleshooting](#troubleshooting)

## Overview

The LabDojo Learning Platform is designed with performance in mind, utilizing modern React patterns, Vite's optimizations, and efficient bundling strategies. This guide helps maintain and improve performance across all aspects of the application.

### Performance Goals

- **First Contentful Paint (FCP)**: < 1.5 seconds
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Bundle Size**: < 500KB gzipped
- **Time to Interactive (TTI)**: < 3 seconds

## Bundle Optimization

### Code Splitting

Implement route-based code splitting to reduce initial bundle size:

```typescript
// Lazy load pages
const CoursePage = lazy(() => import('./pages/CoursePage'));
const LearningPathPage = lazy(() => import('./pages/LearningPathPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/course/:id" element={<CoursePage />} />
    <Route path="/learning-path/:id" element={<LearningPathPage />} />
    <Route path="/projects" element={<ProjectsPage />} />
  </Routes>
</Suspense>
```

### Dynamic Imports

Load heavy components only when needed:

```typescript
// Dynamic component loading
const HeavyChart = lazy(() => 
  import('./components/HeavyChart').then(module => ({
    default: module.HeavyChart
  }))
);

// Conditional loading
const loadAnalytics = () => {
  if (process.env.NODE_ENV === 'production') {
    return import('./utils/analytics');
  }
  return Promise.resolve({ track: () => {} });
};
```

### Bundle Analysis

Monitor bundle size and composition:

```bash
# Analyze bundle size
npm run build
npm run preview

# Use webpack-bundle-analyzer for detailed analysis
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets/*.js
```

### Tree Shaking

Ensure proper tree shaking for external libraries:

```typescript
// Good: Import only what you need
import { format } from 'date-fns';
import { debounce } from 'lodash-es';

// Bad: Imports entire library
import * as dateFns from 'date-fns';
import _ from 'lodash';
```

## Component Performance

### React.memo

Memoize components that receive stable props:

```typescript
// Memoize expensive components
const CourseCard = React.memo(({ course }: { course: Course }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
      </CardHeader>
    </Card>
  );
});

// Custom comparison function for complex props
const ProjectCard = React.memo(({ project, filters }: ProjectCardProps) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.project.id === nextProps.project.id &&
         JSON.stringify(prevProps.filters) === JSON.stringify(nextProps.filters);
});
```

### useMemo and useCallback

Optimize expensive calculations and function references:

```typescript
const SearchResults = ({ courses, searchTerm, filters }: SearchResultsProps) => {
  // Memoize expensive filtering operation
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilters = filters.difficulty === 'all' || course.difficulty === filters.difficulty;
      return matchesSearch && matchesFilters;
    });
  }, [courses, searchTerm, filters]);

  // Memoize callback to prevent child re-renders
  const handleCourseSelect = useCallback((courseId: string) => {
    navigate(`/course/${courseId}`);
  }, [navigate]);

  return (
    <div>
      {filteredCourses.map(course => (
        <CourseCard 
          key={course.id} 
          course={course} 
          onSelect={handleCourseSelect}
        />
      ))}
    </div>
  );
};
```

### Virtual Scrolling

For large lists, implement virtual scrolling:

```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedCourseList = ({ courses }: { courses: Course[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <CourseCard course={courses[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={courses.length}
      itemSize={200}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### Debouncing User Input

Prevent excessive API calls or computations:

```typescript
import { debounce } from 'lodash-es';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { setGlobalSearchTerm } = useSearch();

  // Debounce search input
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setGlobalSearchTerm(term);
    }, 300),
    [setGlobalSearchTerm]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Filter courses..."
    />
  );
};
```

## Image and Asset Optimization

### Image Optimization

Optimize images for web delivery:

```typescript
// Use responsive images
const OptimizedImage = ({ src, alt, className }: ImageProps) => (
  <picture>
    <source 
      media="(min-width: 768px)" 
      srcSet={`${src}?w=800&format=webp 800w, ${src}?w=1200&format=webp 1200w`}
      type="image/webp"
    />
    <source 
      media="(min-width: 768px)" 
      srcSet={`${src}?w=800 800w, ${src}?w=1200 1200w`}
    />
    <img 
      src={`${src}?w=400&format=webp`}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  </picture>
);
```

### Asset Preloading

Preload critical assets:

```typescript
// Preload critical fonts and images
useEffect(() => {
  const preloadAssets = [
    { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
    { href: '/images/hero-bg.webp', as: 'image' }
  ];

  preloadAssets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = asset.href;
    link.as = asset.as;
    if (asset.type) link.type = asset.type;
    document.head.appendChild(link);
  });
}, []);
```

### SVG Optimization

Optimize SVG icons and graphics:

```typescript
// Use icon components instead of inline SVGs
import { BookOpen, Users, Award } from 'lucide-react';

// Inline critical SVGs, external for others
const Logo = () => (
  <svg width="120" height="40" viewBox="0 0 120 40">
    {/* Optimized SVG content */}
  </svg>
);
```

## Memory Management

### Cleanup Side Effects

Prevent memory leaks with proper cleanup:

```typescript
const DataFetcher = () => {
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data', {
          signal: controller.signal
        });
        // Handle response
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      controller.abort();
    };
  }, []);

  return <div>Content</div>;
};
```

### Event Listener Cleanup

Remove event listeners to prevent memory leaks:

```typescript
const ScrollHandler = () => {
  useEffect(() => {
    const handleScroll = () => {
      // Handle scroll
    };

    const throttledScroll = throttle(handleScroll, 100);
    
    window.addEventListener('scroll', throttledScroll);
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      throttledScroll.cancel?.();
    };
  }, []);

  return null;
};
```

### Intersection Observer Cleanup

Properly manage Intersection Observers:

```typescript
const LazyLoader = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? children : <div>Loading...</div>}
    </div>
  );
};
```

## Loading Strategies

### Progressive Loading

Load content progressively for better perceived performance:

```typescript
const CoursePage = ({ courseId }: { courseId: string }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load course data first (critical)
    loadCourse(courseId).then(setCourse);
    
    // Load additional data after initial render
    setTimeout(() => {
      loadResources(courseId).then(setResources);
      loadProjects(courseId).then(setProjects);
    }, 100);
  }, [courseId]);

  return (
    <div>
      {course ? <CourseHeader course={course} /> : <Skeleton />}
      {resources.length > 0 ? <ResourcesList resources={resources} /> : <Skeleton />}
      {projects.length > 0 ? <ProjectsList projects={projects} /> : <Skeleton />}
    </div>
  );
};
```

### Skeleton Loading

Implement skeleton screens for better UX:

```typescript
const CourseSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-300 rounded mb-4 w-3/4"></div>
    <div className="h-4 bg-gray-300 rounded mb-2 w-full"></div>
    <div className="h-4 bg-gray-300 rounded mb-2 w-5/6"></div>
    <div className="h-4 bg-gray-300 rounded w-4/6"></div>
  </div>
);
```

### Prefetching

Prefetch likely-needed resources:

```typescript
const usePrefetch = () => {
  const prefetchCourse = useCallback((courseId: string) => {
    // Prefetch course data
    queryClient.prefetchQuery({
      queryKey: ['course', courseId],
      queryFn: () => fetchCourse(courseId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, []);

  return { prefetchCourse };
};
```

## Caching Strategies

### Browser Caching

Configure proper caching headers:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
});
```

### Service Worker Caching

Implement service worker for offline support:

```javascript
// sw.js
const CACHE_NAME = 'labdojo-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
```

### Application-Level Caching

Cache computed results and API responses:

```typescript
const useCachedSearch = (searchTerm: string, filters: SearchFilters) => {
  const cacheKey = `${searchTerm}-${JSON.stringify(filters)}`;
  
  return useQuery({
    queryKey: ['search', cacheKey],
    queryFn: () => performSearch(searchTerm, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

## Performance Monitoring

### Core Web Vitals

Monitor performance metrics:

```typescript
const PerformanceMonitor = () => {
  useEffect(() => {
    // Monitor Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FID:', entry.processingStart - entry.startTime);
      }
    });

    fidObserver.observe({ entryTypes: ['first-input'] });

    return () => {
      observer.disconnect();
      fidObserver.disconnect();
    };
  }, []);

  return null;
};
```

### React DevTools Profiler

Use React DevTools for component performance analysis:

```typescript
// Wrap components with Profiler in development
const ProfiledComponent = ({ children }: { children: React.ReactNode }) => {
  const onRenderCallback = (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Profile:', { id, phase, actualDuration });
    }
  };

  return (
    <Profiler id="app" onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
};
```

### Performance Metrics Collection

Collect and analyze performance data:

```typescript
const usePerformanceMetrics = () => {
  useEffect(() => {
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ssl: navigation.connectEnd - navigation.secureConnectionStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        domLoad: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        windowLoad: navigation.loadEventEnd - navigation.navigationStart,
      };

      console.log('Performance Metrics:', metrics);
    };

    window.addEventListener('load', collectMetrics);
    return () => window.removeEventListener('load', collectMetrics);
  }, []);
};
```

## Build Optimization

### Vite Configuration

Optimize Vite build settings:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
```

### Environment-Specific Optimizations

Configure different optimizations for different environments:

```typescript
// Environment-specific configurations
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  define: {
    __DEV__: isDev,
    __PROD__: isProd,
  },
  build: {
    sourcemap: isDev,
    minify: isProd ? 'terser' : false,
  },
});
```

### CSS Optimization

Optimize CSS delivery and size:

```css
/* Critical CSS inline in HTML */
/* Non-critical CSS loaded asynchronously */

/* Use CSS containment for better performance */
.course-card {
  contain: layout style;
}

/* Optimize animations for performance */
.fade-in {
  will-change: opacity, transform;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Runtime Performance

### Minimize Re-renders

Reduce unnecessary component re-renders:

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }: { data: any[] }) => {
  return (
    <div>
      {data.map(item => <ComplexItem key={item.id} item={item} />)}
    </div>
  );
});

// Split state to minimize re-render scope
const useOptimizedState = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  
  // Separate contexts for different concerns
  return { searchTerm, setSearchTerm, filters, setFilters };
};
```

### Efficient Event Handling

Optimize event handlers:

```typescript
const OptimizedList = ({ items }: { items: Item[] }) => {
  // Use event delegation instead of individual handlers
  const handleClick = useCallback((event: React.MouseEvent) => {
    const itemId = event.currentTarget.getAttribute('data-item-id');
    if (itemId) {
      handleItemClick(itemId);
    }
  }, []);

  return (
    <div onClick={handleClick}>
      {items.map(item => (
        <div key={item.id} data-item-id={item.id}>
          {item.title}
        </div>
      ))}
    </div>
  );
};
```

### Background Processing

Move heavy computations to web workers:

```typescript
// worker.ts
self.onmessage = function(e) {
  const { data, action } = e.data;
  
  switch (action) {
    case 'FILTER_COURSES':
      const filtered = heavyFilterOperation(data);
      self.postMessage({ result: filtered });
      break;
  }
};

// Component
const useWebWorker = () => {
  const workerRef = useRef<Worker>();

  useEffect(() => {
    workerRef.current = new Worker('/worker.js');
    return () => workerRef.current?.terminate();
  }, []);

  const processData = useCallback((data: any[]) => {
    return new Promise((resolve) => {
      workerRef.current!.onmessage = (e) => {
        resolve(e.data.result);
      };
      workerRef.current!.postMessage({ data, action: 'FILTER_COURSES' });
    });
  }, []);

  return { processData };
};
```

## Mobile Performance

### Touch Optimization

Optimize for mobile interactions:

```css
/* Improve touch responsiveness */
.interactive-element {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Optimize scrolling */
.scrollable-container {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
```

### Responsive Images

Implement responsive image loading:

```typescript
const ResponsiveImage = ({ src, alt }: { src: string; alt: string }) => {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const img = new Image();
    const isMobile = window.innerWidth < 768;
    
    img.src = isMobile 
      ? `${src}?w=400&format=webp`
      : `${src}?w=800&format=webp`;
    
    img.onload = () => setImageSrc(img.src);
  }, [src]);

  return imageSrc ? (
    <img src={imageSrc} alt={alt} loading="lazy" />
  ) : (
    <div className="w-full h-48 bg-gray-200 animate-pulse" />
  );
};
```

### Battery and Network Optimization

Adapt behavior based on device capabilities:

```typescript
const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    effectiveType: (navigator as any)?.connection?.effectiveType || '4g',
  });

  useEffect(() => {
    const updateStatus = () => {
      setNetworkStatus({
        isOnline: navigator.onLine,
        effectiveType: (navigator as any)?.connection?.effectiveType || '4g',
      });
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    (navigator as any)?.connection?.addEventListener('change', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return networkStatus;
};
```

## SEO Performance

### Meta Tag Optimization

Optimize meta tags for performance and SEO:

```typescript
const SEOHead = ({ title, description, keywords }: SEOProps) => (
  <Helmet>
    <title>{title} | LabDojo Learning Platform</title>
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    
    {/* Performance-related meta tags */}
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    
    {/* Preconnect to external domains */}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    
    {/* Resource hints for better performance */}
    <link rel="dns-prefetch" href="//fonts.googleapis.com" />
  </Helmet>
);
```

### Structured Data

Implement structured data for better SEO:

```typescript
const CourseStructuredData = ({ course }: { course: Course }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "LabDojo Learning Platform"
    },
    "educationalLevel": course.difficulty,
    "timeRequired": course.duration,
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
```

## Common Performance Issues

### Issue: Large Bundle Size

**Symptoms:**
- Slow initial page load
- High memory usage
- Long Time to Interactive (TTI)

**Solutions:**
1. Implement code splitting
2. Use dynamic imports
3. Analyze and remove unused dependencies
4. Optimize vendor chunks

### Issue: Memory Leaks

**Symptoms:**
- Application becomes slow over time
- Browser memory usage continuously increases
- Page becomes unresponsive

**Solutions:**
1. Clean up event listeners
2. Cancel ongoing requests
3. Clear timers and intervals
4. Disconnect observers

### Issue: Render Performance

**Symptoms:**
- Janky animations
- Slow scrolling
- Delayed user interactions

**Solutions:**
1. Use React.memo and useMemo
2. Optimize component re-renders
3. Implement virtual scrolling
4. Use CSS containment

### Issue: Image Loading

**Symptoms:**
- Slow page rendering
- Large payload sizes
- Poor mobile performance

**Solutions:**
1. Implement lazy loading
2. Use responsive images
3. Optimize image formats (WebP)
4. Implement progressive loading

## Performance Testing

### Lighthouse Audits

Regular Lighthouse audits for performance monitoring:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-site.com --output=json --output-path=./lighthouse-report.json

# Generate HTML report
lighthouse https://your-site.com --output=html --output-path=./lighthouse-report.html
```

### Performance Budgets

Set performance budgets and monitor them:

```json
{
  "budgets": [
    {
      "path": "/*",
      "timings": [
        {
          "metric": "first-contentful-paint",
          "budget": 2000
        },
        {
          "metric": "largest-contentful-paint",
          "budget": 2500
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 400
        },
        {
          "resourceType": "total",
          "budget": 500
        }
      ]
    }
  ]
}
```

### Automated Performance Testing

Set up automated performance testing:

```javascript
// performance.test.js
const puppeteer = require('puppeteer');

describe('Performance Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should load homepage within performance budget', async () => {
    const response = await page.goto('http://localhost:3000');
    
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: perfData.loadEventEnd - perfData.navigationStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      };
    });

    expect(performanceMetrics.loadTime).toBeLessThan(3000);
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);
  });
});
```

## Troubleshooting

### Performance Debugging Tools

1. **React DevTools Profiler**: Identify slow components
2. **Chrome DevTools Performance Tab**: Analyze runtime performance
3. **Network Tab**: Monitor resource loading
4. **Memory Tab**: Detect memory leaks
5. **Lighthouse**: Comprehensive performance audits

### Common Debugging Steps

1. **Identify the Bottleneck**:
   - Use performance profiling tools
   - Measure specific metrics
   - Isolate problem areas

2. **Analyze Bundle Size**:
   - Check for large dependencies
   - Identify unused code
   - Optimize imports

3. **Monitor Runtime Performance**:
   - Profile component renders
   - Check for memory leaks
   - Analyze event handlers

4. **Test on Different Devices**:
   - Mobile vs desktop performance
   - Different network conditions
   - Various browser versions

### Performance Checklist

Before deploying:

- [ ] Bundle size under 500KB gzipped
- [ ] All images optimized and lazy loaded
- [ ] Critical CSS inlined
- [ ] Service worker configured
- [ ] Performance metrics monitored
- [ ] Lighthouse score > 90
- [ ] Mobile performance tested
- [ ] Memory leaks checked
- [ ] Error boundaries implemented
- [ ] Loading states implemented

## Conclusion

Performance optimization is an ongoing process that requires continuous monitoring and improvement. By following these best practices and regularly auditing your application's performance, you can ensure that the LabDojo Learning Platform provides an excellent user experience across all devices and network conditions.

### Key Takeaways

1. **Measure First**: Always measure before optimizing
2. **Start with the Biggest Impact**: Focus on critical rendering path
3. **Monitor Continuously**: Set up automated performance monitoring
4. **Test on Real Devices**: Performance varies across devices and networks
5. **Prioritize User Experience**: Optimize for perceived performance

Remember that premature optimization can be counterproductive. Focus on measuring real user impact and addressing the most significant performance bottlenecks first.

For additional help with performance issues, consider consulting with the development team or reviewing the latest performance best practices in the React and Vite documentation.
