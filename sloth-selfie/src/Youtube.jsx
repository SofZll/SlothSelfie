import React, { useState } from 'react';
import axios from 'axios';
import iconSearch from './media/search.svg';
import iconCross from './media/cross.svg';

const Youtube = () => {
  const [videoSelected, setVideoSelected] = useState(false);
  const [link, setLink] = useState('');
  const [reduced, setReduced] = useState(false);
  const API_KEY = 'AIzaSyBuHaqwn5504921fUmkd0b3qQy2EWUmae8';
  const [videoTitle, setVideoTitle] = useState('');

  const exitSong = () => {
    setVideoSelected(false);
    setLink('');
    setVideoTitle('');
  }

  const extractYoutubeId = (input) => {
    const regexURL = /(?:https:\/\/www\.youtube\.com\/watch\?v=|https:\/\/youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const regexPlaylist = /(?:https:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/;
    
    const matchURL = input.match(regexURL);
    const matchPlaylist = input.match(regexPlaylist);

    if (matchURL) {
      return [1,matchURL[1]];
    }
    if (matchPlaylist) {
      return [2,matchPlaylist[1]];
    }
    return null;
  }

  const searchTrack = async (e) => {
    e.preventDefault();

    const videoId = extractYoutubeId(link);

    if (videoId) {
      setVideoSelected(true);
      if (videoId[0] === 1) {
        setLink(`https://www.youtube.com/embed/${videoId[1]}`);
        /*setVideoTitle(response.data.items[0].snippet.title);*/
      }
      else if (videoId[0] === 2) {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${videoId[1]}&key=${API_KEY}`);
        const video = response.data.items[0].snippet.resourceId.videoId;
        setLink(`https://www.youtube.com/embed/${video}`);
        /*setVideoTitle(response.data.items[0].snippet.title);*/
      }
      else {
        alert('Invalid URL 1');
      }
    }
    else {
      alert('Invalid URL 2');
    }
  }



  return (
    <div className='youtube'>
      {videoSelected ? (
        <div className='videoYoutube'>
          <div className='titleYoutubeVideo'>
            <h2>Your Youtube Video</h2>
            <button onClick={() => exitSong()} className='btnCross'>
              <img src={iconCross} alt="Cross" className='icon'/>
            </button>
          </div>
          {reduced ? (
            <></>
            ) : (
            <iframe
              src={link}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )}

          
        </div>
        ) : (
          <div className='searchYoutube'>
            <h2>Choose a video to study with</h2>
            <form onSubmit={searchTrack}>
              <input 
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Enter a playlist link or a video URL"
              />
              <button type="submit" className='btnSearch'>
                  <img src={iconSearch} alt="Search" className='icon'/>
              </button>
            </form>
          </div>
      )}

    </div>
  );
};

export default Youtube;
