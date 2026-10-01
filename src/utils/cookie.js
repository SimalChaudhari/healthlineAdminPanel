import Cookies from 'js-cookie';

export const setCookie = (key, value, expiresInDays = 1) => {
  Cookies.set(key, value, {
    expires: expiresInDays,
    path: '/',
    sameSite: 'Strict',
    secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : true,
  });
};

export const getCookie = (key) => Cookies.get(key);

export const deleteCookie = (key) => {
  Cookies.remove(key, { path: '/' });
};
