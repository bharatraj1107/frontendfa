import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete } from '../utils/api.js';

export default function Comments() {
  const [issues, setIssues] = useState([]);
  const [comments, setComments] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get logged in user details for styling own comments
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchIssuesList();
  }, []);

  const fetchIssuesList = async () => {
    setLoadingIssues(true);
    try {
      const res = await apiGet('/issues?page=1&limit=100');
      setIssues(res.data);
    } catch (err) {
      console.error('Failed to load issues for comments panel:', err);
    } finally {
      setLoadingIssues(false);
    }
  };

  const fetchCommentsForIssue = async (issue) => {
    if (!issue) return;
    setLoadingComments(true);
    try {
      const res = await apiGet(`/comments?issueId=${issue.issueId}&page=1&limit=100`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue);
    fetchCommentsForIssue(issue);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedIssue) return;

    try {
      await apiPost('/comments', {
        issue: selectedIssue.issueId,
        message: newMessage.trim(),
      });
      setNewMessage('');
      // Reload comments list
      fetchCommentsForIssue(selectedIssue);
    } catch (err) {
      alert(`Failed to post comment: ${err.message}`);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await apiDelete(`/comments/${commentId}`);
      fetchCommentsForIssue(selectedIssue);
    } catch (err) {
      alert(`Failed to delete comment: ${err.message}`);
    }
  };

  // Filter issues list by search
  const filteredIssues = issues.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.issueId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="comments-split">
      
      {/* Left Panel: Issues list */}
      <div className="comments-sidebar">
        <div className="sidebar-search-wrap">
          <input
            type="text"
            className="form-input"
            placeholder="Filter issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loadingIssues ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            Loading issues...
          </div>
        ) : (
          <div className="issues-mini-list">
            {filteredIssues.map((issue) => {
              const isActive = selectedIssue?.issueId === issue.issueId;
              return (
                <div
                  key={issue.issueId}
                  className={`mini-issue-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectIssue(issue)}
                >
                  <div className="mini-issue-header">
                    <span className="issue-id">{issue.issueId}</span>
                    <span className={`kanban-dot ${issue.status}`} style={{ width: '6px', height: '6px' }} />
                  </div>
                  <span className="mini-issue-title">{issue.title}</span>
                </div>
              );
            })}
            {filteredIssues.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No issues found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Panel: Chat interface */}
      <div className="chat-container">
        {selectedIssue ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <span className="issue-id">{selectedIssue.issueId}</span>
              <h3 className="chat-header-title">{selectedIssue.title}</h3>
              <div className="chat-header-sub">
                Status: <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{selectedIssue.status}</span> | 
                Project: {selectedIssue.project?.title}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages">
              {loadingComments ? (
                <div style={{ textAlign: 'center', padding: '24px', margin: 'auto' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px' }} />
                  Fetching comments timeline...
                </div>
              ) : (
                <>
                  {comments.map((comment) => {
                    const isOwn = comment.user?.userId === currentUser?.userId;
                    return (
                      <div className={`message-bubble ${isOwn ? 'message-own' : ''}`} key={comment.commentId}>
                        <div className="message-avatar">
                          {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="message-body">
                          <div className="message-meta">
                            <span className="message-user">{comment.user?.name || 'Unknown User'}</span>
                            <span>•</span>
                            <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isOwn && (
                              <button 
                                onClick={() => handleDeleteComment(comment.commentId)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '6px', fontSize: '10px' }}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                          <div className="message-content">{comment.message}</div>
                        </div>
                      </div>
                    );
                  })}

                  {comments.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', margin: 'auto', fontSize: '13px' }}>
                      💬 No comments yet. Be the first to start the discussion!
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handlePostComment} className="chat-input-bar">
              <input
                type="text"
                className="chat-input"
                placeholder="Write a comment..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                required
              />
              <button type="submit" className="send-btn">Send</button>
            </form>
          </>
        ) : (
          <div className="chat-empty">
            <span className="chat-empty-icon">💬</span>
            <p>Select an issue from the left panel to load its discussion timeline.</p>
          </div>
        )}
      </div>

    </div>
  );
}
