import fs from 'fs';
import path from 'path';

export default function localUploadPlugin() {
  return {
    name: 'vite-plugin-local-upload',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/upload' && req.method === 'POST') {
          // Parse JSON body
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const { category, files } = data;
              
              if (!category || !files || !Array.isArray(files)) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Missing category or files' }));
              }

              // Sanitize category to prevent path traversal
              const safeCategory = category.replace(/[^a-zA-Z0-9 \-_]/g, '').trim() || 'Uncategorized';
              
              const baseAlbumDir = path.resolve(process.cwd(), 'public', 'album', safeCategory);
              
              // Create directory if it doesn't exist
              if (!fs.existsSync(baseAlbumDir)) {
                fs.mkdirSync(baseAlbumDir, { recursive: true });
              }

              const savedUrls = [];

              for (const file of files) {
                const { name, base64 } = file;
                const safeName = Date.now() + '_' + name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                
                // Extract base64 data
                const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (!matches || matches.length !== 3) {
                  continue; // Skip invalid base64
                }
                
                const buffer = Buffer.from(matches[2], 'base64');
                const filePath = path.join(baseAlbumDir, safeName);
                
                // Write file to disk
                fs.writeFileSync(filePath, buffer);
                
                // Add public URL to array (vite serves public folder directly from root)
                savedUrls.push(`/album/${safeCategory}/${safeName}`);
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ urls: savedUrls }));
              
            } catch (err) {
              console.error('[local-upload-plugin] Error:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}
