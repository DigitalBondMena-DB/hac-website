import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getContext } from '@netlify/angular-runtime/context';

const angularAppEngine = new AngularAppEngine();

/**
 * Netlify App Engine Handler for Angular SSR
 */
export async function netlifyAppEngineHandler(
  request: Request
): Promise<Response> {
  const context = getContext();

  const result = await angularAppEngine.handle(request, context);
  return result || new Response('Not found', { status: 404 });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build) and Netlify Runtime.
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);

/*
================================================================================
🏛️ OLD SERVER IMPLEMENTATION & CUSTOM REDIRECTS (PRESERVED / COMMENTED OUT)
================================================================================

// console.log('Server executing from:', process.cwd());
// console.log('Server dist folder path:', serverDistFolder);
// console.log('Browser dist folder path:', browserDistFolder);

// // API test
// app.get('/api/test', (req, res) => {
//   res.json({
//     message: 'Server is running',
//     serverPath: serverDistFolder,
//     browserPath: browserDistFolder,
//     currentDir: process.cwd(),
//     environment: process.env['NODE_ENV'],
//   });
// });

// // Logs all requests
// app.use((req, res, next) => {
//   console.log(`Request received: ${req.method} ${req.path}`);
//   next();
// });

// // 🔥 INVALID URL REDIRECTS - MUST BE BEFORE STATIC FILES AND SSR
// // Handle specific invalid patterns that are being indexed

// // 1. Handle the exact pattern you mentioned
// app.get('/projects-details/services-details/:id', (req, res) => {
//   console.log(
//     `🔄 Redirecting invalid pattern: ${req.originalUrl} → /ar/services-details/${req.params.id}`
//   );
//   res.redirect(301, `/ar/services-details/${req.params.id}`);
// });

// // 2. Handle projects-details without language prefix
// app.get('/projects-details/:id', (req, res) => {
//   console.log(
//     `🔄 Redirecting missing language: ${req.originalUrl} → /ar/projects-details/${req.params.id}`
//   );
//   res.redirect(301, `/ar/projects-details/${req.params.id}`);
// });

// // 3. Handle services-details without language prefix
// app.get('/services-details/:id', (req, res) => {
//   console.log(
//     `🔄 Redirecting missing language: ${req.originalUrl} → /ar/services-details/${req.params.id}`
//   );
//   res.redirect(301, `/ar/services-details/${req.params.id}`);
// });

// // 4. Handle blogs without language prefix
// app.get('/blogs/:id', (req, res) => {
//   console.log(
//     `🔄 Redirecting missing language: ${req.originalUrl} → /ar/blogs/${req.params.id}`
//   );
//   res.redirect(301, `/ar/blogs/${req.params.id}`);
// });

// // 5. Handle any assets requests (since you don't have assets folder)
// app.get('/assets/*', (req, res) => {
//   console.log(
//     `🔄 Redirecting invalid assets request: ${req.originalUrl} → /ar`
//   );
//   res.redirect(301, '/ar');
// });

// // 6. Handle specific invalid URLs mentioned in examples
// app.get('/about-us/contact-us', (req, res) => {
//   console.log(
//     `🔄 Redirecting specific invalid URL: ${req.originalUrl} → /ar/contact-us`
//   );
//   res.redirect(301, '/ar/contact-us');
// });

// app.get('/about-us/blogs/*', (req, res) => {
//   const blogPath = req.path.replace('/about-us/blogs/', '');
//   console.log(
//     `🔄 Redirecting invalid blog URL: ${req.originalUrl} → /ar/blogs/${blogPath}`
//   );
//   res.redirect(301, `/ar/blogs/${blogPath}`);
// });

// // 7. Handle invalid URLs based on public folder structure
// // These are URLs that Google is indexing based on folder names in /public
// app.get('*', (req, res, next) => {
//   const path = req.path;

//   const invalidPatterns = [
//     '/about-us-page',
//     '/about-us',
//     '/contact_us_page',
//     '/contact-us',
//     '/contactus',
//     '/projects-page',
//     '/services-page',
//     '/details',
//     '/DownloadSection',
//     '/footer',
//     '/hero',
//     '/my-fav.ico',
//     '/national-day-img',
//     '/not-found',
//     '/see_more',
//     '/social_media_icons',
//     '/svgs',
//     '/fonts',
//     '/images',
//   ];

//   const isInvalidPattern = invalidPatterns.some((pattern) => {
//     return path.startsWith(pattern) || path === pattern;
//   });

//   const startsWithValidLang = path.startsWith('/ar') || path.startsWith('/en');
//   const isStaticFile = /\.[a-zA-Z0-9]+$/.test(path);
//   const isApiRoute = path.startsWith('/api');

//   if (
//     isInvalidPattern &&
//     !startsWithValidLang &&
//     !isStaticFile &&
//     !isApiRoute
//   ) {
//     console.log(
//       `🔄 Redirecting invalid public folder pattern: ${req.originalUrl} → /ar`
//     );
//     res.redirect(301, '/ar');
//     return;
//   }

//   next();
// });

// app.get(/^\/([^\/]+)\/(.*)$/, (req, res, next) => {
//   const firstSegment = req.params[0];
//   const restOfPath = req.params[1];

//   if (!['ar', 'en'].includes(firstSegment)) {
//     if (['services-page', 'projects-page', 'assets'].includes(firstSegment)) {
//       console.log(
//         `🔄 Redirecting invalid language pattern: ${req.originalUrl} → /ar/${restOfPath}`
//       );
//       res.redirect(301, `/ar/${restOfPath}`);
//       return;
//     }
//   }

//   next();
// });

// app.use((req, res, next) => {
//   const isStaticFile = /\.[a-zA-Z0-9]+$/.test(req.path);
//   if (isStaticFile) {
//     console.log(`❌ Static file not found: ${req.path}`);
//     return res.status(404).send('Not found');
//   } else {
//     next();
//     return false;
//   }
// });

// // Last fallback
// app.use((req, res) => {
//   console.log(`❌ No route matched for: ${req.originalUrl}`);
//   res.status(404).send(`Not found: ${req.originalUrl}`);
// });
================================================================================
*/
