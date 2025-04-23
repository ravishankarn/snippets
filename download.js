// download.js
import https from 'https';
import fs from 'fs';

const apiGatewayUrl = 'https://<your-api-id>.execute-api.<region>.amazonaws.com/stream-file';
const presignedUrl = encodeURIComponent('https://your-s3-presigned-url');

const requestUrl = `${apiGatewayUrl}?url=${presignedUrl}`;
const file = fs.createWriteStream('output-file');

https.get(requestUrl, (res) => {
  console.log(`Status: ${res.statusCode}`);
  if (res.statusCode !== 200) {
    res.setEncoding('utf8');
    res.on('data', chunk => console.error(chunk));
    return;
  }

  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download completed');
  });
}).on('error', (err) => {
  console.error('Download error:', err.message);
});
