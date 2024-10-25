import React, { useState } from 'react';
import iconSearch from './media/search.svg';
import iconCross from './media/cross.svg';

function SpotifySearch() {
  const [uri, setUri] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [songSelected, setSongSelected] = useState(false);

  const exitSong = () => {
    setSongSelected(false);
    setUri('');
    setEmbedUrl('');
  }

  
  const extractSpotifyId = (input) => {
    const regexSong = /(?:spotify:track:|https:\/\/open\.spotify\.com\/track\/)([a-zA-Z0-9]+)/;
    const regexPlaylist = /(?:spotify:playlist:|https:\/\/open\.spotify\.com\/playlist\/)([a-zA-Z0-9]+)/;
    
    const matchSong = input.match(regexSong);
    const matchPlaylist = input.match(regexPlaylist);

    if (matchSong) {
      return [1,matchSong[1]];
    }
    if (matchPlaylist) {
      return [2,matchPlaylist[1]];
    }
    return null;
  };

  const searchTrack = (e) => {
    e.preventDefault();

    const trackId = extractSpotifyId(uri);
    
    if (trackId) {
      if (trackId[0] === 1) {
        setEmbedUrl(`https://open.spotify.com/embed/track/${trackId[1]}`);
        setSongSelected(true);
      }
      else if (trackId[0] === 2) {
        setEmbedUrl(`https://open.spotify.com/embed/playlist/${trackId[1]}`);
        setSongSelected(true);
      }
      else {
        alert('Invalid URL 1');
      }
    } else {
      alert('Invalid URL 2');
    }

  };



  return (
    <>
      {songSelected ? (
        <div className='songSpotify'>
          <iframe 
            src={embedUrl} 
            width="100%" height="152" frameborder="0"
            allowFullScreen 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy">
          </iframe>
          <button onClick={() => exitSong()} className='btnCross'>
            <img src={iconCross} alt="Cross" className='icon'/>
          </button>
        </div>
      ) : (
        <div className='selectSpotify'>
          <h2>Choose a bit Music to study with</h2>
          <form onSubmit={searchTrack}>
            <input 
              type="text"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              placeholder="Cerca una canzone"
            />
            <button type="submit" className='btnSearch'>
                <img src={iconSearch} alt="Search" className='icon'/>
            </button>
          </form>
        </div>
      )}


   </>
  );
}

export default SpotifySearch;

