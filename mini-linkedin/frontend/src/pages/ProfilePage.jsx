import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Edit3, Plus, X, Save, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import PostCard from '../components/PostCard';

export default function ProfilePage() {
    const { id } = useParams();
    const { user, updateUser } = useAuth();
    const isMe = id === user?._id;

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [skillInput, setSkillInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showExpModal, setShowExpModal] = useState(false);
    const [expForm, setExpForm] = useState({ title: '', company: '', location: '', from: '', to: '', current: false, description: '' });

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const [userRes, postsRes] = await Promise.all([
                API.get(`/users/${id}`),
                API.get('/posts'),
            ]);
            setProfile(userRes.data);
            setForm({
                name: userRes.data.name,
                headline: userRes.data.headline,
                about: userRes.data.about,
                location: userRes.data.location,
                skills: [...(userRes.data.skills || [])],
                experience: [...(userRes.data.experience || [])],
            });
            const userPosts = postsRes.data.filter(p => p.author?._id === id);
            setPosts(userPosts);
        } catch { }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await API.put('/users/profile', form);
            setProfile(res.data);
            if (isMe) updateUser(res.data);
            setEditing(false);
        } catch { }
        setSaving(false);
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await API.post('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(p => ({ ...p, avatar: res.data.avatar }));
            if (isMe) updateUser({ ...user, avatar: res.data.avatar });
        } catch { }
        setUploadingAvatar(false);
    };

    const addSkill = (e) => {
        e.preventDefault();
        if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
            setForm(f => ({ ...f, skills: [...f.skills, skillInput.trim()] }));
        }
        setSkillInput('');
    };

    const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(sk => sk !== s) }));

    const addExperience = (e) => {
        e.preventDefault();
        setForm(f => ({ ...f, experience: [...f.experience, expForm] }));
        setExpForm({ title: '', company: '', location: '', from: '', to: '', current: false, description: '' });
        setShowExpModal(false);
    };

    const removeExp = (i) => setForm(f => ({ ...f, experience: f.experience.filter((_, idx) => idx !== i) }));

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;
    if (!profile) return <div className="empty-state"><h3>User not found</h3></div>;

    const data = editing ? form : profile;

    return (
        <div>
            {/* Profile Header Card */}
            <div className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>
                <div className="profile-banner" />
                <div className="profile-info-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="profile-avatar-wrap" style={{ position: 'relative', display: 'inline-block' }}>
                            {profile.avatar
                                ? <img src={profile.avatar} alt={profile.name} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg-card)' }} />
                                : <div className="avatar-placeholder" style={{ width: 96, height: 96, fontSize: '2.2rem', border: '4px solid var(--bg-card)' }}>{profile.name?.[0]}</div>}
                            
                            {isMe && editing && (
                                <label style={{ position: 'absolute', bottom: 4, right: 4, background: 'var(--blue-light)', color: '#fff', borderRadius: '50%', padding: 8, cursor: 'pointer', display: 'flex', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                    {uploadingAvatar ? <div className="spinner" style={{ width: 14, height: 14, borderLeftColor: '#fff', borderWidth: '2px' }} /> : <Upload size={14} />}
                                    <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                                </label>
                            )}
                        </div>
                        {isMe && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                {editing
                                    ? <>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={14} /> Cancel</button>
                                        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}><Save size={14} /> {saving ? 'Saving...' : 'Save'}</button>
                                    </>
                                    : <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}><Edit3 size={14} /> Edit Profile</button>
                                }
                            </div>
                        )}
                    </div>

                    {editing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                            <input className="form-input" placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            <input className="form-input" placeholder="Headline" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} />
                            <input className="form-input" placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                            <textarea className="form-textarea" placeholder="About you..." rows={3} value={form.about} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} />
                        </div>
                    ) : (
                        <>
                            <h1 className="profile-name">{profile.name}</h1>
                            <p className="profile-headline">{profile.headline}</p>
                            {profile.location && (
                                <div className="profile-meta">
                                    <span><MapPin size={14} />{profile.location}</span>
                                </div>
                            )}
                            {profile.about && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.7 }}>{profile.about}</p>}
                        </>
                    )}

                    <div className="profile-stats">
                        <div className="stat-item"><div className="stat-num">{profile.followers?.length || 0}</div><div className="stat-label">Followers</div></div>
                        <div className="stat-item"><div className="stat-num">{profile.following?.length || 0}</div><div className="stat-label">Following</div></div>
                        <div className="stat-item"><div className="stat-num">{posts.length}</div><div className="stat-label">Posts</div></div>
                    </div>
                </div>
            </div>

            {/* Skills Card */}
            <div className="card skills-card">
                <div className="section-title">
                    <span>Skills</span>
                    {isMe && editing && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Add below</span>}
                </div>
                <div className="skills-wrap">
                    {(editing ? form.skills : profile.skills)?.map(s => (
                        <span key={s} className="skill-tag">
                            {s}
                            {editing && <span className="remove-skill" onClick={() => removeSkill(s)}><X size={10} /></span>}
                        </span>
                    ))}
                    {(!editing || !form.skills?.length) && !profile.skills?.length && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No skills added yet</span>
                    )}
                </div>
                {editing && (
                    <form onSubmit={addSkill} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <input className="form-input" placeholder="e.g. React, Node.js..." value={skillInput} onChange={e => setSkillInput(e.target.value)} />
                        <button type="submit" className="btn btn-outline btn-sm"><Plus size={14} /> Add</button>
                    </form>
                )}
            </div>

            {/* Experience Card */}
            <div className="card exp-card">
                <div className="section-title">
                    <span>Experience</span>
                    {isMe && editing && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowExpModal(true)}>
                            <Plus size={14} /> Add
                        </button>
                    )}
                </div>
                {(editing ? form.experience : profile.experience)?.length === 0 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No experience added yet</span>
                )}
                {(editing ? form.experience : profile.experience)?.map((exp, i) => (
                    <div key={i} className="exp-item">
                        <div className="exp-dot" />
                        <div className="exp-content" style={{ flex: 1 }}>
                            <h4>{exp.title}</h4>
                            <div className="exp-company">{exp.company}</div>
                            <div className="exp-date">
                                {formatDate(exp.from)} — {exp.current ? 'Present' : formatDate(exp.to)}
                                {exp.location && ` · ${exp.location}`}
                            </div>
                            {exp.description && <p>{exp.description}</p>}
                        </div>
                        {editing && <button className="btn btn-danger btn-sm" onClick={() => removeExp(i)}><X size={12} /></button>}
                    </div>
                ))}
            </div>

            {/* Posts */}
            {posts.length > 0 && (
                <div>
                    <h3 style={{ fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity</h3>
                    {posts.map(p => (
                        <PostCard key={p._id} post={p}
                            onUpdate={upd => setPosts(prev => prev.map(pp => pp._id === upd._id ? upd : pp))}
                            onDelete={delId => setPosts(prev => prev.filter(pp => pp._id !== delId))} />
                    ))}
                </div>
            )}

            {/* Add Experience Modal */}
            {showExpModal && (
                <div className="modal-overlay" onClick={() => setShowExpModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Experience</h2>
                            <button className="modal-close" onClick={() => setShowExpModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={addExperience}>
                            <div className="modal-body">
                                <div className="form-group"><label className="form-label">Job Title *</label><input className="form-input" required value={expForm.title} onChange={e => setExpForm(f => ({ ...f, title: e.target.value }))} /></div>
                                <div className="form-group"><label className="form-label">Company *</label><input className="form-input" required value={expForm.company} onChange={e => setExpForm(f => ({ ...f, company: e.target.value }))} /></div>
                                <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={expForm.location} onChange={e => setExpForm(f => ({ ...f, location: e.target.value }))} /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className="form-group"><label className="form-label">From *</label><input className="form-input" type="date" required value={expForm.from} onChange={e => setExpForm(f => ({ ...f, from: e.target.value }))} /></div>
                                    <div className="form-group"><label className="form-label">To</label><input className="form-input" type="date" value={expForm.to} disabled={expForm.current} onChange={e => setExpForm(f => ({ ...f, to: e.target.value }))} /></div>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={expForm.current} onChange={e => setExpForm(f => ({ ...f, current: e.target.checked, to: '' }))} /> Currently working here
                                </label>
                                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} /></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowExpModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Experience</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
