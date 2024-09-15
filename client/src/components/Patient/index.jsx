import React from 'react';
import AppointmentForm from './Appointment/AppointmentForm';
import DoctorSearch from './DoctorSearch/DoctorSearch';
import AlphabetSearch from './DiseaseAnalyze/AlphabetSearch';
import HospitalFinder from './NearbyHospital/HospitalFinder';
import NewsUpdates from './News/NewsUpdates';

const Home=( { currentUser, doctors } ) =>
{
        return (
                <div className="content">
                        <AppointmentForm doctors={ doctors } />
                        <DoctorSearch />
                        <AlphabetSearch />
                        <NewsUpdates />
                        <HospitalFinder />
                </div>
        );
};

export default Home;
