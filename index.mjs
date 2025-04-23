// index.mjs
import https from 'https';

export const handler = awslambda.streamifyResponse(async (event, responseStream, context) => {
  try {
    const presignedUrl = event.queryStringParameters?.url;
    if (!presignedUrl) {
      responseStream.writeHead(400, { 'Content-Type': 'text/plain' });
      responseStream.end('Missing "url" query parameter');
      return;
    }

    https.get(presignedUrl, (s3Res) => {
      if (s3Res.statusCode !== 200) {
        responseStream.writeHead(s3Res.statusCode, s3Res.headers);
        s3Res.pipe(responseStream);
        return;
      }

      responseStream.writeHead(200, {
        'Content-Type': s3Res.headers['content-type'] || 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="downloaded-file"',
      });

      s3Res.pipe(responseStream);
    }).on('error', (err) => {
      responseStream.writeHead(500, { 'Content-Type': 'text/plain' });
      responseStream.end('Error fetching from S3: ' + err.message);
    });
  } catch (err) {
    responseStream.writeHead(500, { 'Content-Type': 'text/plain' });
    responseStream.end('Internal server error: ' + err.message);
  }
});
