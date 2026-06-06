const http = require('https');
http.get('https://app.veo.co/clubs/fc-zell/teams/1-mannschaft-fc-zell/recordings/', (res) => {
  console.log("Headers:", res.headers['x-frame-options']);
});
