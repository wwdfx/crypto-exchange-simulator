import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export default function Home() {
  const [coins, setCoins] = useState([]);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('market_cap');

  useEffect(() => {
    api.get('/cryptocurrencies').then(r => setCoins(r.data)).catch(() => {});
  }, []);

  const filtered = coins.filter(c => (c.name + c.symbol).toLowerCase().includes(q.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    const key = sort;
    return (b[key] ?? 0) - (a[key] ?? 0);
  });

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 16 }}>
        <h2>Топ криптовалют</h2>
        <div style={{ display:'flex', gap:8, marginTop: 8 }}>
          <input className="input" placeholder="Поиск..." value={q} onChange={e=>setQ(e.target.value)} />
          <select className="input" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="market_cap">По капитализации</option>
            <option value="current_price">По цене</option>
            <option value="price_change_24h">Изм. 24ч</option>
            <option value="volume_24h">Объем 24ч</option>
          </select>
          <Link className="btn primary" to="/dashboard">Перейти в кабинет</Link>
        </div>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Символ</th>
              <th>Название</th>
              <th>Цена</th>
              <th>Изм. 24ч</th>
              <th>Капитализация</th>
              <th>Объем 24ч</th>
              <th>Обновлено</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr key={c.id}>
                <td>{c.symbol}</td>
                <td>{c.name}</td>
                <td>${Number(c.current_price).toLocaleString()}</td>
                <td className={c.price_change_24h >= 0 ? 'text-green' : 'text-red'}>{Number(c.price_change_24h).toFixed(2)}%</td>
                <td>${Number(c.market_cap).toLocaleString()}</td>
                <td>${Number(c.volume_24h).toLocaleString()}</td>
                <td>{new Date(c.last_updated).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
