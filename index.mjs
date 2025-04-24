// === Lambda Function Code (Node.js 20+) ===
// File: index.mjs
import https from 'https';

// Presigned URL for local testing
const PRESIGNED_URL = 'https://your-bucket.s3.amazonaws.com/your-large-file.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...';

// --- Option 1: Using setHeader ---
export const handlerSetHeader = awslambda.streamifyResponse(
  async (event, responseStream, context) => {
    console.log("[SetHeader] Event received", event);
    const url = event.queryStringParameters?.url || PRESIGNED_URL;

    if (!url) {
      console.log("[SetHeader] Missing URL param");
      responseStream.setHeader?.('Content-Type', 'text/plain');
      responseStream.end('Missing "url" query parameter');
      return;
    }

    const fileName = url.split('/').pop().split('?')[0] || 'download.bin';
    console.log("[SetHeader] Streaming file:", fileName);
    responseStream.setHeader?.('Content-Type', 'application/octet-stream');
    responseStream.setHeader?.('Content-Disposition', `attachment; filename="${fileName}"`);

    https.get(url, (s3Res) => {
      s3Res.pipe(responseStream);
      s3Res.on('end', () => console.log('[SetHeader] Stream ended'));
      s3Res.on('error', (err) => {
        console.error('[SetHeader] Stream error:', err);
        responseStream.end();
      });
    }).on('error', (err) => {
      console.error('[SetHeader] Request error:', err);
      responseStream.end();
    });
  }
);

// --- Option 2: Using writeHead ---
export const handlerWriteHead = awslambda.streamifyResponse(
  async (event, responseStream, context) => {
    console.log("[WriteHead] Event received", event);
    const url = event.queryStringParameters?.url || PRESIGNED_URL;

    if (!url) {
      console.log("[WriteHead] Missing URL param");
      responseStream.writeHead?.(400, { 'Content-Type': 'text/plain' });
      responseStream.end('Missing "url" query parameter');
      return;
    }

    const fileName = url.split('/').pop().split('?')[0] || 'download.bin';
    console.log("[WriteHead] Streaming file:", fileName);
    responseStream.writeHead?.(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    https.get(url, (s3Res) => {
      s3Res.pipe(responseStream);
      s3Res.on('end', () => console.log('[WriteHead] Stream ended'));
      s3Res.on('error', (err) => {
        console.error('[WriteHead] Stream error:', err);
        responseStream.end();
      });
    }).on('error', (err) => {
      console.error('[WriteHead] Request error:', err);
      responseStream.end();
    });
  }
);

// --- Option 3: Using write ---
export const handlerWrite = awslambda.streamifyResponse(
  async (event, responseStream, context) => {
    console.log("[Write] Event received", event);
    const url = event.queryStringParameters?.url || PRESIGNED_URL;

    if (!url) {
      console.log("[Write] Missing URL param");
      responseStream.write('Missing "url" query parameter');
      responseStream.end();
      return;
    }

    const fileName = url.split('/').pop().split('?')[0] || 'download.bin';
    console.log("[Write] Starting stream for:", fileName);

    https.get(url, (s3Res) => {
      responseStream.write(`Downloading file: ${fileName}\n`);
      s3Res.pipe(responseStream);
      s3Res.on('end', () => console.log('[Write] Stream ended'));
      s3Res.on('error', (err) => {
        console.error('[Write] Stream error:', err);
        responseStream.end();
      });
    }).on('error', (err) => {
      console.error('[Write] Request error:', err);
      responseStream.end();
    });
  }
);

// --- Option 4: Using return only ---
export const handlerReturn = awslambda.streamifyResponse(
  async (event, responseStream, context) => {
    console.log("[ReturnOnly] Event received", event);
    const url = event.queryStringParameters?.url || PRESIGNED_URL;

    if (!url) {
      console.log("[ReturnOnly] Missing URL param");
      return responseStream.end('Missing "url" query parameter');
    }

    const fileName = url.split('/').pop().split('?')[0] || 'download.bin';
    console.log("[ReturnOnly] Streaming file:", fileName);

    https.get(url, (s3Res) => {
      responseStream.writeHead?.(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });
      s3Res.pipe(responseStream);
      s3Res.on('end', () => console.log('[ReturnOnly] Stream ended'));
      s3Res.on('error', (err) => {
        console.error('[ReturnOnly] Stream error:', err);
        responseStream.end();
      });
    }).on('error', (err) => {
      console.error('[ReturnOnly] Request error:', err);
      responseStream.end();
    });
  }
);

// --- Option 5: Using returned response body stream ---
export const handlerReturnBody = awslambda.streamifyResponse(
  async (event, responseStream, context) => {
    console.log("[ReturnBody] Event received", event);
    const url = event.queryStringParameters?.url || PRESIGNED_URL;

    if (!url) {
      console.log("[ReturnBody] Missing URL param");
      responseStream.writeHead?.(400, { 'Content-Type': 'text/plain' });
      responseStream.end('Missing "url" query parameter');
      return;
    }

    const fileName = url.split('/').pop().split('?')[0] || 'download.bin';
    console.log("[ReturnBody] Preparing to stream file:", fileName);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
      body: async (stream) => {
        return new Promise((resolve, reject) => {
          https.get(url, (s3Res) => {
            s3Res.pipe(stream);
            s3Res.on('end', () => {
              console.log('[ReturnBody] Stream ended');
              resolve();
            });
            s3Res.on('error', (err) => {
              console.error('[ReturnBody] Stream error:', err);
              reject(err);
            });
          }).on('error', (err) => {
            console.error('[ReturnBody] Request error:', err);
            reject(err);
          });
        });
      },
    };
  }
);

// You can configure API Gateway to route to one of the five handler variants above.
