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
  };
  
  
  const extractSpotifyId = (input) => {
    const regexSong = /(?:spotify:track:|https:\/\/open\.spotify\.com\/track\/)([a-zA-Z0-9]+)/;
    const regexIntlIt = /(?:https:\/\/open\.spotify\.com\/intl-it\/track\/)([a-zA-Z0-9]+)/;
    const regexPlaylist = /(?:spotify:playlist:|https:\/\/open\.spotify\.com\/playlist\/)([a-zA-Z0-9]+)/;
    const regexAlbum = /(?:spotify:album:|https:\/\/open\.spotify\.com\/album\/)([a-zA-Z0-9]+)/;
    const regexShow = /(?:spotify:show:|https:\/\/open\.spotify\.com\/show\/)([a-zA-Z0-9]+)/;
    const regexEpisode = /(?:spotify:episode:|https:\/\/open\.spotify\.com\/episode\/)([a-zA-Z0-9]+)/;
    const regexArtist = /(?:spotify:artist:|https:\/\/open\.spotify\.com\/artist\/)([a-zA-Z0-9]+)/;
    const regexIntlItArtist = /(?:https:\/\/open\.spotify\.com\/intl-it\/artist\/)([a-zA-Z0-9]+)/;
    
    const matchSong = input.match(regexSong);
    const matchIntlIt = input.match(regexIntlIt);
    const matchPlaylist = input.match(regexPlaylist);
    const matchAlbum = input.match(regexAlbum);
    const matchShow = input.match(regexShow);
    const matchEpisode = input.match(regexEpisode);
    const matchArtist = input.match(regexArtist);
    const matchIntlItArtist = input.match(regexIntlItArtist);

    if (matchSong) {
      return [1,matchSong[1]];
    }
    if (matchIntlIt) {
      return [2,matchIntlIt[1]];
    }
    if (matchPlaylist) {
      return [3,matchPlaylist[1]];
    }
    if (matchAlbum) {
      return [4,matchAlbum[1]];
    }
    if (matchShow) {
      return [5,matchShow[1]];
    }
    if (matchEpisode) {
      return [6,matchEpisode[1]];
    }
    if (matchArtist) {
      return [7,matchArtist[1]];
    }
    if (matchIntlItArtist) {
      return [8,matchIntlItArtist[1]];
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
        setEmbedUrl(`https://open.spotify.com/embed/track/${trackId[1]}`);
        setSongSelected(true);
      }
      else if (trackId[0] === 3) {
        setEmbedUrl(`https://open.spotify.com/embed/playlist/${trackId[1]}`);
        setSongSelected(true);
      }
      else if (trackId[0] === 4) {
        setEmbedUrl(`https://open.spotify.com/embed/album/${trackId[1]}`);
        setSongSelected(true);
      }
      else if (trackId[0] === 5) {
        setEmbedUrl(`https://open.spotify.com/embed/show/${trackId[1]}`);
        setSongSelected(true);
      }
      else if (trackId[0] === 6) {
        setEmbedUrl(`https://open.spotify.com/embed/episode/${trackId[1]}`);
        setSongSelected(true);
      }
      else if (trackId[0] === 7) {
        setEmbedUrl(`https://open.spotify.com/embed/artist/${trackId[1]}`);
        setSongSelected(true);
      }
      else if (trackId[0] === 8) {
        setEmbedUrl(`https://open.spotify.com/embed/artist/${trackId[1]}`);
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

