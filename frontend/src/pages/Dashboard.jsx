import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { pb } from '../services/pb';
import TradeModal from '../components/TradeModal.jsx';
import PriceChart from '../components/PriceChart.jsx';

export default function Dashboard() {
  const [coins, setCoins] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(pb.authStore.model?.balance ?? 0);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [modal, setModal] = useState({ open: false, mode: 'buy' });

  useEffect(() => {
    const load = async () => {
      const [coinsRes] = await Promise.all([
        api.get('/cryptocurrencies'),
      ]);
      setCoins(coinsRes.data);
    };
    load().catch(() => {});
  }, []);

  useEffect(() => {
    const sub1 = pb.collection('cryptocurrencies').subscribe('*', () => {
      api.get('/cryptocurrencies').then(r => setCoins(r.data)).catch(() => {});
    });
    const sub2 = pb.collection('transactions').subscribe('*', (e) => {
      if (e.record?.user === pb.authStore.model?.id) {
        reloadUserData();
      }
    });
    const sub3 = pb.collection('users').subscribe(pb.authStore.model?.id, (e) => {
      if (e.record?.id === pb.authStore.model?.id) setBalance(e.record.balance);
    });
    reloadUserData();
    return () => { pb.collection('cryptocurrencies').unsubscribe('*'); pb.collection('transactions').unsubscribe('*'); pb.collection('users').unsubscribe(pb.authStore.model?.id); };
  }, []);

  const reloadUserData = async () => {
    const userId = pb.authStore.model?.id;
    if (!userId) return;
    const [p, t, u] = await Promise.all([
      pb.collection('portfolios').getList(1, 200, { filter: `user.id = \"${userId}\"` }),
      pb.collection('transactions').getList(1, 200, { filter: `user.id = \"${userId}\"`, sort: '-created' }),
      pb.collection('users').getOne(userId),
    ]);
    setPortfolio(p.items);
    setTransactions(t.items);
    setBalance(u.balance);
  };

  const portfolioValue = useMemo(() => {
    return portfolio.reduce((sum, p) => {
      const price = coins.find(c => c.symbol === p.cryptocurrency)?.current_price || 0;
      return sum + p.amount * price;
    }, 0);
  }, [portfolio, coins]);

  const onTrade = async (mode, amount) => {
    setModal({ open: false, mode });
    if (!amount) return;
    try {
      const res = await api.post(`/trade/${mode}`, { cryptocurrency: selectedSymbol, amount });
      if (res.data?.balance != null) setBalance(res.data.balance);
      await reloadUserData();
      alert('Сделка выполнена');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="grid">
          <div className="card">
            <div>Баланс</div>
            <div style={{ fontSize: 22 }}>${Number(balance).toLocaleString()}</div>
          </div>
          <div className="card">
            <div>Стоимость портфеля</div>
            <div style={{ fontSize: 22 }}>${Number(portfolioValue).toLocaleString()}</div>
          </div>
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <div>Выбор монеты</div>
          <select className="input" value={selectedSymbol} onChange={e=>setSelectedSymbol(e.target.value)} style={{ marginTop: 8 }}>
            {coins.map(c => (<option key={c.id} value={c.symbol}>{c.symbol} — {c.name}</option>))}
          </select>
          <div style={{ display:'flex', gap:8, marginTop: 12 }}>
            <button className="btn primary" onClick={() => setModal({ open: true, mode: 'buy' })}>Купить</button>
            <button className="btn" onClick={() => setModal({ open: true, mode: 'sell' })}>Продать</button>
          </div>
        </div>
      </div>
      <div className="main">
        <div className="card">
          <h3>График {selectedSymbol}/USD</h3>
          <div style={{ marginTop: 8 }}>
            <PriceChart symbol={selectedSymbol} days={1} />
          </div>
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Портфель</h3>
          <table className="table" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Монета</th>
                <th>Кол-во</th>
                <th>Средн. цена</th>
                <th>Тек. цена</th>
                <th>Стоимость</th>
                <th>P/L</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map(p => {
                const price = coins.find(c => c.symbol === p.cryptocurrency)?.current_price || 0;
                const value = p.amount * price;
                const pl = (price - p.average_price) * p.amount;
                return (
                  <tr key={p.id}>
                    <td>{p.cryptocurrency}</td>
                    <td>{p.amount}</td>
                    <td>${Number(p.average_price).toLocaleString()}</td>
                    <td>${Number(price).toLocaleString()}</td>
                    <td>${Number(value).toLocaleString()}</td>
                    <td className={pl >= 0 ? 'text-green' : 'text-red'}>${Number(pl).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <h3>История сделок</h3>
          <table className="table" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тип</th>
                <th>Монета</th>
                <th>Кол-во</th>
                <th>Цена</th>
                <th>Сумма</th>
                <th>Комиссия</th>
                <th>P/L</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.created).toLocaleString()}</td>
                  <td>{t.type}</td>
                  <td>{t.cryptocurrency}</td>
                  <td>{t.amount}</td>
                  <td>${Number(t.price).toLocaleString()}</td>
                  <td>${Number(t.total).toLocaleString()}</td>
                  <td>${Number(t.fee).toLocaleString()}</td>
                  <td className={(t.profit_loss ?? 0) >= 0 ? 'text-green' : 'text-red'}>{t.type === 'sell' ? `$${Number(t.profit_loss).toLocaleString()}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <TradeModal open={modal.open} mode={modal.mode} symbol={selectedSymbol} onClose={() => setModal({ open: false, mode: 'buy' })} onSubmit={(amount) => onTrade(modal.mode, amount)} />
    </div>
  );
}
