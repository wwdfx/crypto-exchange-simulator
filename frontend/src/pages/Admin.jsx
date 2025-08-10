import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { isAdmin } from '../services/pb';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin()) return;
    api.get('/admin/users').then(r => setUsers(r.data)).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const updateBalance = async (id) => {
    const balance = prompt('Новый баланс:');
    if (balance == null) return;
    try {
      const r = await api.patch(`/admin/users/${id}/balance`, { balance: Number(balance) });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, balance: r.data.balance } : u));
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  };

  if (loading) return <div className="container">Загрузка...</div>;
  if (error) return <div className="container text-red">{error}</div>;

  return (
    <div className="container">
      <div className="card">
        <h3>Пользователи</h3>
        <table className="table" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Имя</th>
              <th>Роль</th>
              <th>Баланс</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td>{u.role}</td>
                <td>${Number(u.balance || 0).toLocaleString()}</td>
                <td><button className="btn" onClick={() => updateBalance(u.id)}>Изменить баланс</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
