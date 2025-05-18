import React, { useEffect, useState } from 'react';
import { Camera, Image, MapPin } from 'lucide-react';

import MapPreview from './MapPreview';
import GeolocalizationInput from '../../components/GeolocalizationInput';
import { useForumContext } from '../../contexts/ForumContext';

const PostInput = ({ handleNewContent }) => {
    const { newPostText, setNewPostText, inputImage, setInputImage, showMap, setShowMap, longitude, setLongitude, latitude, setLatitude } = useForumContext();

    const [chosen, setChosen] = useState(false);
    const [showGeo, setShowGeo] = useState(false);
    const [inputMap, setInputMap] = useState(null);
    const center = [latitude, longitude];

    const cameraClick = () => {
        const cameraInput = document.getElementById('cameraInput');
        cameraInput.click();
        setChosen(true);
    }

    const imageClick = () => {
        const imageInput = document.getElementById('imageInput');
        imageInput.click();
        setChosen(true);
    }

    const mapsClick = () => setShowGeo(!showGeo);
    
    const inputChange = (event, setState) => {
        const file = event.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            setState(fileUrl);
        }
    };

    useEffect(() => {
        if (inputMap) {
            setShowMap(true);
            setLatitude(inputMap[0]);
            setLongitude(inputMap[1]);
        }
    }, [inputMap]);

    return (
        <div className='d-flex align-items-center justify-content-center position-relative flex-row w-100 px-1 gap-2 new-post'>
            <div className={`position-relative d-flex flex-column post-text ${inputImage ? 'bigger' : ''} ${showMap ? 'bigger2' : ''}`}>
                <textarea placeholder="What's on your mind?" value={newPostText} onChange={(e) => setNewPostText(e.target.value)} />
                {inputImage && (
                    <div className='position-relative'>
                        <img className='position-relative d-flex input-image' src={inputImage} alt='inputImage' />
                        <span className='delete-image' onClick={() => {setInputImage(null); setChosen(false);}}>&times;</span>
                    </div>
                )}
                <GeolocalizationInput showGeo={showGeo} setShowGeo={setShowGeo} setInputMap={setInputMap} />
                {showMap && latitude && longitude && (
                    <>
                        {latitude && longitude && <MapPreview center={center} />}
                        <span className='delete-map' onClick={() => {setShowMap(false); setChosen(false);}}>&times;</span>
                    </>
                )}
                <div className='position-absolute d-flex justify-content-start align-items-center flex-row gap-3 post-input'>
                    <span role="button" aria-label="Choose a picture" title="Choose a picture">
                        <Camera className='input-icon' onClick={() => !chosen && cameraClick()} />
                    </span>
                    <input id='cameraInput' type='file' accept='image/*' capture='environment' onChange={(e) => inputChange(e, setInputImage)} style={{ display: 'none' }} />
                    <span role="button" aria-label="Choose an image" title="Choose an image">
                        <Image className='input-icon' onClick={() => !chosen && imageClick()} />
                    </span>
                    <input id='imageInput' type='file' accept='image/*' onChange={(e) => inputChange(e, setInputImage)} style={{ display: 'none' }} />
                    <span role="button" aria-label="Select a position" title="Select a position">
                        <MapPin className='input-icon' onClick={() => !chosen && mapsClick()} />
                    </span>
                </div>
            </div>
            <button type='button' aria-label='Post' className='button-clean green' onClick={() => {handleNewContent(); setChosen(false)}}>Post</button>
        </div>
    )
}

export default PostInput;