import ClientOAuth2 from 'client-oauth2';
import * as R from 'ramda';
import { authConfig, authorizedEmails } from './config';

export const cjAuth = new ClientOAuth2(authConfig);

const decodeBase64 = str => {
  var output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      return null;
  }
  return window.atob(output);
};

const getUserIdFromToken = R.compose(
  R.prop('userId'),
  JSON.parse,
  decodeBase64,
  R.prop(1),
  R.split('.')
);

export const getAuthRedirectUri = redirectPath => {
  const state = { nonce: (+new Date()).toString(36), redirectPath };
  return cjAuth.token.getUri({
    state: btoa(JSON.stringify(state)),
  });
};

export const getUser = async token => {
  try {
    const auth = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const userId = getUserIdFromToken(token);
    const url = `/api/user/${userId}`;
    const resp = await fetch(url, auth);
    if (resp.ok) {
      const data = await resp.json();
      return data;
    } else {
      return resp.statusText;
    }
  } catch (err) {
    return { error: err };
  }
};

export const getOauthData = async href => {
  const token = await cjAuth.token.getToken(href);
  const { redirectPath } = JSON.parse(atob(token.data.state));
  return { token: token.accessToken, redirectPath };
};

export const isValidUser = user => !!user.emailAddress;

export const isAuthorized = (user, other, things) => {
  if (!user) return false;
  return R.contains(user.emailAddress, authorizedEmails);
};

export const login = (redirectPath = '/') => {
  window.location.href = getAuthRedirectUri(redirectPath);
};
