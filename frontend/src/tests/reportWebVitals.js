/**
 * Reports web vitals performance metrics to a provided callback function.
 *
 * If a valid callback function (`onPerfEntry`) is provided, this function dynamically imports
 * the 'web-vitals' library and retrieves several key performance metrics:
 * - Cumulative Layout Shift (CLS)
 * - First Input Delay (FID)
 * - First Contentful Paint (FCP)
 * - Largest Contentful Paint (LCP)
 * - Time to First Byte (TTFB)
 *
 * Each metric is then passed to the provided callback function for further processing or logging.
 *
 * @param {Function} onPerfEntry - A callback function that receives the performance metrics.
 */
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(
      ({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      }
    );
  }
};

export default reportWebVitals;
