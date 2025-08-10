import { useState } from 'react';

export default function TradeModal({ open, onClose, onSubmit, symbol, mode }) {
  const [amount, setAmount] = useState('');
  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
      <div className="card" style={{ width: 420 }}>
        <h3>{mode === 'buy' ? 'Покупка' : 'Продажа'} {symbol}</h3>
        <div className="grid" style={{ marginTop: 12 }}>
          <input className="input" type="number" min="0" step="0.0001" placeholder="Количество" value={amount} onChange={e=>setAmount(e.target.value)} />
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button className="btn" onClick={onClose}>Отмена</button>
            <button className="btn primary" onClick={() => onSubmit(Number(amount))} disabled={!Number(amount)}>Подтвердить</button>
          </div>
        </div>
      </div>
    </div>
  );
}
