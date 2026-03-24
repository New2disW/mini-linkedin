import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Briefcase, Bell, Search, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import API from '../api/axios';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { notifications, clearNotifications } = useSocket();
    const [showNotif, setShowNotif] = useState(false);
    const [allNotifs, setAllNotifs] = useState([]);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const notifRef = useRef(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Merge socket real-time notifs with fetched ones
    const unreadCount = allNotifs.filter(n => !n.read).length + notifications.length;

    useEffect(() => {
        API.get('/notifications').then(r => setAllNotifs(r.data)).catch(() => { });
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSearch = async (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length > 1) {
            const res = await API.get(`/users/search?q=${val}`);
            setSearchResults(res.data);
            setShowSearch(true);
        } else {
            setShowSearch(false);
        }
    };

    const handleMarkRead = async () => {
        await API.put('/notifications/read').catch(() => { });
        setAllNotifs(prev => prev.map(n => ({ ...n, read: true })));
        clearNotifications();
        setShowNotif(true);
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const navLinks = [
        { to: '/feed', icon: Home, label: 'Home' },
        { to: '/network', icon: Users, label: 'Network' },
        { to: '/jobs', icon: Briefcase, label: 'Jobs' },
        { to: `/profile/${user?._id}`, icon: User, label: 'Me' },
    ];

    const combined = [...notifications, ...allNotifs].slice(0, 20);
    const notifIcon = (type) => type === 'like' ? '❤️' : type === 'comment' ? '💬' : type === 'follow' ? '👤' : '💼';
    const notifClass = (type) => type === 'like' ? 'notif-like' : type === 'comment' ? 'notif-comment' : 'notif-follow';
    const timeAgo = (date) => {
        const s = Math.floor((Date.now() - new Date(date)) / 1000);
        if (s < 60) return 'just now';
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
    };

    return (
        <nav className="navbar">
            <Link to="/feed" className="navbar-brand">
                <span className="brand-icon">in</span>
                LinkPro
            </Link>

            <div className="navbar-search" ref={searchRef}>
                <Search size={15} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search professionals..."
                    value={query}
                    onChange={handleSearch}
                    onFocus={() => searchResults.length > 0 && setShowSearch(true)}
                />
                {showSearch && searchResults.length > 0 && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', zIndex: 200, overflow: 'hidden' }}>
                        {searchResults.map(u => (
                            <div key={u._id} onClick={() => { navigate(`/profile/${u._id}`); setShowSearch(false); setQuery(''); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', transition: 'var(--transition)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                {u.avatar
                                    ? <img src={u.avatar} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} alt={u.name} />
                                    : <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>{u.name[0]}</div>}
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{u.headline}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="navbar-actions">
                {navLinks.map(({ to, icon: Icon, label }) => (
                    <Link key={to} to={to} className={`nav-link ${location.pathname.startsWith(to.split('/').slice(0, 2).join('/')) ? 'active' : ''}`}>
                        <Icon size={20} />
                        <span>{label}</span>
                    </Link>
                ))}

                {/* Notification Bell */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                    <button className="notif-btn" onClick={() => { setShowNotif(v => !v); if (!showNotif) handleMarkRead(); }}>
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                    </button>
                    {showNotif && (
                        <div className="notif-dropdown">
                            <div className="notif-dropdown-header">
                                <h3>Notifications</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{unreadCount} unread</span>
                            </div>
                            {combined.length === 0
                                ? <div className="notif-empty">No notifications yet</div>
                                : combined.map((n, i) => (
                                    <div key={n._id || i} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                                        <div className={`notif-icon-wrap ${notifClass(n.type)}`}>{notifIcon(n.type)}</div>
                                        <div className="notif-text">
                                            <p>{n.message}</p>
                                            <div className="notif-time">{timeAgo(n.createdAt)}</div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>

                <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ gap: 6 }}>
                    <LogOut size={15} /> Logout
                </button>
            </div>
        </nav>
    );
}
