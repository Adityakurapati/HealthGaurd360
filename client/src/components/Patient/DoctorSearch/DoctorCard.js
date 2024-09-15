import React from 'react';

const DoctorCard = ({ name, specialization, image }) => {
return (
<div className="doctor-card">
        <img src="/img/Dt1.webp" alt={name} />
        <div className="doctor-info">
                <h3>{name}</h3>
                <p className="specialization">{specialization}</p>
                <p className="location">Dombivli, Maharashtra</p>
                <p className="contact">+91 8748473683</p>
        </div>

</div>
);
}

export default DoctorCard;