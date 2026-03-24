import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function AuthPage() {
    const [tab, setTab] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
            const payload = tab === 'login' ? { email: form.email, password: form.password } : form;
            const res = await API.post(endpoint, payload);
            login(res.data.user, res.data.token);
            navigate('/feed');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>🔗 LinkPro</h1>
                    <p>Your professional network starts here</p>
                </div>

                <div className="auth-tabs">
                    <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
                        Sign In
                    </button>
                    <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
                        Join Now
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-error">{error}</div>}

                    {tab === 'register' && (
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={update('name')}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            className="form-input"
                            type="email"
                            placeholder="john@example.com"
                            value={form.email}
                            onChange={update('email')}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={update('password')}
                            required
                            minLength={6}
                        />
                    </div>

                    <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                        {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {tab === 'login' ? "Don't have an account? " : 'Already a member? '}
                    <button
                        style={{ background: 'none', border: 'none', color: 'var(--blue-light)', cursor: 'pointer', fontWeight: 600, fontSize: 'inherit' }}
                        onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
                    >
                        {tab === 'login' ? 'Join now' : 'Sign in'}
                    </button>
                </p>
            </div>
        </div>
    );
}
