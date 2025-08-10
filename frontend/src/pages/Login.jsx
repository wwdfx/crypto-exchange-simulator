import { useState } from 'react';
import { pb } from '../services/pb';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await pb.collection('users').authWithPassword(email, password);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await pb.collection('users').create({ email, password, passwordConfirm: password, name });
      await pb.collection('users').authWithPassword(email, password);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <div className="card">
        <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="grid" style={{ marginTop: 12 }}>
          {mode === 'register' && (
            <input className="input" placeholder="Имя" value={name} onChange={e=>setName(e.target.value)} required />
          )}
          <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="input" placeholder="Пароль" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          {error && <div className="text-red" style={{ marginTop: -4 }}>{error}</div>}
          <button className="btn primary" type="submit">{mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</button>
        </form>
        <div style={{ marginTop: 12 }}>
          {mode === 'login' ? (
            <button className="btn" onClick={() => setMode('register')}>Нет аккаунта? Регистрация</button>
          ) : (
            <button className="btn" onClick={() => setMode('login')}>Есть аккаунт? Войти</button>
          )}
        </div>
      </div>
    </div>
  );
}
