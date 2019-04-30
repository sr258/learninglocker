import mongoose from 'mongoose';
import Promise from 'bluebird';
import logger from 'lib/logger';
import defaultTo from 'lodash/defaultTo';

mongoose.Promise = Promise;
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const poolSize = defaultTo(Number(process.env.MONGO_CONNECTION_POOLSIZE), 20);
// Default timeout to 5 minutes
const socketTimeoutMS = defaultTo(Number(process.env.MONGO_SOCKET_TIMEOUT_MS), 300000);

const createConnection = () => {
  const dbpath = process.env.MONGODB_PATH;
  const serverOptions = {
    socketTimeoutMS,
    poolSize
  };

  logger.silly('Creating Mongo connection', dbpath, serverOptions);
  // +++ MBS-HACK (Sebastian Rettig) - Retry if Mongo is not up yet
  const connection = mongoose.createConnection(dbpath, {
    promiseLibrary: Promise,
    ...serverOptions
  });
  connection.on('error', (err) => {
    // If first connect fails because mongod is down, try again later.
    // This is only needed for first connect, not for runtime reconnects.
    // See: https://github.com/Automattic/mongoose/issues/5169
    if (err.message && err.message.match(/failed to connect to server .* on first connect/)) {
      logger.error(new Date(), String(err));

      // Wait for a bit, then try to connect again
      setTimeout(() => {
        logger.silly("Retrying first connect...");
        connection.openUri(dbpath, {
          promiseLibrary: Promise,
          ...serverOptions
        }).catch(() => { });
        // Why the empty catch?
        // Well, errors thrown by db.open() will also be passed to .on('error'),
        // so we can handle them there, no need to log anything in the catch here.
        // But we still need this empty catch to avoid unhandled rejections.
      }, 20 * 1000);
    } else {
      // Some other error occurred.  Log it.
      logger.error(new Date(), String(err));
    }
  })
  return connection;
  // --- MBS-HACK
};

const connections = {};
const getConnections = () => connections;

const getConnection = (namespace = 'll') => {
  if (connections[namespace]) return connections[namespace];
  connections[namespace] = createConnection();
  connections[namespace].on('error', console.error);
  return connections[namespace];
};

export {
  getConnection,
  getConnections
};
