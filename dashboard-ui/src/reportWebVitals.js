/**
 * @fileoverview Web Vitals reporting utility for performance monitoring.
 * 
 * Provides functionality to measure and report Core Web Vitals metrics including
 * Cumulative Layout Shift (CLS), First Input Delay (FID), First Contentful Paint (FCP),
 * Largest Contentful Paint (LCP), and Time to First Byte (TTFB). Used for monitoring
 * application performance and user experience metrics.
 */

const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
