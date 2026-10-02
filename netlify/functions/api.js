const serverless = require('serverless-http');
const app = require('../../backend/app');

module.exports.handler = serverless(app, {
  request(request, event) {
    if (event.body) {
      if (event.isBase64Encoded) {
        request.body = Buffer.from(event.body, 'base64').toString('utf8');
      } else {
        request.body = event.body;
      }
    }
  }
});
