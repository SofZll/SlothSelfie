import React, { useState, useEffect } from "react";
import "./css/Hub.css";

/*
info per notifiche
titolo colore bianco sporco, background #555b6e
background messaggio #e7e7e7
*/

function Hub({ username }) {
    //const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [times, setTimes] = useState([]);
    const [showComments, setShowComments] = useState(false);

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
                    time: '12:30'
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
        const sortedPosts = [...posts].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}:00`);
            const dateB = new Date(`${b.date}T${b.time}:00`);
            return dateB - dateA;
        });
        setPosts(sortedPosts);
    }, []);


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

    const handleLike = () => {
        console.log('Like!');
    };

    const handleComments = () => {
        setShowComments(!showComments);
    };

    const handleShare = (post) => {
    };

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
                <button>Post</button>
            </div>
            <div className="posts-list">
                <h2>Posts</h2>
                {posts.map((post) => (
                    <div key={post.id} className="post">
                        <div className="post-title">
                            <h3>{post.username}</h3>
                            <p>{calculateTime(post.time, post.date)}</p>
                        </div>
                        <p>{post.content}</p>
                        <div className="post-functions">
                            <span onClick={handleLike}>{post.likes} likes</span>
                            <span onClick={handleComments}>{calculateComments(post.comments)}</span>
                            <span onClick={handleShare(post)}>share</span>
                        </div>
                        {showComments && (
                            <div className="post-comments">
                                {post.comments.map((comment) => (
                                    <div key={comment.id} className="comment">
                                        <div className="comment-title">
                                            <h4>{comment.username}</h4>
                                            <p>{calculateTime(comment.time, comment.date)}</p>
                                        </div>
                                        <p>{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    )
};

export default Hub;