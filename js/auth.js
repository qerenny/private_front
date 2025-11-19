function setAuthData({ token, userId, userEmail, userName }) {
  if (token) localStorage.setItem('authToken', token);
  if (userId) localStorage.setItem('userId', userId);
  if (userEmail) localStorage.setItem('userEmail', userEmail);
  if (userName) localStorage.setItem('userName', userName);
}

function getAuthData() {
  return {
    token: localStorage.getItem('authToken'),
    userId: localStorage.getItem('userId'),
    userEmail: localStorage.getItem('userEmail'),
    userName: localStorage.getItem('userName'),
  };
}

function requireAuth() {
  const { token } = getAuthData();
  if (!token) {
    window.location.href = 'login.html';
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  window.location.href = 'index.html';
}

window.GrizzlyAuth = {
  setAuthData,
  getAuthData,
  requireAuth,
  logout,
};
