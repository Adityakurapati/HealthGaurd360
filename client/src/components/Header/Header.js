import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ userType }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message); // Show success message
                navigate('/login'); // Redirect to login page
            } else {
                alert('Logout failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error during logout:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <header className="header">
            <img src="/img/logo1.jpg" alt="Medical Illustration" className="logo-img" />
            <div className="logo">
                <span className="health">Health</span>
                <span className="guard360">Guard360</span>
            </div>
            <nav className="nav">
                {userType === 'doctors' ? (
                    <>
                        <a href="/doctor-dashboard/appointments">Manage Appointments</a>
                        <a href="/doctor-dashboard/messaging">Messaging</a>
                        <a href="/doctor-dashboard/prescription">Prescriptions</a>
                    </>
                ) : (
                    <>
                        <a href="#locations">Locations</a>
                        <a href="#doctors">Doctors</a>
                        <a href="#treatments">Treatments</a>
                        <a href="#diseases">Diseases</a>
                    </>
                )}
            </nav>
            <button className="logout-button" onClick={handleLogout}>
                <div className="icon"></div>
                <div className="text">Logout</div>
            </button>
        </header>
    );
}

export default Header;
