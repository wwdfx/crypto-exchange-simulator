import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { api } from '../services/api';

export default function PriceChart({ symbol, days = 1 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = createChart(containerRef.current, {
      height: 260,
      layout: { background: { color: '#0b0f16' }, textColor: '#e6edf3' },
      grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
      rightPriceScale: { borderColor: '#1f2937' },
      timeScale: { borderColor: '#1f2937' },
    });
    seriesRef.current = chartRef.current.addCandlestickSeries({ upColor: '#22c55e', downColor: '#ef4444', borderVisible: false, wickUpColor: '#22c55e', wickDownColor: '#ef4444' });
    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chartRef.current?.remove(); chartRef.current = null; };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true); setError('');
    api.get(`/chart/${symbol}?days=${days}`).then(res => {
      if (!mounted) return;
      const data = (res.data || []).map(([t, o, h, l, c]) => ({ time: Math.floor(t / 1000), open: o, high: h, low: l, close: c }));
      seriesRef.current?.setData(data);
    }).catch(e => setError(e.response?.data?.error || e.message)).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [symbol, days]);

  if (error) return <div className="text-red">{error}</div>;
  return (
    <div>
      {loading && <div>Загрузка графика...</div>}
      <div ref={containerRef} style={{ width: '100%', height: 260 }} />
    </div>
  );
}
