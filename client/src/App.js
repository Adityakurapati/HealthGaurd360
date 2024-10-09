import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header';
import Admin from './components/Admin/Admin';
import Register from './components/Auth/Register/Register';
import LoadingSpinner from './components/Loading';

// Lazy load components
const Login = React.lazy(() => import('./components/Auth/Login/Login'));
const Patient = React.lazy(() => import('./components/Patient'));
const MessagingApp = React.lazy(() => import('./components/Patient/Messaging'));
const Doctor = React.lazy(() => import('./components/Doctor'));

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    // Fetch current user data
    fetch('/api/current_user')
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setCurrentUser(null); // User not logged in or error
        } else {
          setCurrentUser(data); // Set current user data
        }
        setLoading(false); // Stop loading after fetching
      })
      .catch((error) => {
        console.error('Error fetching current user:', error);
        setLoading(false);
      });

    // Fetch doctors when component mounts
    fetch('/api/doctors')
      .then((response) => response.json())
      .then((data) => setDoctors(data))
      .catch((error) => console.error('Error fetching doctors:', error));
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const userType = currentUser?.role; // e.g., 'doctor', 'patient'

  return (
    <div className="App">
  

      <Header userType={userType} />
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* If the user is logged in, redirect to their dashboard, else allow login or registration */}
          <Route
            path="/"
            element={
              currentUser ? (
                <Navigate to={`/${currentUser.role}-dashboard`} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          
          {/* Ensure register route is accessible without login */}
          <Route path="/register" element={<Register />} />
          
          {/* Patient dashboard routes */}
          <Route
            path="/patient-dashboard"
            element={
              currentUser ? (
                <Patient currentUser={currentUser} doctors={doctors} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/patient-dashboard/messaging"
            element={
              currentUser ? (
                <MessagingApp patientId={currentUser?.id} doctors={doctors} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          
          {/* Doctor dashboard routes */}
          <Route
            path="/doctor-dashboard/*"
            element={
              currentUser ? (
                <Doctor currentUser={currentUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </React.Suspense>
    </div>
  );
}

export default App;
