const { OAuth2Client } = require('google-auth-library');

async function verifyGoogleToken(credential, clientId) {
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });
  return ticket.getPayload();
}

module.exports = { verifyGoogleToken };
