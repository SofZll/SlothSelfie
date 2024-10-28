import React, { useState, useEffect } from "react";
import Select from 'react-select';
import "./css/Hub.css";
import iconHeartEmpty from "./media/heartEmpty.svg";
import iconHeartFull from "./media/heartFull.svg";

/*
info per notifiche
titolo colore bianco sporco, background #555b6e
background messaggio #e7e7e7
*/

function Hub({ username="kaori"}) {
    //const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [newComment, setNewComment] = useState('');
    const [times, setTimes] = useState([]);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [sortingOption, setSortingOption] = useState('mostRecent');
    const [sharePost, setSharePost] = useState(null);
    const [showShare, setShowShare] = useState(false);

    const [posts, setPosts] = useState([
        {
            id: 1,
            username: 'Kevin',
            content: 'This is a post!',
            date: '2024-10-22',
            time: '12:00',
            likes: 0,
            likedBy: [],
            comments: [
                {
                    id: 1,
                    username: 'Alice',
                    content: 'Great post!',
                    date: '2024-10-22',
                    time: '12:30',
                    likes: 3,
                    likedBy: [],
                },
                {
                    id: 2,
                    username: 'Alice',
                    content: 'Great post!',
                    date: '2024-10-22',
                    time: '12:30',
                    likes: 3,
                    likedBy: [],
                }
            ]
        },
        {
            id: 2,
            username: 'Giorgio',
            content: 'This is another post!',
            date: '2023-10-22',
            time: '12:01',
            likes: 5,
            likedBy: [],
            comments: []
        },
        {
            id: 3,
            username: 'Alice',
            content: 'Just finished a great book!',
            date: '2024-10-21',
            time: '14:30',
            likes: 21,
            likedBy: [],
            comments: []
        },
        {
            id: 4,
            username: 'Bob',
            content: 'Loving the new season of my favorite show!',
            date: '2024-10-20',
            time: '16:45',
            likes: 7,
            likedBy: [],
            comments: []
        },
        {
            id: 5,
            username: 'Charlie',
            content: 'Had an amazing workout today!',
            date: '2024-10-19',
            time: '09:15',
            likes: 0,
            likedBy: [],
            comments: []
        },
        {
            id: 6,
            username: 'Diana',
            content: 'Baking some cookies this afternoon!',
            date: '2024-10-18',
            time: '11:00',
            likes: 0,
            likedBy: [],
            comments: []
        },
        {
            id: 7,
            username: 'Eve',
            content: 'Exploring a new hiking trail!',
            date: '2024-10-17',
            time: '08:45',
            likes: 0,
            likedBy: [],
            comments: []
        },
        {
            id: 8,
            username: 'Frank',
            content: 'Just watched an incredible movie!',
            date: '2024-10-16',
            time: '20:00',
            likes: 0,
            likedBy: [],
            comments: []
        },
        {
            id: 9,
            username: 'Grace',
            content: 'Learning to play the guitar!',
            date: '2024-10-15',
            time: '10:30',
            likes: 0,
            likedBy: [],
            comments: []
        },
        {
            id: 10,
            username: 'Hank',
            content: 'Enjoying a relaxing day at the beach!',
            date: '2024-10-14',
            time: '13:00',
            likes: 0,
            likedBy: [],
            comments: []
        },
        {
            id: 11,
            username: 'Ivy',
            content: 'Trying out a new recipe tonight!',
            date: '2024-10-13',
            time: '18:15',
            likes: 0,
            likedBy: [],
            comments: []
        },
        {
            id: 12,
            username: 'Jack',
            content: 'Just finished a marathon!',
            date: '2024-10-12',
            time: '07:00',
            likes: 0,
            likedBy: [],
            comments: []
        }
    ]);

    useEffect(() => {
        sortPosts();
    }, [sortingOption]);

    const sortPosts = () => {
        const sortedPosts = [...posts];
        if (sortingOption === 'mostRecent') {
            sortedPosts.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateB - dateA;
            });
        } else if (sortingOption === 'mostLiked') {
            sortedPosts.sort((a, b) => b.likes - a.likes);
        }
        setPosts(sortedPosts);
    };

    const handleSortChange = (option) => {
        setSortingOption(option.value);
        sortPosts();
    };

    const calculateTime = (postTime, postDate) => {
        const currentTime = new Date();
        const [hours, minutes] = postTime.split(':');
        const tmp = new Date(postDate);
        tmp.setHours(hours);
        tmp.setMinutes(minutes);
        tmp.setSeconds(0);

        const diff = currentTime - tmp;
        const minutesDiff = Math.floor(diff / 60000);
        const hoursDiff = Math.floor(minutesDiff / 60);
        const daysDiff = Math.floor(hoursDiff / 24);

        if (daysDiff > 0) {
            return `${daysDiff} days ago`;
        } else if (hoursDiff > 0) {
            return `${hoursDiff} hours ago`;
        } else {
            return `${minutesDiff} minutes ago`;
        }
    };

    const calculateComments = (comments) => {
        if (comments.length === 0) {
            return 'No comments';
        } else if (comments.length === 1) {
            return '1 comment';
        } else {
            return `${comments.length} comments`;
        }
    };

    const handleLike = (postId, isComment = false, commentId = null) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                if (isComment) {
                    post.comments = post.comments.map(comment => {
                        if (comment.id === commentId) {
                            if (comment.likedBy.includes(username)) {
                                comment.likes--;
                                comment.likedBy = comment.likedBy.filter(user => user !== username);
                            } else {
                                comment.likes++;
                                comment.likedBy.push(username);
                            }
                            // Trigger animation
                            const heartIcon = document.querySelector(`#heart-icon-comment-${comment.id}`);
                            heartIcon.classList.remove('animate');
                            void heartIcon.offsetWidth;
                            heartIcon.classList.add('animate');
                        }
                        return comment;
                    });
                } else {
                    if (post.likedBy.includes(username)) {
                        post.likes--;
                        post.likedBy = post.likedBy.filter(user => user !== username);
                    } else {
                        post.likes++;
                        post.likedBy.push(username);
                    }
                    // Trigger animation
                    const heartIcon = document.querySelector(`#heart-icon-post-${post.id}`);
                    heartIcon.classList.remove('animate');
                    void heartIcon.offsetWidth;
                    heartIcon.classList.add('animate');
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
        return item.likedBy.includes(username);
    }

    /*
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`/api/hub/posts`);
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);
    */

    return (
        <>
            <div className="new-post">
                <textarea
                    placeholder="What's on your mind?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                />
                <button className="btn">Post</button>
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
                {posts.map((post) => (
                    <>
                        <div key={post.id} className="post">
                            <div className="post-title">
                                <h3>{post.username}</h3>
                                <p>{calculateTime(post.time, post.date)}</p>
                            </div>
                            <p>{post.content}</p>
                            <div className="post-functions">
                                <span className={isLiked(post) ? 'liked' : ''} onClick={() => handleLike(post.id)}>
                                    {post.likes}
                                    <img
                                        id={`heart-icon-post-${post.id}`}
                                        src={isLiked(post) ? iconHeartFull : iconHeartEmpty}
                                        alt="like"
                                        className="heart-icon"
                                    />
                                </span>
                                <span onClick={() => handleComments(post.id)}>{calculateComments(post.comments)}</span>
                                <span onClick={() => toggleModal(post)}>share</span>
                            </div>
                        </div>
                        <div className={`post-comments ${selectedPostId === post.id ? 'show' : ''}`}>
                            <div className="new-comment">
                                <textarea
                                    placeholder="comment"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button className="btn">Post</button>
                            </div>
                            {post.comments.map((comment) => (
                                <div key={comment.id} className="comment">
                                    <div className="comment-title">
                                        <h4>{comment.username}</h4>
                                        <p>{calculateTime(comment.time, comment.date)}</p>
                                    </div>
                                    <p>{comment.content}</p>
                                    <span className={isLiked(comment) ? 'liked' : ''} onClick={() => handleLike(post.id, true, comment.id)}>
                                        {comment.likes}
                                        <img
                                            id={`heart-icon-comment-${comment.id}`}
                                            src={isLiked(comment) ? iconHeartFull : iconHeartEmpty}
                                            alt="like"
                                            className="heart-icon"
                                        />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                ))}
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
    )
};

export default Hub;