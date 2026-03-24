import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Briefcase, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LeftSidebar() {
    const { user } = useAuth();
    const location = useLocation();

    const navItems = [
        { to: '/feed', icon: Home, label: 'Home' },
        { to: '/network', icon: Users, label: 'My Network' },
        { to: '/jobs', icon: Briefcase, label: 'Jobs' },
        { to: `/profile/${user?._id}`, icon: User, label: 'Profile' },
    ];

    return (
        <aside>
            {/* Profile Widget */}
            <div className="card sidebar-user" style={{ marginBottom: 14 }}>
                {user?.avatar
                    ? <img src={user.avatar} alt={user.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block' }} />
                    : <div className="avatar-placeholder" style={{ width: 64, height: 64, fontSize: '1.4rem', margin: '0 auto 12px' }}>{user?.name?.[0]}</div>}
                <h3>{user?.name}</h3>
                <p>{user?.headline}</p>
                <Link to={`/profile/${user?._id}`} className="btn btn-ghost btn-sm btn-full" style={{ marginTop: 14 }}>
                    View Profile
                </Link>
            </div>

            {/* Navigation */}
            <div className="card" style={{ padding: '10px', marginBottom: 14 }}>
                <nav className="sidebar-nav">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`sidebar-nav-item ${location.pathname.startsWith(to.split('/').slice(0, 2).join('/')) ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
