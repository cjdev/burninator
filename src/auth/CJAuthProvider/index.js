import { CallbackRoute } from './CallbackRoute';
import { login, isAuthorized } from './authClient';

export const CJAuthProvider = {
  // Indicates that the provider requires auth. A return value of false here
  // indicates that the application can allow access to protected resources.
  requiresAuthentication: () => true,
  isAuthorized,
  login,
  callbackRoute: CallbackRoute,
};
