import React, { useState, useEffect } from "react";
import Select from 'react-select';
import "./css/Hub.css";
import iconHeartEmpty from "./media/heartEmpty.svg";
import iconHeartFull from "./media/heartFull.svg";
import { calculateTime } from "./globalFunctions";
import Swal from 'sweetalert2';

function Hub({ username }) {
    const [posts, setPosts] = useState([]);
    const [newPostText, setNewPostText] = useState('');
    const [newCommentText, setNewCommentText] = useState('');
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [sortingOption, setSortingOption] = useState('mostRecent');
    const [sharePost, setSharePost] = useState(null);
    const [showShare, setShowShare] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [visiblePosts, setVisiblePosts] = useState(3);

    useEffect(() => {
        const getUserId = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/user/userId', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserId(data.userId);
                } else {
                    console.error('Error fetching user ID');
                }
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchPosts();
        getUserId();
    }, [sortingOption]);

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/hub/posts', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok){
                const data = await response.json();
                console.log('Posts:', data.posts);
                const sortedPosts = sortPosts(data.posts, sortingOption);
                setPosts(sortedPosts);
            } else {
                console.error('Error fetching posts');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPosts = () => {
        setVisiblePosts(visiblePosts + 3);
    };

    const postsToShow = posts.slice(0, visiblePosts);

    const sortPosts = (postsToSort, option) => {
        const sortedPosts = [...postsToSort];
        if (option === 'mostRecent') {
            sortedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (option === 'mostLiked') {
            sortedPosts.sort((a, b) => b.likes.length - a.likes.length);
        }
        return sortedPosts;
    };

    const handleSortChange = (option) => {
        setSortingOption(option.value);
        const sortedPosts = sortPosts(posts, option.value);
        setPosts(sortedPosts);
    };

    const calculateComments = (comments) => {
        if (!comments || comments.length === 0) {
            return 'No comments';
        } else if (comments.length === 1) {
            return '1 comment';
        } else {
            return `${comments.length} comments`;
        }
    };

    const handleLike = async (postId, isComment = false, commentId = null) => {
        const post = posts.find(post => post._id === postId);
        console.log('likes:', post);

        if (isComment) {
            const comment = post.comments.find(comment => comment._id === commentId);

            if (comment.likes && comment.likes.includes(userId)) {
                comment.likes = comment.likes.filter(id => id !== userId);
            } else {
                comment.likes = comment.likes ? [...comment.likes, userId] : [userId];
            }

            try {
                const response = await fetch('http://localhost:8000/api/hub/update-content', {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ contentId: commentId, likes: comment.likes }),
                });

                if (response.ok) {
                    console.log('Comment updated');
                } else {
                    console.error('Error updating comment');
                }
            } catch (error) {
                console.error('Error updating content:', error);
            }

            // Trigger animation
            const heartIcon = document.querySelector(`#heart-icon-comment-${comment._id}`);
            heartIcon.classList.remove('animate');
            void heartIcon.offsetWidth;
            heartIcon.classList.add('animate');
        } else {
            if (post.likes && post.likes.includes(userId)) {
                post.likes = post.likes.filter(id => id !== userId);
            } else {
                post.likes = post.likes ? [...post.likes, userId] : [userId];
            }

            try {
                const response = await fetch('http://localhost:8000/api/hub/update-content', {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ contentId: postId, likes: post.likes }),
                });

                if (response.ok) {
                    console.log('Post updated');
                } else {
                    console.error('Error updating post');
                }
            } catch (error) {
                console.error('Error updating content:', error);
            }

            // Trigger animation
            const heartIcon = document.querySelector(`#heart-icon-post-${post._id}`);
            heartIcon.classList.remove('animate');
            void heartIcon.offsetWidth;
            heartIcon.classList.add('animate');
        }

        setPosts(posts.map(post => {
            if (post._id === postId) {
                if (isComment) {
                    post.comments = post.comments.map(comment => {
                        if (comment._id === commentId) {
                            return { ...comment };
                        }
                        return comment;
                    });
                } else {
                    return { ...post };
                }
            }
            return post;
        }));
    };

    const handleComments = (postId) => {
        setSelectedPostId(selectedPostId === postId ? null : postId);
    };

    const handleShare = (post) => {
        const shareOptions = [
            { name: 'WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(post.content)}` },
            { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(post.content)}` },
            { name: 'X (Twitter)', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}&url=${encodeURIComponent(window.location.href)}` },
        ];
    
        return (
            <div className="share-options">
                {shareOptions.map(option => (
                    <button
                        key={option.name}
                        className="share-button"
                        onClick={() => window.open(option.url, '_blank')}
                    >
                        Share on {option.name}
                    </button>
                ))}
            </div>
        );
    };

    const toggleModal = (post = null) => {
        setShowShare(!showShare);
        setSharePost(post);
    };

    const sortingOptions = [
        {value: 'mostRecent', label: 'Most Recent'},
        {value: 'mostLiked', label: 'Most Liked'}
    ];

    const isLiked = (item) => {
        return item.likes.includes(userId);
    };

    const handleNewContent = async (isComment = false) => {
        if (!isComment){
            if (newPostText.trim() === '') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Post cannot be empty',
                    customClass: {
                        confirmButton: 'button-alert',
                    },
                });
                return;
            }

            const newPost = {
                userId: userId,
                text: newPostText,
            };
    
            try {
                const response = await fetch('http://localhost:8000/api/hub/new-post', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newPost),
                });
    
                if (response.ok) {
                    const data = await response.json();
                    console.log('New post:', data.post);
                    fetchPosts();
                    setNewPostText('');
                } else {
                    console.error('Error posting');
                }
            } catch (error) {
                console.error('Error posting:', error);
            }
        } else {
            if (newCommentText.trim() === '') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Comment cannot be empty',
                    customClass: {
                        confirmButton: 'button-alert',
                    },
                });
                return;
            }
    
            const newComment = {
                userId: userId,
                text: newCommentText,
                postId: selectedPostId,
            };

            try {
                const response = await fetch('http://localhost:8000/api/hub/new-comment', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newComment),
                });
    
                if (response.ok) {
                    const data = await response.json();
                    console.log('New comment:', data.comment);
                    fetchPosts();
                    setNewCommentText('');
                } else {
                    console.error('Error commenting');
                }
            } catch (error) {
                console.error('Error commenting:', error);
            }
        }
    };

    return (
        <>
            {loading ? (
                <div className="loading-page loading-page-dark">
                    <div className="spinner"></div>
                    <p>Loading, please wait...</p>
                </div>
            ) : (
                <>
                    <div className="new-post">
                        <textarea
                            placeholder="What's on your mind?"
                            value={newPostText}
                            onChange={(e) => setNewPostText(e.target.value)}
                        />
                        <button className="btn btn-main" onClick={() => handleNewContent()}>Post</button>
                    </div>
                    <div className="posts-list">
                        <div className="sorting-options">
                            <label htmlFor="sorting">Sort by: </label>
                            <Select
                                id="sorting"
                                value={sortingOption}
                                onChange={handleSortChange}
                                options={sortingOptions}
                                isSearchable={false}
                            />
                        </div>
                        {posts && posts.length > 0 ? (
                            <>
                                {postsToShow.map((post) => (
                                    <div key={post._id} className="post">
                                        <div className="post-title">
                                            <h3>{post.author.username}</h3>
                                            <p>{calculateTime(post.date)}</p>
                                        </div>
                                        <p>{post.text}</p>
                                        <div className="post-functions">
                                            <span className={isLiked(post) ? 'liked' : ''} onClick={() => handleLike(post._id)}>
                                                {post.likes ? post.likes.length : 0}
                                                <img
                                                    id={`heart-icon-post-${post._id}`}
                                                    src={isLiked(post) ? iconHeartFull : iconHeartEmpty}
                                                    alt="like"
                                                    className="heart-icon"
                                                />
                                            </span>
                                            <span onClick={() => handleComments(post._id)}>{calculateComments(post.comments)}</span>
                                            <span onClick={() => toggleModal(post)}>share</span>
                                        </div>
                                        <div className={`post-comments ${selectedPostId === post._id ? 'show' : ''}`}>
                                            <div className="new-comment">
                                                <textarea
                                                    placeholder="comment"
                                                    value={newCommentText}
                                                    onChange={(e) => setNewCommentText(e.target.value)}
                                                />
                                                <button className="btn btn-main" onClick={() => handleNewContent(true)}>Post</button>
                                            </div>
                                            {post.comments.map((comment) => (
                                                <div key={comment._id} className="comment">
                                                    <div className="comment-title">
                                                        <h4>{comment.author.username}</h4>
                                                        <p>{calculateTime(comment.date)}</p>
                                                    </div>
                                                    <p>{comment.text}</p>
                                                    <span className={isLiked(comment) ? 'liked' : ''} onClick={() => handleLike(post._id, true, comment._id)}>
                                                        {comment.likes ? comment.likes.length : 0}
                                                        <img
                                                            id={`heart-icon-comment-${comment._id}`}
                                                            src={isLiked(comment) ? iconHeartFull : iconHeartEmpty}
                                                            alt="like"
                                                            className="heart-icon"
                                                        />
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {visiblePosts < posts.length && (
                                    <button className="load-more-btn" onClick={loadPosts}>
                                        Load more
                                    </button>
                                )}
                            </>
                        ) : (
                            <p>No posts to show</p>
                        )}
                    </div>
                    {showShare && (
                        <div className="modal-overlay" onClick={() => toggleModal()}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <span className="close" onClick={() => toggleModal()}>&times;</span>
                                <h3>Share this post</h3>
                                {sharePost && handleShare(sharePost)}
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    )
};

export default Hub;