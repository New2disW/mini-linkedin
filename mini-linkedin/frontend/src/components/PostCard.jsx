import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Trash2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function PostCard({ post, onDelete, onUpdate }) {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);

    const liked = post.likes?.includes(user?._id);
    const likeCount = post.likes?.length || 0;
    const commentCount = post.comments?.length || 0;

    const timeAgo = (date) => {
        const s = Math.floor((Date.now() - new Date(date)) / 1000);
        if (s < 60) return 'just now';
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
    };

    const handleLike = async () => {
        try {
            const res = await API.put(`/posts/${post._id}/like`);
            onUpdate({ ...post, likes: res.data.likes });
        } catch { }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setLoading(true);
        try {
            const res = await API.post(`/posts/${post._id}/comment`, { text: commentText });
            onUpdate(res.data);
            setCommentText('');
        } catch { }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await API.delete(`/posts/${post._id}`);
            onDelete(post._id);
        } catch { }
    };

    const author = post.author || {};

    return (
        <div className="card post-card fade-in">
            <div className="post-header">
                <div className="post-author">
                    <Link to={`/profile/${author._id}`} style={{ textDecoration: 'none' }}>
                        {author.avatar
                            ? <img src={author.avatar} className="avatar" style={{ width: 44, height: 44 }} alt={author.name} />
                            : <div className="avatar-placeholder" style={{ width: 44, height: 44, fontSize: '1rem' }}>{author.name?.[0] || '?'}</div>}
                    </Link>
                    <div className="post-author-info">
                        <Link to={`/profile/${author._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h4>{author.name}</h4>
                        </Link>
                        <span>{author.headline} · {timeAgo(post.createdAt)}</span>
                    </div>
                </div>
                {user?._id === author._id && (
                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            <div className="post-content">
                {post.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>

            {post.image && <img src={post.image} className="post-image" alt="post" />}

            <div className="post-actions">
                <button className={`action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
                    <ThumbsUp size={16} fill={liked ? 'currentColor' : 'none'} />
                    {likeCount > 0 && likeCount} Like{likeCount !== 1 ? 's' : ''}
                </button>
                <button className="action-btn" onClick={() => setShowComments(v => !v)}>
                    <MessageCircle size={16} />
                    {commentCount > 0 && commentCount} Comment{commentCount !== 1 ? 's' : ''}
                </button>
            </div>

            {showComments && (
                <div className="comments-section">
                    {post.comments?.map((c, i) => (
                        <div key={i} className="comment-item">
                            {c.user?.avatar
                                ? <img src={c.user.avatar} className="avatar" style={{ width: 32, height: 32 }} alt="" />
                                : <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{c.user?.name?.[0] || '?'}</div>}
                            <div className="comment-body">
                                <div className="comment-author">{c.user?.name}</div>
                                <div className="comment-text">{c.text}</div>
                            </div>
                        </div>
                    ))}
                    <form className="comment-input-row" onSubmit={handleComment}>
                        {user?.avatar
                            ? <img src={user.avatar} className="avatar" style={{ width: 32, height: 32 }} alt="" />
                            : <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{user?.name?.[0]}</div>}
                        <input
                            className="comment-input"
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !commentText.trim()}>
                            <Send size={14} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
