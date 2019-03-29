export const redirectPath = process.env.REACT_APP_CJ_AUTH_REDIRECT_PATH;

const allowList = process.env.REACT_APP_CJ_AUTH_PLANINATOR_EDIT_ALLOWLIST;
export const authorizedEmails = allowList ? JSON.parse(allowList) : [];

export const authConfig = {
  clientId: process.env.REACT_APP_CJ_AUTH_CLIENTID,
  authorizationUri: process.env.REACT_APP_CJ_AUTH_AUTH_URI,
  redirectUri: `${window.location.origin}${redirectPath}`,
};
