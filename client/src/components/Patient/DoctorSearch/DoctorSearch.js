import React, { useState } from 'react';
import DoctorCard from './DoctorCard';
import './DoctorSearch.css';

const DoctorSearch=() =>
{
        const [ currentIndex, setCurrentIndex ]=useState( 0 );

        const doctors=[
                { id: 1, name: 'Dr. Jane Doe', specialization: 'Cardiologist', image: '/img/Dt1.jpg' },
                { id: 2, name: 'Dr. Ayune', specialization: 'Neurologist', image: 'path_to_male_doctor_image.jpg' },
                { id: 3, name: 'Dr. Ayune', specialization: 'Neurologist', image: 'path_to_male_doctor_image.jpg' },
                { id: 4, name: 'Dr. Ayune', specialization: 'Neurologist', image: 'path_to_male_doctor_image.jpg' },
                // Add more doctors as needed
        ];

        const handleNext=() =>
        {
                if ( currentIndex<doctors.length-1 )
                {
                        setCurrentIndex( currentIndex+1 );
                }
        };

        const handlePrev=() =>
        {
                if ( currentIndex>0 )
                {
                        setCurrentIndex( currentIndex-1 );
                }
        };

        return (
                <div className="doctor-search-container">
                        <h1>Want To Search A Doctor?</h1>
                        <div className="search-bar">
                                <input
                                        type="text"
                                        placeholder="For What Do You Want To Search"
                                />
                                <button type="submit">
                                        <img src="/img/search.jpg" alt="Search" />
                                </button>
                        </div>
                        <div className="doctor-cards-container">
                                <button className="nav-button left" onClick={ handlePrev }>{ '<' }</button>
                                <div className="doctor-cards-wrapper">
                                        <div
                                                className="doctor-cards"
                                                style={ { transform: `translateX(-${ currentIndex*100 }%)` } }
                                        >
                                                { doctors.map( doctor => (
                                                        <DoctorCard key={ doctor.id } { ...doctor } />
                                                ) ) }
                                        </div>
                                </div>
                                <button className="nav-button right" onClick={ handleNext }>{ '>' }</button>
                        </div>
                        <button className="audio-button">
                                Hear What Our Doctor Says <span>▶</span>
                        </button>
                </div>
        );
};

export default DoctorSearch;
