import { CJAuthProvider } from './CJAuthProvider';
import { NoAuthProvider } from './NoAuthProvider';

let authProvider;
switch (process.env.REACT_APP_AUTH_PROVIDER) {
  case 'CJ':
    authProvider = CJAuthProvider;
    break;
  default:
    authProvider = NoAuthProvider;
}

export const getAuthProvider = () => authProvider;
