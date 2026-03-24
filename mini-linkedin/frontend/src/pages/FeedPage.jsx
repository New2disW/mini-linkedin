import { useState, useEffect } from 'react';
import { ImageIcon, X, Send } from 'lucide-react';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

export default function FeedPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await API.get('/posts');
            setPosts(res.data);
        } catch { }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            if (image) formData.append('image', image);

            const res = await API.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPosts(prev => [res.data, ...prev]);
            setContent('');
            setImage(null);
            setExpanded(false);
            toast.success('Post created!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create post. Check console or Cloudinary config.');
        }
        setSubmitting(false);
    };

    const handleUpdate = (updated) => {
        setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
    };

    const handleDelete = (id) => {
        setPosts(prev => prev.filter(p => p._id !== id));
    };

    return (
        <div>
            {/* Create Post */}
            <div className="card create-post-card">
                <div className="post-header">
                    {user?.avatar
                        ? <img src={user.avatar} className="avatar" style={{ width: 44, height: 44 }} alt="" />
                        : <div className="avatar-placeholder" style={{ width: 44, height: 44, fontSize: '1rem' }}>{user?.name?.[0]}</div>}
                    <input
                        className="post-input"
                        placeholder="Share an update, insight, or idea..."
                        readOnly={!expanded}
                        onClick={() => setExpanded(true)}
                        value={expanded ? undefined : ''}
                    />
                </div>

                {expanded && (
                    <form onSubmit={handleCreate}>
                        <textarea
                            className="create-post-textarea"
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            autoFocus
                            rows={4}
                        />
                        {image && (
                            <div style={{ position: 'relative', marginTop: 10, marginBottom: 10, width: 'fit-content' }}>
                                <img src={URL.createObjectURL(image)} alt="Preview" style={{ borderRadius: 8, maxHeight: 150, maxWidth: '100%', objectFit: 'cover' }} />
                                <button type="button" onClick={() => setImage(null)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: '50%', padding: 4, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        <div className="create-post-actions">
                            <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <ImageIcon size={14} style={{ color: 'var(--blue-light)' }} />
                                <input type="file" hidden accept="image/*" onChange={(e) => e.target.files[0] && setImage(e.target.files[0])} />
                            </label>
                            <div style={{ flex: 1 }} />
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setExpanded(false); setContent(''); setImage(null); }}>
                                <X size={14} /> Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !content.trim()}>
                                <Send size={14} /> {submitting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </form>
                )}

                {!expanded && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ImageIcon size={15} style={{ color: 'var(--blue-light)' }} /> Photo
                            <input type="file" hidden accept="image/*" onChange={(e) => {
                                if (e.target.files[0]) {
                                    setImage(e.target.files[0]);
                                    setExpanded(true);
                                }
                            }} />
                        </label>
                    </div>
                )}
            </div>

            {/* Feed */}
            {loading ? (
                <div className="loading-page"><div className="spinner" /></div>
            ) : posts.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>Your feed is empty</h3>
                    <p>Follow some people or create your first post to get started!</p>
                </div>
            ) : (
                posts.map(post => (
                    <PostCard key={post._id} post={post} onUpdate={handleUpdate} onDelete={handleDelete} />
                ))
            )}
        </div>
    );
}
