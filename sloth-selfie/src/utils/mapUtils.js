const reverseAddress = async ([lat, lon]) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=it`;
    const response = await fetch(url, {
        headers: {
            "User-Agent": "SlothSelfieApp (kaorijiang88@email.com)"
        }
    });

    if (!response.ok) throw new Error('Error reverse geocoding');
    
    const data = await response.json();
    return data.display_name;
};

export { reverseAddress };