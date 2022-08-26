const https = require('node:https');

module.exports = (url, options) =>
  new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk.toString();
      });
      res.on('error', (err) => {
        reject(err);
      });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTPS ${res.statusCode}: ${rawData}`));
          return;
        }
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (err) {
          reject(err);
        }
      });
    });

    if (options.method === 'POST' && options.body) {
      req.write(options.body);
    }

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
