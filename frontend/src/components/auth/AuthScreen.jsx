import { useState } from 'react';
import { MessageCircle, Sparkles, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.username, form.password);
        addToast('Welcome back!', 'success');
      } else {
        await register(form);
        addToast('Account created successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <header className="auth-top-bar">
        <div className="auth-top-brand">
          <MessageCircle size={22} />
          <span>PulseChat</span>
        </div>
        <div className="auth-top-actions">
          <button
            type="button"
            className={`auth-top-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            type="button"
            className={`auth-top-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            <UserPlus size={16} /> Sign Up
          </button>
        </div>
      </header>

      <div className="auth-center">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <MessageCircle size={28} />
            </div>
            <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
            <p className="auth-tagline">
              <Sparkles size={14} />
              {mode === 'login' ? 'Sign in to continue chatting' : 'Join PulseChat today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  placeholder="How others see you"
                  value={form.displayName}
                  onChange={update('displayName')}
                  maxLength={30}
                />
              </div>
            )}

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="your_username"
                value={form.username}
                onChange={update('username')}
                required
                autoFocus
                maxLength={20}
              />
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update('email')}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder={mode === 'register' ? 'Min 6 characters' : 'Your password'}
                value={form.password}
                onChange={update('password')}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
