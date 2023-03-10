const { readFileSync } = require('fs');

function readCredsFromCertFiles({ caPath, keyPath, certPath }) {
  if (!caPath && (!keyPath || !certPath)) {
    throw Error('TLS connection error: must provide CA or key and cert paths')
  }

  let pk = keyPath ? readFileSync(keyPath) : undefined;
  let cert = certPath ? readFileSync(certPath) : undefined;
  let ca = caPath ? readFileSync(caPath) : undefined;

  if ([true, 'true'].includes(process.env.TEMPORAL_TLS_BASE64_ENCODED)) {
    if (pk) {
      pk = Buffer.from(Buffer.from(pk.toString(), 'base64').toString('utf-8'), 'utf-8');
    }
    if (cert) {
      cert = Buffer.from(Buffer.from(cert.toString(), 'base64').toString('utf-8'), 'utf-8');
    }
    if (ca) {
      ca = Buffer.from(Buffer.from(ca.toString(), 'base64').toString('utf-8'), 'utf-8');
    }
  }

  return { pk, cert, ca };
}

module.exports = { readCredsFromCertFiles };
