import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header';
import Admin from './components/Admin/Admin';
import Register from './components/Auth/Register/Register';
import LoadingSpinner from './components/Loading'; // Import LoadingSpinner

// Lazy load components
const Login=React.lazy( () => import( './components/Auth/Login/Login' ) );
const Patient=React.lazy( () => import( './components/Patient' ) );
const PatientMessagingComponent=React.lazy( () => import( './components/Patient/Messaging' ) );
const Doctor=React.lazy( () => import( './components/Doctor' ) );

function App ()
{
        const [ currentUser, setCurrentUser ]=useState( null );
        const [ loading, setLoading ]=useState( true );
        const [ doctors, setDoctors ]=useState( [] );

        useEffect( () =>
        {
                // Fetch current user data from the Flask API
                fetch( '/api/current_user' )
                        .then( ( response ) => response.json() )
                        .then( ( data ) =>
                        {
                                if ( data.error )
                                {
                                        setCurrentUser( null ); // User not logged in or error
                                } else
                                {
                                        setCurrentUser( data ); // Set current user data
                                }
                                setLoading( false ); // Stop loading after fetching
                        } )
                        .catch( ( error ) =>
                        {
                                console.error( "Error fetching current user:", error );
                                setLoading( false );
                        } );

                // Fetch doctors when component mounts
                fetch( '/api/doctors' )
                        .then( ( response ) => response.json() )
                        .then( ( data ) => setDoctors( data ) ) // Adjusted to directly use the array
                        .catch( ( error ) => console.error( 'Error fetching doctors:', error ) );
        }, [] );

        if ( loading )
        {
                return <LoadingSpinner />;
        }

        return (
                <div className="App" style={ {
                        backgroundImage: `url('/img/bg.jpg')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '100vh',
                } }>
                        <Header />
                        <React.Suspense fallback={ <LoadingSpinner /> }>
                                <Routes>
                                        <Route path="/" element={ currentUser? <Navigate to={ `/${ currentUser.role }-dashboard` } />:<Navigate to="/login" /> } />
                                        <Route path="/login" element={ <Login /> } />
                                        <Route path="/register" element={ <Register /> } />
                                        <Route
                                                path="/patient-dashboard"
                                                element={ <Patient currentUser={ currentUser } doctors={ doctors } /> }
                                        />
                                        <Route
                                                path="/patient-dashboard/messaging"
                                                element={ <PatientMessagingComponent patientId={ currentUser.id } doctors={ doctors } /> }
                                        />
                                        <Route path="/doctor-dashboard/*" element={ <Doctor currentUser={ currentUser } /> } />
                                        <Route path="/admin" element={ <Admin /> } />
                                </Routes>
                        </React.Suspense>
                </div>
        );
}

export default App;
