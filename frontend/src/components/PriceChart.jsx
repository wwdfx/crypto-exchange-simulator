import { useEffect, useRef, useState } from 'react';
import { Chart, TimeScale, Tooltip, Legend, LinearScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { api } from '../services/api';

Chart.register(TimeScale, LinearScale, Tooltip, Legend, CandlestickController, CandlestickElement);

export default function PriceChart({ symbol, days = 1 }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const chartRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true); setError('');
    api.get(`/chart/${symbol}?days=${days}`).then(res => {
      if (!mounted) return;
      const data = res.data || [];
      const items = data.map(([t, o, h, l, c]) => ({ x: new Date(t), o, h, l, c }));
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      const ctx = canvasRef.current.getContext('2d');
      chartRef.current = new Chart(ctx, {
        type: 'candlestick',
        data: { datasets: [{ label: `${symbol} / USD`, data: items, borderColor: '#7cc7ff' }] },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { type: 'time', time: { unit: 'hour' } },
            y: { beginAtZero: false },
          },
        },
      });
    }).catch(e => setError(e.response?.data?.error || e.message)).finally(() => mounted && setLoading(false));
    return () => { mounted = false; if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [symbol, days]);

  if (loading) return <div>Загрузка графика...</div>;
  if (error) return <div className="text-red">{error}</div>;
  return <canvas ref={canvasRef} height={240} />;
}
