import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { pb, isAdmin } from '../services/pb';
import Home from './Home.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Admin from './Admin.jsx';

function Nav() {
  const user = pb.authStore.model;
  return (
    <div className="nav">
      <Link to="/">Crypto Exchange Simulator</Link>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: 12 }}>{user.email}</span>
            <button className="btn" onClick={() => { pb.authStore.clear(); window.location.href = '/'; }}>Выйти</button>
          </>
        ) : (
          <Link className="btn" to="/login">Войти</Link>
        )}
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  return pb.authStore.isValid ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  return pb.authStore.isValid && isAdmin() ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>
    </>
  );
}
