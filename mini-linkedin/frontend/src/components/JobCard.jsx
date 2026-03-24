import { MapPin, Clock, DollarSign, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function JobCard({ job, onDelete }) {
    const { user } = useAuth();

    const handleDelete = async () => {
        if (!window.confirm('Delete this job?')) return;
        try {
            await API.delete(`/jobs/${job._id}`);
            onDelete && onDelete(job._id);
        } catch { }
    };

    const timeAgo = (date) => {
        const s = Math.floor((Date.now() - new Date(date)) / 1000);
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
    };

    const companyInitial = job.company?.[0]?.toUpperCase() || '?';

    return (
        <div className="card job-card card-hover fade-in">
            <div className="job-card-header">
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div className="job-icon">{companyInitial}</div>
                    <div className="job-info">
                        <h3>{job.title}</h3>
                        <div className="company">{job.company}</div>
                    </div>
                </div>
                {user?._id === job.postedBy?._id && (
                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            <div className="job-meta">
                <span className="job-badge badge-type">{job.type}</span>
                <span className="job-badge badge-location"><MapPin size={12} />{job.location}</span>
                <span className="job-badge badge-salary"><DollarSign size={11} />{job.salary}</span>
                <span className="job-badge" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    <Clock size={11} />{timeAgo(job.createdAt)}
                </span>
            </div>

            <p className="job-desc">
                {job.description.length > 200 ? job.description.slice(0, 200) + '...' : job.description}
            </p>

            {job.requirements?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {job.requirements.slice(0, 4).map((r, i) => (
                        <span key={i} className="tag">{r}</span>
                    ))}
                </div>
            )}

            <div className="job-footer">
                <div className="job-posted-by">
                    {job.postedBy?.avatar
                        ? <img src={job.postedBy.avatar} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                        : <div className="avatar-placeholder" style={{ width: 26, height: 26, fontSize: '0.65rem' }}>{job.postedBy?.name?.[0]}</div>}
                    <span>Posted by <strong>{job.postedBy?.name}</strong></span>
                </div>
                <button className="btn btn-outline btn-sm">
                    <ExternalLink size={13} /> Apply
                </button>
            </div>
        </div>
    );
}
