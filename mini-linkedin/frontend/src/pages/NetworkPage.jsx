import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import UserCard from '../components/UserCard';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function NetworkPage() {
    const { user } = useAuth();
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        fetchPeople();
    }, []);

    const fetchPeople = async () => {
        setLoading(true);
        try {
            const res = await API.get('/users');
            setPeople(res.data);
        } catch { }
        setLoading(false);
    };

    const handleSearch = async (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length > 1) {
            const res = await API.get(`/users/search?q=${val}`);
            setPeople(res.data);
        } else if (val.length === 0) {
            fetchPeople();
        }
    };

    const handleFollowChange = (personId, nowFollowing) => {
        setPeople(prev => prev.map(p => {
            if (p._id !== personId) return p;
            const followers = nowFollowing
                ? [...(p.followers || []), user._id]
                : (p.followers || []).filter(f => (typeof f === 'object' ? f._id : f) !== user._id);
            return { ...p, followers };
        }));
    };

    const filtered = query
        ? people
        : people;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Grow Your Network</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 3 }}>Connect with professionals in your industry</p>
                </div>
            </div>

            <div style={{ position: 'relative', marginBottom: 20 }}>
                <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    className="form-input"
                    style={{ paddingLeft: 40 }}
                    placeholder="Search professionals by name or headline..."
                    value={query}
                    onChange={handleSearch}
                />
            </div>

            {loading ? (
                <div className="loading-page"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No professionals found</h3>
                    <p>Try a different search term</p>
                </div>
            ) : (
                <>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                        {filtered.length} professional{filtered.length !== 1 ? 's' : ''} found
                    </p>
                    <div className="network-grid">
                        {filtered.map(person => (
                            <UserCard key={person._id} person={person} onFollowChange={handleFollowChange} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
