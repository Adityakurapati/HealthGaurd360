import React from 'react';

// Example images arrays
const maleImages = [
    '/img/avatars/male1.jpeg',
    '/img/avatars/male2.jpeg',
    '/img/avatars/male3.jpeg',
    // Add more images as needed
];

const femaleImages = [
    '/img/avatars/female1.jpg',
    '/img/avatars/female2.jpg',
    '/img/avatars/female3.jpg',
    // Add more images as needed
];

const getImageForGender = (gender) => {
    if (gender === 'male') {
        for(let i=0;i<maleImages.length;i++){
        return maleImages[i];
        }
    } else if (gender === 'female') {
        for(let i=0;i<femaleImages.length;i++){
        return femaleImages[i];
        }
    }
    return '/img/avatars/female1.jpg'; // Default image if gender is unknown
};

const DoctorCard = ({ name, specialization, gender, contact_number }) => {
    const image = getImageForGender(gender);

    return (
        <div className="doctor-card">
            <img src={image} alt={name} className="doctor-image" />
            <div className="doctor-info">
                <h3>{name}</h3>
                <p className="specialization">{specialization}</p>
                <p className="location">Pune, India</p>
                <p className="contact">{contact_number}</p>
            </div>
        </div>
    );
};

export default DoctorCard;
