import React, { useState, useEffect } from 'react';

import { useMusic } from '../../contexts/MusicContext';
import { usePomodoro } from '../../contexts/PomodoroContext';
import axios from 'axios';

import { AudioLines, X } from 'lucide-react';
import { NewSwal } from '../../utils/swalUtils';

const MusicPomodoro = () => {

    const { music, setMusic } = useMusic();
    const { resetPopUp } = usePomodoro();
    const [open, setOpen] = useState(false);
    const API_KEY = 'AIzaSyBuHaqwn5504921fUmkd0b3qQy2EWUmae8';
    const [accessToken, setAccessToken] = useState(null);
    const [tokenExpiry, setTokenExpiry] = useState(null);

    const extractYoutubeId = (input) => {
        const regexURL = /(?:https:\/\/www\.youtube\.com\/watch\?v=|https:\/\/youtu\.be\/)([a-zA-Z0-9_-]+)/;
        const regexPlaylist = /(?:https:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/;
        
        const matchURL = input.match(regexURL);
        const matchPlaylist = input.match(regexPlaylist);

        console.log('matchURL', matchURL);
    
        if (matchURL) return [1,matchURL[1]];
        else if (matchPlaylist) return [2,matchPlaylist[1]];
        else return null;
    }

    const searchYoutube = () => {
        const videoId = extractYoutubeId(music.url);

        console.log('videoId', videoId);
        if (videoId) {
            if (videoId[0] === 1) {
                axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId[1]}&key=${API_KEY}`)
                .then(response => {
                    const video = response.data.items[0].id;
                    const title = response.data.items[0].snippet.title;
                    setMusic({ ...music, link: `https://www.youtube.com/embed/${video}`, selected: true, search: false, url: '', title });
                })
                .catch(() => NewSwal.fire({ icon: 'error', title: 'Invalid URL', text: 'Please enter a valid Youtube URL'}));
            }
            else if (videoId[0] === 2) {
                axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${videoId[1]}&key=${API_KEY}`)
                    .then(response => {
                        const video = response.data.items[0].snippet.resourceId.videoId;
                        const title = response.data.items[0].snippet.title;
                        setMusic({ ...music, link: `https://www.youtube.com/embed/${video}`, selected: true, search: false, url: '' , title });
                    })
                    .catch(() => NewSwal.fire({ icon: 'error', title: 'Invalid URL', text: 'Please enter a valid Youtube URL'}));
            } else NewSwal.fire({ icon: 'error', title: 'Invalid URL', text: 'Please enter a valid Youtube URL'});
        } else NewSwal.fire({ icon: 'error', title: 'Invalid URL', text: 'Please enter a valid Youtube URL'});
    }

    const getSpotifyToken = async () => {
        try {
            const clientId = '879b1c64cc8848ed85b7803f760d0938';
            const clientSecret = '0cb63378ee0b4c2baf369bd50c024388';
        
            const response = await axios.post('https://accounts.spotify.com/api/token',
                new URLSearchParams({ grant_type: 'client_credentials' }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                    }
                }
            );

            const expiryTime = new Date().getTime() + (response.data.expires_in * 1000);
            setTokenExpiry(expiryTime);

            return response.data.access_token;
        } catch (error) {
            console.error('Error fetching Spotify token:', error);
            NewSwal.fire({ icon: 'error', title: 'Spotify Error', text: 'Failed to fetch Spotify token' });
        }
    };

    const ensureValidToken = async () => {
        if (!accessToken || (tokenExpiry && new Date().getTime() > tokenExpiry)) {
            const newToken = await getSpotifyToken();
            setAccessToken(newToken);
            return newToken;
        }
        return accessToken;
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
    
        if (matchSong) return [1,matchSong[1]];
        else if (matchIntlIt) return [2,matchIntlIt[1]];
        else if (matchPlaylist) return [3,matchPlaylist[1]];
        else if (matchAlbum) return [4,matchAlbum[1]];
        else if (matchShow) return [5,matchShow[1]];
        else if (matchEpisode) return [6,matchEpisode[1]];
        else if (matchArtist) return [7,matchArtist[1]];
        else if (matchIntlItArtist) return [8,matchIntlItArtist[1]];
        else return null;
    };

    const searchSpotify = async () => {

        try {
            const validToken = await ensureValidToken();

            const trackId = extractSpotifyId(music.url);

            if (!trackId) {
                return NewSwal.fire({ icon: 'error', title: 'Invalid URL', text: 'Please enter a valid Spotify URL' });
            }
    
            let type = "";
            switch (trackId[0]) {
                case 1:
                case 2:
                    type = "track";
                    break;
                case 3:
                    type = "playlist";
                    break;
                case 4:
                    type = "album";
                    break;
                case 5:
                    type = "show";
                    break;
                case 6:
                    type = "episode";
                    break;
                case 7:
                case 8:
                    type = "artist";
                    break;
                default:
                    return NewSwal.fire({ icon: 'error', title: 'Invalid Type' });
            }
            
            const response = await axios.get(`https://api.spotify.com/v1/${type}s/${trackId[1]}`, {
                headers: {
                    Authorization: `Bearer ${validToken}`,
                },
                params: { market: 'IT' }
            });
    
            let title = "";
    
            switch (type) {
                case "track":
                    title = response.data.name + " - " + response.data.artists.map(a => a.name).join(", ");
                    break;
                case "playlist":
                case "album":
                    title = response.data.name;
                    break;
                case "artist":
                    title = response.data.name;
                    break;
                case "show":
                case "episode":
                    title = response.data.name;
                    break;
                default:
                    return NewSwal.fire({ icon: 'error', title: 'Invalid Type' });
            }
    
            setMusic({
                ...music,
                link: `https://open.spotify.com/embed/${type}/${trackId[1]}`,
                selected: true,
                search: false,
                url: '',
                title: title
            });
    
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                try {
                    const newToken = await getSpotifyToken();
                    setAccessToken(newToken);
                    await searchSpotify();
                } catch (retryError) {
                    NewSwal.fire({ 
                        icon: 'error', 
                        title: 'Spotify Error', 
                        text: 'Failed to authenticate with Spotify. Please try again later.' 
                    });
                }
            } else {
                NewSwal.fire({ 
                    icon: 'error', 
                    title: 'Spotify Error', 
                    text: err.response?.data?.error?.message || 'Failed to fetch content from Spotify' 
                });
            }
        }
    }


    useEffect(() => {
        if (music.search) {
            if (music.youtube) searchYoutube();
            else searchSpotify();
            console.log('search', music);
            resetPopUp();
        }
    }, [music.search]);

    return (
        <div className='d-flex position-fixed top-50 start-0 translate-middle-y'>
            { music.selected && (
                <div className='d-flex text-white align-items-start' style={{ transform: `translate(${open ? '-13px' : '-320px'}, 0)`, transition: 'transform 0.3s ease-in-out' }}>
                
                    <div className='bg-sloth-blue text-white rounded-bottom-4 p-4 peek-div'>
                        {music.youtube ? (
                            <iframe
                                src={music.link}
                                title='YouTube video player'
                                width='100%'
                                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                                referrerPolicy='strict-origin-when-cross-origin'
                                allowFullScreen
                            />
                        ) : (
                            <iframe 
                                src={music.link}
                                title='Spotify player' 
                                width='100%' height='152' frameborder='0'
                                allowFullScreen 
                                allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture' 
                                loading='lazy'>
                            </iframe>
                        )}
                    </div>
                        
                    <button type='button' aria-label='Your Music' title='Your Music' className='ps-1 p-3 rounded-start-0 rounded-end-5 bg-sloth-blue m-0 btn-hover' onClick={() => setOpen(!open)}>
                        {open ? (
                            <X size='30' color='#ffff' strokeWidth='1.5' />
                        ) : (
                            <AudioLines size='30' color='#ffff' strokeWidth='1.5' />
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

export default MusicPomodoro;