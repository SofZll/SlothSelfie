import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react'
import L from 'leaflet';
import '../styles/GeolocalizationInput.css';

import { NewSwal } from '../utils/swalUtils';
import { reverseAddress } from '../utils/mapUtils';

const GeolocalizationInput = ({ showGeo, setShowGeo, setInputMap }) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [addressInput, setAddressInput] = useState('');
    const [mapInitialized, setMapInitialized] = useState(false);
    const [position, setPosition] = useState(null);

    const icon = L.icon({
        iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
        iconSize: [25, 25],
        iconAnchor: [12.5, 25],
        popupAnchor: [0, -25],
    });

    const handleAddressInput = async () => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}&addressdetails=1&limit=5`;

        const response = await fetch(url, {
            headers: {
                "User-Agent": "SlfothSelfieApp (kaorijiang88@email.com)",
                "Accept-Language": "it"
            }
        });

        const data = await response.json();

        if (data.length > 0) {
            const { lat, lon } = data[0];
            const position = [parseFloat(lat), parseFloat(lon)];
            setPosition(position);
            
            const address = await reverseAddress(position);
            setAddressInput(address);
        } else NewSwal.fire({ title: 'Error', icon: 'error', text: 'Address not found' });
    }

    const handleAddMap = () => {
        setInputMap(position);
        resetMap();
    }

    const resetMap = () => {
        setShowGeo(false);
        setAddressInput('');
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
        markerRef.current = null;
        setMapInitialized(false);
        setPosition(null);
    }

    const getCurrentPosition = async () => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            setPosition([position.coords.latitude, position.coords.longitude]);
            const address = await reverseAddress([position.coords.latitude, position.coords.longitude]);
            setAddressInput(address);
        });
    };

    useEffect(() => {
        if (!showGeo){
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }

            markerRef.current = null;
            setMapInitialized(false);
            setPosition(null);
        }
    }, [showGeo]);

    useEffect(() => {
        if (position && showGeo && !mapInitialized) {
            const container = document.getElementById('map-modal');
            if (!container) return;
        
            const map = L.map(container, {
                center: position,
                zoom: 15,
                zoomControl: true,
            });
            mapRef.current = map;
       
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(map);

            markerRef.current = L.marker(position, { icon }).addTo(map);
            setTimeout(() => map.invalidateSize(), 300);

            setMapInitialized(true);
        } else if (position && mapRef.current) {
            if (markerRef.current) mapRef.current.removeLayer(markerRef.current);
            markerRef.current = L.marker(position, { icon }).addTo(mapRef.current);
            mapRef.current.setView(position, 15);
        }
    }, [position]);

    if (!showGeo) return null;
    
    return (
        <div className={`modal fade ${showGeo ? 'show d-block' : ''}`} id='geoModal' tabIndex='-1' aria-labelledby='geoModal' aria-hidden='true'>
            <div className='modal-dialog modal-dialog-centered'>
                <div className='modal-content' >
                    <div className='modal-header'>
                        <h1 className='modal-title fs-5' >Geolocalization</h1>
                        <button type='button' className='btn-close' aria-label='Close' title='Close' onClick={() => resetMap()}></button>
                    </div>
                    <div className='modal-body container'>
                        <h5>Search for a location</h5>
                        <div className='row mb-2'>
                            <label htmlFor='address' className='col-form-label ms-1'>Address:</label>
                            <div className='col-9 position-relative'>
                                <input 
                                    type='text' 
                                    id='address' 
                                    className='form-control' 
                                    placeholder='Enter address' 
                                    autoComplete='off' 
                                    value={addressInput} 
                                    onChange={(e) => setAddressInput(e.target.value)}
                                />
                                <div className='position-absolute map-pin'>
                                    <span role="button" aria-label="Select your position" title="Select your position">
                                        <MapPin size={20} color='#777' onClick={() => getCurrentPosition()} />
                                    </span>
                                </div>
                            </div>
                            <div className='col-3'>
                                <button type='button' aria-label='Search address' className='button-clean green' onClick={() => handleAddressInput()}>Search</button>
                            </div>
                        </div>
                        <div className='d-flex justify-content-center align-items-center'>
                            {position && <div id='map-modal' className='map-modal m-3 rounded-2' />}
                        </div>
                    </div>
                    <div className='modal-footer'>
                        <button type='button' aria-label='Add address' className='btn btn-outline-primary' onClick={() => handleAddMap()}>Add</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GeolocalizationInput;