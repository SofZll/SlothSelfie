import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import iconHeartEmpty from '../../assets/icons/heart-empty.svg';
import iconHeartFull from '../../assets/icons/heart-full.svg';

import { AuthContext } from '../../contexts/AuthContext';
import { TimeMachineContext } from '../../contexts/TimeMachineContext';
import { useChat } from '../../contexts/ChatContext';
import { useForumContext } from '../../contexts/ForumContext';
import MapPreview from './MapPreview';

import { calculateTime, useIsDesktop } from '../../utils/utils';
import { reverseAddress } from '../../utils/mapUtils';
import { apiService } from '../../services/apiService';
import ShareModal from '../../components/ShareModal';

const PostsList = ({ handleNewContent }) => {
    const { user } = useContext(AuthContext);
    const { getVirtualNow } = useContext(TimeMachineContext);
    const { posts, setPosts, newCommentText, setNewCommentText, sortingOption, sortingOptions, setSortingOption, selectedPostId, setSelectedPostId } = useForumContext();
    const { openChat } = useChat();

    const isDesktop = useIsDesktop();
    const location = useLocation();
    const [visiblePosts, setVisiblePosts] = useState(3);
    const [postAddresses, setPostAddresses] = useState({});
    const [openShareModal, setOpenShareModal] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const scrollToId = queryParams.get('id');
    const postRefs = useRef({});


    const isLiked = (item) => {return item.likes.includes(user._id)};

    const handleLike = async (postId, isComment = false, commentId = null) => {
        const post = posts.find(post => post._id === postId);

        let element, type;
        if (isComment) {
            const comment = post.comments.find(comment => comment._id === commentId);
            element = comment;
            type = 'comment';
        } else {
            element = post;
            type = 'post';
        }

        if (element.likes && element.likes.includes(user._id)) {
            element.likes = element.likes.filter(id => id !== user._id);
        } else {
            element.likes = element.likes ? [...element.likes, user._id] : [user._id];
        }

        const response = await apiService(`/forum/${element._id}`, 'PUT', { likes: element.likes });
        if (response.success) console.log('element updated');
        else console.log('Error updating element');

        const heartIcon = document.querySelector(`#heart-icon-${type}-${element._id}`);
        heartIcon.classList.remove('animate');
        void heartIcon.offsetWidth;
        heartIcon.classList.add('animate');

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

    const handleComments = (postId) => setSelectedPostId(selectedPostId === postId ? null : postId);

    const calculateComments = (comments) => {
        if (!comments || comments.length === 0) return 'No comments';
        else if (comments.length === 1) return '1 comment';
        else return `${comments.length} comments`;
    };

    const handleSorting = (option, posts) => {
        const postsCopy = [...posts];
    
        if (option === 'mostRecent') {
            return postsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (option === 'mostLiked') {
            return postsCopy.sort((a, b) => b.likes.length - a.likes.length);
        }
        return postsCopy;
    };

    const sortedPosts = handleSorting(sortingOption, posts);

    const loadPosts = () => {
        setVisiblePosts(visiblePosts + 3);
    };

    const postsToShow = sortedPosts.slice(0, visiblePosts);

    const getAddress = async (coordinates) => {
        const address = await reverseAddress(coordinates);
        return address;
    }

    const handleShare = (postId) => {
        const currentPath = `http://localhost:3000/forum`;
        const newPath = `${currentPath}#${postId}`;
        setOpenShareModal(newPath);
    }

    useEffect(() => {
        const fetchAddresses = async () => {
            const addresses = {};
            for (const post of posts) {
                if (post.location.latitude && post.location.longitude) {
                    const coordinates = [post.location.latitude, post.location.longitude];
                    const address = await getAddress(coordinates);
                    addresses[post._id] = address;
                }
            }
            setPostAddresses(addresses);
        };

        fetchAddresses();
    }, [posts]);

    useEffect(() => {
        const scrollToPostFromHash = async () => {
            const hash = window.location.hash?.substring(1);
            if (!hash) return;
    
            let retries = 10;
            while (retries > 0 && !document.getElementById(`post-${hash}`)) {
                const index = sortedPosts.findIndex(p => p._id === hash);
                if (index >= visiblePosts) {
                    setVisiblePosts(v => v + 3);
                }
                await new Promise(res => setTimeout(res, 100));
                retries--;
            }
    
            const el = document.getElementById(`post-${hash}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                setSelectedPostId(hash);
            }
        };
    
        scrollToPostFromHash();
    }, [visiblePosts, sortedPosts]);

    if (isDesktop === null) return null;

    return (
        <div className='w-100 pb-3 flex-column gap-3 posts-list'>
            <div className='d-flex justify-content-center gap-2 my-2'>
                <label className='m-0 d-flex align-items-center' htmlFor='sorting'>Sort by: </label>
                <select className='form-select form-select-sm' id='sorting' value={sortingOption} onChange={(e) => setSortingOption(e.target.value)}>
                    {sortingOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            {sortedPosts?.length > 0 ? (
                <>
                    {postsToShow.length > 0 ? (
                        postsToShow.map((post) => (
                            <div key={post._id} id={`post-${post._id}`} className='rounded-3 shadow-sm p-2 post' ref={(el) => (postRefs.current[post._id] = el)}>
                                <div className='post-title'>
                                    {isDesktop ? (
                                        <div className='d-flex align-items-center gap-2 author-link' role='button' onClick={() => openChat(post.author.username)}>
                                            <img src={post.author.imageUrl} alt='user' />
                                            <h3>{post.author.username}</h3>
                                        </div>
                                    ) : (
                                        <Link to={`/chat/${post.author.username}`} className="d-flex align-items-center gap-2 author-link">
                                            <img src={post.author.imageUrl} alt='user' />
                                            <h3>{post.author.username}</h3>
                                        </Link>
                                    )}
                                    <p>{calculateTime(post.createdAt, getVirtualNow)}</p>
                                </div>
                                <p>{post.text}</p>
                                {post.image && <img className='post-image' src={post.image} alt='post' />}
                                {post.location.latitude && post.location.longitude && (
                                    <div className='d-flex justify-content-center align-items-center gap-2 flex-column mt-2'>
                                        <a href={`https://www.google.com/maps?q=${post.location.latitude},${post.location.longitude}`} className='link-map' target='_blank' rel='noopener noreferrer'>{postAddresses[post._id] || 'Loading address...'}</a>
                                        <MapPreview center={[post.location.latitude, post.location.longitude]} id={post._id} isPost='true' />
                                    </div>
                                )}
                                <div className='post-functions'>
                                    <span role="button" aria-label="Like" title='Like' className={isLiked(post) ? 'liked' : ''} onClick={() => handleLike(post._id)}>
                                        {post.likes ? post.likes.length : 0}
                                        <img
                                            id={`heart-icon-post-${post._id}`}
                                            src={isLiked(post) ? iconHeartFull : iconHeartEmpty}
                                            alt='like'
                                            className='heart-icon'
                                        />
                                    </span>
                                    <span role="button" aria-label="Comments section" title='Comments section' onClick={() => handleComments(post._id)}>{calculateComments(post.comments)}</span>
                                    <span role="button" aria-label="Share" onClick={() => handleShare(post._id)} title='Share'>Share</span>
                                </div>
                                <div className={`d-flex flex-column gap-3 post-comments ${selectedPostId === post._id ? 'show' : ''}`}>
                                    <div className='d-flex justify-content-center align-items-center gap-2 new-comment'>
                                        <textarea
                                            placeholder='comment'
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                        />
                                        <button type='button' aria-label='Post' className='button-clean green' onClick={() => handleNewContent(true)}>Post</button>
                                    </div>
                                    {post.comments.map((comment) => (
                                        <div key={comment._id} className='rounded-3 px-3 py-2 shadow-sm comment'>
                                            <div className='comment-title'>
                                                <h4>{comment.author.username}</h4>
                                                <p>{calculateTime(comment.createdAt, getVirtualNow)}</p>
                                            </div>
                                            <p>{comment.text}</p>
                                            <span className={isLiked(comment) ? 'liked' : ''} onClick={() => handleLike(post._id, true, comment._id)}>
                                                {comment.likes ? comment.likes.length : 0}
                                                <img
                                                    id={`heart-icon-comment-${comment._id}`}
                                                    src={isLiked(comment) ? iconHeartFull : iconHeartEmpty}
                                                    alt='like'
                                                    className='heart-icon'
                                                />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No posts to show</p>
                    )}
                    {visiblePosts < posts.length && (
                        <button type='button' aria-label='load more' className='load-more-btn' onClick={loadPosts}>
                            Load more
                        </button>
                    )}
                </>
            ) : (
                <p>No posts to show</p>
            )}
            <ShareModal openShareModal={openShareModal} setOpenShareModal={setOpenShareModal} />
        </div>
    );
}

export default PostsList;