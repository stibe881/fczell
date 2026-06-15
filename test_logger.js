const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/test_logger',
  method: 'POST'
}, res => {
  console.log('Status:', res.statusCode);
});
req.on('error', e => console.error(e));
req.end();
