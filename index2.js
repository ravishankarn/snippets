import https from 'https';

export const handler = awslambda.streamifyResponse(
  async (event, responseStream, context) => {
    const url = event.queryStringParameters?.url;

    if (!url) {
      responseStream.writeHead?.(400, { 'Content-Type': 'text/plain' });
      responseStream.end('Missing "url" query parameter');
      return;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${url.split('/').pop().split('?')[0] || 'file'}"`,
      },
      body: async (stream) => {
        return new Promise((resolve, reject) => {
          https.get(url, (s3Res) => {
            s3Res.pipe(stream);
            s3Res.on('end', resolve);
            s3Res.on('error', reject);
          }).on('error', reject);
        });
      }
    };
  }
);
