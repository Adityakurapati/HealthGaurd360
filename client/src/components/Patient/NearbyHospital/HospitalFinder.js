import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './hospitals.css';

const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
});

const HospitalFinder = () => {
    const [hospitals, setHospitals] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                () => {
                    setError('Unable to retrieve your location');
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userLocation) {
            fetchHospitalsFromFirebase();
        }
    }, [userLocation]);

    const fetchHospitalsFromFirebase = async () => {
        try {
            const response = await axios.get(`/api/nearby_hospitals?lat=${userLocation.lat}&lng=${userLocation.lng}`);
            if (response.data && response.data.length > 0) {
                setHospitals(response.data);
            } else {
                fetchNearbyHospitals();
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching hospitals from Firebase:', error);
            fetchNearbyHospitals();
        }
    };

    const fetchNearbyHospitals = async () => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&limit=10&q=hospital&viewbox=${userLocation.lng - 0.05},${userLocation.lat + 0.05},${userLocation.lng + 0.05},${userLocation.lat - 0.05}`);
            const hospitalsData = response.data.map((hospital, index) => ({
                id: index,
                name: hospital.display_name,
                lat: parseFloat(hospital.lat),
                lng: parseFloat(hospital.lon),
                address: hospital.display_name,
                phone: 'Phone not available',
            }));
            setHospitals(hospitalsData);
            storeHospitalsInFirebase(hospitalsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching hospitals:', error);
            setError('Failed to fetch hospitals. Please try again later.');
            setLoading(false);
        }
    };

    const storeHospitalsInFirebase = async (hospitals) => {
        try {
            await axios.post('/api/add-hospitals', { hospitals });
        } catch (error) {
            console.error('Error storing hospitals in Firebase:', error);
        }
    };

    if (loading) return <p>Loading hospitals...</p>;
    if (error) return <p>{error}</p>;

    return (
        <section className="hospital-finder">
            <h1>Get InTouch With Hospitals</h1>
            <div className="hospital-content">
                {userLocation && (
                    <div className="map-section">
                        <MapContainer
                            center={[userLocation.lat, userLocation.lng]}
                            zoom={13}
                            style={{ height: '300px', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {hospitals.map(hospital => (
                                <Marker
                                    key={hospital.id}
                                    position={[hospital.lat, hospital.lng]}
                                    icon={customIcon}
                                >
                                    <Popup>
                                        <strong>{hospital.name}</strong><br />
                                        Address: {hospital.address}<br />
                                        Phone: {hospital.phone}
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                )}
                <div className="results-section">
                    <h3>- Results -</h3>
                    <div className="results-container">
                        {hospitals.length === 0 ? (
                            <p>No hospitals found.</p>
                        ) : (
                            hospitals.map(hospital => (
                                <details key={hospital.id}>
                                    <summary>{hospital.name}</summary>
                                    <p>Address: {hospital.address}</p>
                                    <p>Phone: {hospital.phone}</p>
                                </details>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HospitalFinder;
