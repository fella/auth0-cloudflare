// backend/server.js
const express = require('express');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: 'https://dev-n6li42pa7lfgyazm.us.auth0.com/.well-known/jwks.json',
  }),
  authorizationParams: {
    audience: 'https://api.harvest.org',
  },
  issuer: 'https://dev-n6li42pa7lfgyazm.us.auth0.com/',
  algorithms: ['RS256'],
});

app.get('/protected', checkJwt, (req, res) => {
  console.log('[Backend] Received /protected request');
  // res.json({ message: '🎉 You accessed a protected API!' });
  res.json({ message: 'Protected data', time: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`✅ API server listening at http://localhost:${port}`);
});
