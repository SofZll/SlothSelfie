import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const MapPreview = ({ center }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map("map").setView(center || [0, 0], 13);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapRef.current);

            L.marker(center).addTo(mapRef.current);
        }

        return () => {
            if (mapRef.current){
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [center]);

    return <div id='map' className="map" />;
}

export default MapPreview;