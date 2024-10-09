import React from 'react';
import { Route, Routes, NavLink, Navigate } from 'react-router-dom';
import AppointmentManagement from './AppointmentManagement';
import Messaging from './Messaging';
import Prescription from './Prescription';

const DoctorDashboard = ({ currentUser }) => {
  return (
    <div className="doctor-dashboard">
      {/* <nav>
        <ul>
          <li>
            <NavLink to="appointments">Manage Appointments</NavLink>
          </li>
          <li>
            <NavLink to="messaging">Messaging</NavLink>
          </li>
          <li>
            <NavLink to="prescription">Prescriptions</NavLink>
          </li>
        </ul>
      </nav> */}

      <Routes>
        {/* Default route to always open the "appointments" tab */}
        <Route path="/" element={<Navigate to="appointments" />} />
        
        {/* Other routes */}
        <Route path="appointments" element={<AppointmentManagement doctorId={currentUser?.id} />} />
        <Route path="messaging" element={<Messaging doctorId={currentUser?.id} />} />
        <Route path="prescription" element={<Prescription currentUser={currentUser} />} />
      </Routes>
    </div>
  );
};

export default DoctorDashboard;
