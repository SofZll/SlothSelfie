import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const MapPreview = ({ center , id = 0 , isPost = false}) => {
    const mapRef = useRef(null);

    const newIcon = L.icon({
        iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
        iconSize: [25, 25],
        iconAnchor: [12.5, 25],
        popupAnchor: [0, -25],
    });

    useEffect(() => {
        if (!center || center[0] == null || center[1] == null) return;

        const mapId = `map-${id}`;
        const container = document.getElementById(mapId);

        if (!container) return;

        if (mapRef.current) mapRef.current.remove();

        if (container && !mapRef.current) {
            if (!isPost){
                mapRef.current = L.map(container, {
                    center: center || [0, 0],
                    zoom: 15,
                    // disable all default user interactions
                    zoomControl: false,
                    dragging: false,
                    scrollWheelZoom: false,
                    doubleClickZoom: false,
                    boxZoom: false,
                    keyboard: false,
                    touchZoom: false,
                });
            } else {
                mapRef.current = L.map(container, {
                    center: center || [0, 0],
                    zoom: 15,
                });
            }

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapRef.current);

            L.marker(center, {icon: newIcon}).addTo(mapRef.current);
        }

        setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.invalidateSize();
            }
        }, 300);

        return () => {
            if (mapRef.current){
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [center]);

    return <div id={`map-${id}`} className={`map ${isPost ? 'post' : ''}`} />;
}

export default MapPreview;