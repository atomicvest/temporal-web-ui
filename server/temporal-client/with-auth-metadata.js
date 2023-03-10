const grpc = require('grpc');
const { getAuthConfig } = require('../config');

const WithAuthMetadata = (temporalClient) => {
  let tClient = Object.create(temporalClient);
  let uniq_namespaces = [ ...new Set(process.env.TEMPORAL_NAMESPACES.split(',')) ];

  uniq_namespaces.forEach(n => {
    tClient.client[n] = new Proxy(tClient.client[n], { get: getter });
  });

  return tClient;
};

const getter = (obj, property) => {
  if (!property in obj) {
    return undefined;
  }

  if (typeof obj[property] === 'function') {
    const fn = obj[property].bind(obj);
    return async (ctx, req) => {
      const metadata = await buildGrpcMetadata(ctx);
      return fn(req, metadata);
    };
  }

  return obj[property];
};

const extractTokens = (ctx) => {
  if (ctx.isAuthenticated()) {
    const { accessToken, idToken } = ctx.state.user;
    return { accessToken, idToken };
  }
  return { accessToken: undefined, idToken: undefined };
};

const buildGrpcMetadata = async (ctx) => {
  const metadata = new grpc.Metadata();

  const auth = await getAuthConfig();
  if (auth.enabled) {
    const { accessToken, idToken } = extractTokens(ctx);
    if (!accessToken) {
      throw Error('Request unauthorized');
    }
    metadata.add('authorization', `Bearer ${accessToken}`);
    if (idToken) {
      metadata.add('authorization-extras', idToken);
    }
  }
  return metadata;
};

module.exports = { WithAuthMetadata };
