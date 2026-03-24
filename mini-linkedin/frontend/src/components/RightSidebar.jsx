import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import API from '../api/axios';

const TRENDING = ['#OpenToWork', '#WebDev', '#React', '#AIJobs', '#StartupLife', '#RemoteWork'];

export default function RightSidebar() {
    const [topUsers, setTopUsers] = useState([]);

    useEffect(() => {
        API.get('/users').then(res => {
            const sorted = res.data.sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0));
            setTopUsers(sorted.slice(0, 4));
        }).catch(() => { });
    }, []);

    return (
        <aside>
            {/* Trending Topics */}
            <div className="card sidebar-card" style={{ marginBottom: 14 }}>
                <div className="section-title"><TrendingUp size={16} /> Trending</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {TRENDING.map(tag => (
                        <div key={tag} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--blue-light)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>{tag}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{Math.floor(Math.random() * 2000 + 500)} posts</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* People to Follow */}
            {topUsers.length > 0 && (
                <div className="card sidebar-card">
                    <div className="section-title">People to Follow</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {topUsers.map(u => (
                            <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {u.avatar
                                    ? <img src={u.avatar} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                    : <div className="avatar-placeholder" style={{ width: 38, height: 38, fontSize: '0.85rem' }}>{u.name?.[0]}</div>}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{u.followers?.length || 0} followers</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
}
