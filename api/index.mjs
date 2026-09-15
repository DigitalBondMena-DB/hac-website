export default async function handler(req, res) {
  try {
    // Dynamically import the Angular SSR server build
    const serverModule = await import('../dist/HAC-ECO/server/server.mjs');
    
    // Check if the default export is a function (the Express request handler)
    if (typeof serverModule.default === 'function') {
      return serverModule.default(req, res);
    } else if (serverModule.reqHandler) {
      // Fallback if reqHandler is exported
      return serverModule.reqHandler(req, res);
    } else {
      res.status(500).send('Server module does not export a valid request handler.');
    }
  } catch (error) {
    console.error('Failed to load Angular SSR server:', error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
}
