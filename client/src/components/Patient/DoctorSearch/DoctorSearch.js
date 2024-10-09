import React, { useEffect, useState, useRef } from 'react';
import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';
import DoctorCard from './DoctorCard';
import './DoctorSearch.css';

const DoctorSearch = ({ doctors }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDoctors, setFilteredDoctors] = useState(doctors);
    const swiperRef = useRef(null);

    useEffect(() => {
        const swiper = new Swiper('.swiper-container', {
            slidesPerView: 3, // Show 3 cards per page
            spaceBetween: 20,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            loop: true,
        });
        swiperRef.current = swiper;
    }, []);

    useEffect(() => {
        const filtered = doctors.filter(doctor =>
            doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredDoctors(filtered);
    }, [searchTerm, doctors]);

    useEffect(() => {
        if (filteredDoctors.length === 1 && swiperRef.current) {
            // Find the index of the single filtered doctor
            const index = doctors.findIndex(doctor => doctor.id === filteredDoctors[0].id);
            swiperRef.current.slideToLoop(index, 0, false); // Slide to the single card
        }
    }, [filteredDoctors]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="doctor-search-container">
            <h1>Want To Search A Doctor?</h1>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by doctor name or specialty"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button type="submit">
                    <img src="/img/search.jpg" alt="Search" />
                </button>
            </div>
            <div className="swiper-container">
                <div className="swiper-wrapper">
                    {filteredDoctors.map(doctor => (
                        <div className="swiper-slide" key={doctor.id}>
                            <DoctorCard
                                name={doctor.name}
                                specialization={doctor.specialty}
                                gender={doctor.gender}
                                contact_number={doctor.contact_number}
                            />
                        </div>
                    ))}
                </div>
                <div className="swiper-button-prev"></div>
                <div className="swiper-button-next"></div>
            </div>
            <button className="audio-button">
                Hear What Our Doctor Says <span>▶</span>
            </button>
        </div>
    );
};

export default DoctorSearch;
