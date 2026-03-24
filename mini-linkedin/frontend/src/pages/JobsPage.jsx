import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import JobCard from '../components/JobCard';
import API from '../api/axios';

const JOB_TYPES = ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];

export default function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [form, setForm] = useState({
        title: '', company: '', location: '', type: 'Full-time',
        description: '', requirements: '', salary: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchJobs(); }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await API.get('/jobs');
            setJobs(res.data);
        } catch { }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                requirements: form.requirements.split(',').map(s => s.trim()).filter(Boolean),
            };
            const res = await API.post('/jobs', payload);
            setJobs(prev => [res.data, ...prev]);
            setShowModal(false);
            setForm({ title: '', company: '', location: '', type: 'Full-time', description: '', requirements: '', salary: '' });
        } catch { }
        setSubmitting(false);
    };

    const handleDelete = (id) => setJobs(prev => prev.filter(j => j._id !== id));

    const filtered = filter === 'all' ? jobs : jobs.filter(j => j.type === filter);

    return (
        <div>
            <div className="jobs-header">
                <div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Job Board</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 3 }}>Discover your next opportunity</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> Post a Job
                </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                {['all', ...JOB_TYPES].map(type => (
                    <button
                        key={type}
                        className={`btn btn-sm ${filter === type ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter(type)}
                    >
                        {type === 'all' ? 'All Jobs' : type}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-page"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💼</div>
                    <h3>No jobs found</h3>
                    <p>{filter !== 'all' ? 'Try a different filter or be the first to post!' : 'Be the first to post a job!'}</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
                        <Plus size={15} /> Post a Job
                    </button>
                </div>
            ) : (
                <>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                        {filtered.length} job{filtered.length !== 1 ? 's' : ''} available
                    </p>
                    {filtered.map(job => (
                        <JobCard key={job._id} job={job} onDelete={handleDelete} />
                    ))}
                </>
            )}

            {/* Post Job Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Post a Job</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className="form-group">
                                        <label className="form-label">Job Title *</label>
                                        <input className="form-input" required placeholder="e.g. Senior React Developer" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Company *</label>
                                        <input className="form-input" required placeholder="e.g. TechCorp Inc." value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className="form-group">
                                        <label className="form-label">Location *</label>
                                        <input className="form-input" required placeholder="e.g. Mumbai, India" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Job Type</label>
                                        <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Salary</label>
                                    <input className="form-input" placeholder="e.g. ₹12-18 LPA or Not disclosed" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Job Description *</label>
                                    <textarea className="form-textarea" required rows={4} placeholder="Describe the role, responsibilities..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Requirements (comma-separated)</label>
                                    <input className="form-input" placeholder="e.g. React, Node.js, 3+ years experience" value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Posting...' : 'Post Job'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
