import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('http://localhost:5005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }
      const userData = await res.json();
      login(userData);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="panel" style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '2rem' }}>Sign In</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        {error && <div style={{ color: '#f87171', fontSize: '0.9rem' }}>{error}</div>}
        <button className="run-btn" type="submit" style={{ marginTop: '1rem' }}>Login</button>
      </form>
    </section>
  );
}

export default LoginPage;
