import React, { useState, useEffect, useContext } from 'react';

import '../../styles/Forum.css';
import { useForumContext } from '../../contexts/ForumContext';
import { AuthContext } from '../../contexts/AuthContext';
import PostInput from './PostInput';
import PostsList from './PostsList';

import { NewSwal } from '../../utils/swalUtils';
import { apiService } from '../../services/apiService';
import { bufferToBase64 } from '../../utils/utils';


const Forum = () => {
    const { user } = useContext(AuthContext);
    const { setPosts, inputImage, setInputImage, setShowMap, latitude, longitude, newCommentText, setNewCommentText, newPostText, setNewPostText, selectedPostId } = useForumContext();

    const handleNewContent = async (isComment = false) => {
        if (!isComment) {
            if (newPostText.trim() === '') {
                NewSwal.fire({icon: 'error', title: 'Error', text: 'Post cannot be empty'});
                return;
            }

            const newPost = new FormData();
            newPost.append('text', newPostText);

            if (inputImage != null) newPost.append('image', document.getElementById('imageInput').files[0]);

            if (latitude && longitude) {
                newPost.append('latitude', latitude);
                newPost.append('longitude', longitude);
            }

            const response = await apiService('/forum/post', 'POST', newPost);
            if (response.success) {
                setNewPostText('');
                setInputImage(null);
                setShowMap(false);
                fetchPosts();
            } else console.error('Error posting:', response);
        } else {
            if (newCommentText.trim() === '') {
                NewSwal.fire({icon: 'error', title: 'Error', text: 'Post cannot be empty'});
                return; 
            }

            const newComment = {
                text: newCommentText,
                postId: selectedPostId,
            };

            const response = await apiService(`/forum/${selectedPostId}/comment`, 'POST', newComment);
    
            if (response.success) {
                setNewCommentText('');
                fetchPosts();
            } else console.error('Error commenting');
        }
    };

    const fetchPosts = async () => {
        const response = await apiService('/forum/posts');
        console.log('Posts:', response);
        if (response.success && response.posts.length > 0) {
            const transformedPosts = await Promise.all(response.posts.map(async (post) => {
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
            }));

            setPosts(transformedPosts);
        } else setPosts([]);
    }

    useEffect(() => {
        fetchPosts();
    }, [user?._id]);

    return (
        <div className='d-flex flex-column w-100 align-items-center forum'>
            <PostInput handleNewContent={handleNewContent} />
            <PostsList handleNewContent={handleNewContent} />
        </div>
    );
};

export default Forum;