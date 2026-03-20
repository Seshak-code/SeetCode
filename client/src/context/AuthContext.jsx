import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session. Using a timeout to ensure loading state prevents flash
    const storedUser = localStorage.getItem('seetcode_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('seetcode_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('seetcode_user');
  };

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#c9d1d9' }}>Loading session...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
        {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
