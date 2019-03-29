import opts from '../opts';
import { noAuthProvider } from './noAuthProvider';
import { cjAuthProvider } from './cjAuthProvider';

export const addAuth = (app, logger) => {
  switch (opts.authProvider) {
    case 'CJ':
      return cjAuthProvider(app, logger);
    default:
      return noAuthProvider(app, logger);
  }
};
