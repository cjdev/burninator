const key = 'user';

export const storeUser = user => {
  localStorage.setItem(key, JSON.stringify(user));
};

export const getUser = () => {
  return JSON.parse(localStorage.getItem(key));
};
