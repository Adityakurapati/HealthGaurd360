import React from 'react';
import { Route, Routes, NavLink } from 'react-router-dom';
import AppointmentManagement from './AppointmentManagement';
import Messaging from './Messaging';
import Prescription from './Prescription';

const DoctorDashboard=( { currentUser } ) =>
{
        return (
                <div className="doctor-dashboard">
                        <h1>Doctor Dashboard</h1>
                        <nav>
                                <ul>
                                        <li><NavLink to="appointments">Manage Appointments</NavLink></li>
                                        <li><NavLink to="messaging">Messaging</NavLink></li>
                                        <li><NavLink to="prescription">Prescriptions</NavLink></li>
                                </ul>
                        </nav>

                        <Routes>
                                <Route path="appointments" element={ <AppointmentManagement doctorId={ currentUser?.id } /> } />
                                <Route path="messaging" element={ <Messaging doctorId={ currentUser?.id } /> } />
                                <Route path="prescription" element={ <Prescription currentUser={ currentUser } /> } />
                        </Routes>
                </div>
        );
};

export default DoctorDashboard;
