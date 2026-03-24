import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function UserCard({ person, onFollowChange }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const isFollowing = person.followers?.some(f =>
        (typeof f === 'object' ? f._id : f) === user?._id
    );

    const handleFollow = async () => {
        setLoading(true);
        try {
            if (isFollowing) {
                await API.delete(`/follow/${person._id}/unfollow`);
            } else {
                await API.post(`/follow/${person._id}/follow`);
            }
            onFollowChange && onFollowChange(person._id, !isFollowing);
        } catch { }
        setLoading(false);
    };

    return (
        <div className="card user-card card-hover fade-in">
            <Link to={`/profile/${person._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {person.avatar
                    ? <img src={person.avatar} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block' }} alt={person.name} />
                    : <div className="avatar-placeholder" style={{ width: 72, height: 72, fontSize: '1.6rem', margin: '0 auto 12px' }}>{person.name?.[0]}</div>
                }
                <h4>{person.name}</h4>
                <p>{person.headline || 'Professional'}</p>
            </Link>
            <div className="follow-count">{person.followers?.length || 0} followers</div>
            {person.skills?.length > 0 && (
                <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
                    {person.skills.slice(0, 3).map(s => (
                        <span key={s} className="skill-tag" style={{ margin: 0 }}>{s}</span>
                    ))}
                </div>
            )}
            {user?._id !== person._id && (
                <button
                    className={`btn w-full ${isFollowing ? 'btn-ghost' : 'btn-outline'}`}
                    onClick={handleFollow}
                    disabled={loading}
                >
                    {isFollowing ? <><UserCheck size={15} /> Following</> : <><UserPlus size={15} /> Follow</>}
                </button>
            )}
        </div>
    );
}
