import React, { createContext, useContext, useState, useEffect } from 'react';

const ForumContext = createContext();

export const ForumProvider = ({ children }) => {
    const sortingOptions = [
        {value: 'mostRecent', label: 'Most Recent'},
        {value: 'mostLiked', label: 'Most Liked'}
    ];

    const [posts, setPosts] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [inputImage, setInputImage] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [newPostText, setNewPostText] = useState('');
    const [toggleModal, setToggleModal] = useState(false);
    const [sortingOption, setSortingOption] = useState(sortingOptions[0]);
    const [selectedPostId, setSelectedPostId] = useState(null);

    return (
        <ForumContext.Provider value={{
            posts,
            setPosts,
            newCommentText,
            setNewCommentText,
            newPostText,
            setNewPostText,
            sortingOption,
            setSortingOption,
            sortingOptions,
            inputImage,
            setInputImage,
            showMap,
            setShowMap,
            latitude,
            setLatitude,
            longitude,
            setLongitude,
            selectedPostId,
            setSelectedPostId,
            toggleModal,
            setToggleModal
        }}>
            {children}
        </ForumContext.Provider>
    );
}

export const useForumContext = () => {
    const context = useContext(ForumContext);
    return context;
};