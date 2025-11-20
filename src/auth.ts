interface AuthData {
  token: string | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
}

function setAuthData({ token, userId, userEmail, userName }: Partial<AuthData>): void {
  if (token) localStorage.setItem('authToken', token);
  if (userId) localStorage.setItem('userId', userId);
  if (userEmail) localStorage.setItem('userEmail', userEmail);
  if (userName) localStorage.setItem('userName', userName);
}

function getAuthData(): AuthData {
  return {
    token: localStorage.getItem('authToken'),
    userId: localStorage.getItem('userId'),
    userEmail: localStorage.getItem('userEmail'),
    userName: localStorage.getItem('userName'),
  };
}

function requireAuth(): void {
  const { token } = getAuthData();
  if (!token) {
    window.location.href = 'login.html';
  }
}

function logout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  window.location.href = 'index.html';
}

declare global {
  interface Window {
    GrizzlyAuth: {
      setAuthData: typeof setAuthData;
      getAuthData: typeof getAuthData;
      requireAuth: typeof requireAuth;
      logout: typeof logout;
    };
  }
}

window.GrizzlyAuth = {
  setAuthData,
  getAuthData,
  requireAuth,
  logout,
};

export {};
