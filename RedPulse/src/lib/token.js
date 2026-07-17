const getToken = (tokenName = "token") => {
  const token = localStorage.getItem(tokenName);
  if (!token) {
    return sessionStorage.getItem(tokenName);
  }
  return token;
};
const setToken = (tokenName = "token", tokenValue, temp = false) => {
  if (temp) {
    sessionStorage.setItem(tokenName, tokenValue);
  } else {
    localStorage.setItem(tokenName, tokenValue);
  }
};

export { getToken, setToken };
