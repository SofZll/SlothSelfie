import React, { useState, useEffect } from "react";
import Select from 'react-select';
import "./css/Forum.css";
import iconHeartEmpty from "./media/heartEmpty.svg";
import iconHeartFull from "./media/heartFull.svg";
import image from "./media/image.svg";
import gif from "./media/gif.svg";
//import video from "./media/video.svg";
import maps from "./media/maps.svg";
import camera from "./media/camera.svg";
import { calculateTime, sortElements} from "./globalFunctions";
import { NewSwal } from './utils/swalUtils';
import MapPreview from "./pages/Forum/MapPreview";

function ForumFunction({ username }) {
    
    const [newCommentText, setNewCommentText] = useState('');
    const [selectedPostId, setSelectedPostId] = useState(null);
    
    const [sharePost, setSharePost] = useState(null);
    const [showShare, setShowShare] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    const [inputGif, setInputGif] = useState(null);

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
    }, []);

    useEffect(() => {
        const sortedPosts = sortElements(posts, sortingOption.value);
        setPosts(sortedPosts);
    }, [sortingOption]);

    const bufferToBase64 = (buffer) => {
        const binary = Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join('');
        return btoa(binary);
    };

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/forum/posts', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok){
                const data = await response.json();

                const processedPosts = data.posts.map(post => {
                    if (post.author.image?.data?.data) {
                        const buffer = post.author.image.data.data;
                        const base64Image = `data:${post.author.image.contentType};base64,${bufferToBase64(buffer)}`;
                        post.author.imageUrl = base64Image;
                    }
                    if (post.image?.data?.data) {
                        const buffer = post.image.data.data;
                        const base64Image = `data:${post.image.contentType};base64,${bufferToBase64(buffer)}`;
                        post.image = base64Image;
                    }
                    return post;
                });

                const sortedPosts = sortElements(processedPosts, sortingOption.value);
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

    const handleSortChange = (option) => {
        setSortingOption(option);
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

    const handleNewContent = async (isComment = false) => {
        if (!isComment){
            if (newPostText.trim() === '') {
                NewSwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Post cannot be empty',
                    customClass: {
                        confirmButton: 'button-alert',
                    },
                });
                return;
            }


            const newPost = new FormData();
            newPost.append('userId', userId);
            newPost.append('text', newPostText);
            if (inputImage != null) {
                newPost.append('image', document.getElementById('imageInput').files[0]);
                console.log('Image:', document.getElementById('imageInput').files[0]);
            }

            if (latitude && longitude) {
                newPost.append('latitude', latitude);
                newPost.append('longitude', longitude);
            }

            try {
                const response = await fetch('http://localhost:8000/api/forum/new-post', {
                    method: 'POST',
                    credentials: 'include',
                    body: newPost,
                });
    
                if (response.ok) {
                    const data = await response.json();
                    console.log('New post:', data.post);
                    fetchPosts();
                    setNewPostText('');
                    setInputImage(null);
                    setShowMap(false);
                } else {
                    console.error('Error posting');
                }
            } catch (error) {
                console.error('Error posting:', error);
            }
        } else {
            if (newCommentText.trim() === '') {
                NewSwal.fire({
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
                const response = await fetch('http://localhost:8000/api/forum/new-comment', {
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
                        <div className={`post-text ${inputImage ? "bigger" : ""} ${showMap ? "bigger2" : ""}`}>
                            <textarea
                                placeholder="What's on your mind?"
                                value={newPostText}
                                onChange={(e) => setNewPostText(e.target.value)}
                            />
                            {inputImage && (
                                <>
                                    <img className="input-image" src={inputImage} alt="inputImage" />
                                    <span className="delete-image" onClick={() => {setInputImage(null); setChosen(false);}}>&times;</span>
                                </>
                            )}
                            {showMap && latitude && longitude && (
                                <>
                                    <a href={`https://www.google.com/maps?q=${latitude},${longitude}`} className="link-map" target="_blank" rel="noopener noreferrer">Open on Google maps</a>
                                    <MapPreview center={center} />
                                    <span className="delete-map" onClick={() => {setShowMap(false); setChosen(false);}}>&times;</span>
                                </>
                            )}
                            <div className="post-input">
                                <img className="small-img" src={camera} alt="camera" onClick={() => !chosen && cameraClick()} />
                                <input
                                    id="cameraInput"
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment" 
                                    onChange={(e) => inputChange(e, setInputImage)}
                                    style={{ display: 'none' }}
                                />
                                <img className="smaller-img" src={image} alt="inputImage2" onClick={() => !chosen && imageClick()} />
                                <input
                                    id="imageInput"
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => inputChange(e, setInputImage)}
                                    style={{ display: 'none' }}
                                />
                                <img className="small-img"src={gif} alt="gif" onClick={() => !chosen && gifClick()} />
                                {/* da implementare */}
                                <img className="smaller-img" src={maps} alt="maps" onClick={() => !chosen && mapsClick()} />
                            </div>
                        </div>
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
                                classNamePrefix="custom-select"
                            />
                        </div>
                        {posts && posts.length > 0 ? (
                            <>
                                {postsToShow.map((post) => (
                                    <div key={post._id} className="post">
                                        <div className="post-title">
                                            <div className="user-info">
                                                <img src={post.author.imageUrl} alt="user" />
                                                <h3>{post.author.username}</h3>
                                            </div>
                                            <p>{calculateTime(post.date)}</p>
                                        </div>
                                        <p>{post.text}</p>
                                        {post.image && (
                                            <img className="post-image" src={post.image} alt="post" />
                                        )}
                                        {post.location.latitude && post.location.longitude && (
                                            <>
                                                <a href={`https://www.google.com/maps?q=${post.location.latitude},${post.location.longitude}`} className="link-map" target="_blank" rel="noopener noreferrer">Open on Google maps</a>
                                                <MapPreview center={[post.location.latitude, post.location.longitude]} id={post._id} isPost="true" />
                                            </>
                                        )}
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

export default ForumFunction;