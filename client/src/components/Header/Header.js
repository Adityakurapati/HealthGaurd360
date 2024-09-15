// src/components/Header.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header ()
{
        const navigate=useNavigate();
        const [ isAuthenticated, setIsAuthenticated ]=useState( true ); // Default to true for initial load

        useEffect( () =>
        {
                // Check if user is authenticated on component mount
                const checkAuthStatus=async () =>
                {
                        try
                        {
                                const response=await fetch( '/api/current_user', { method: 'GET' } );
                                if ( response.ok )
                                {
                                        const data=await response.json();
                                        setIsAuthenticated( true ); // User is authenticated
                                } else
                                {
                                        setIsAuthenticated( false ); // User is not authenticated
                                        navigate( '/login' ); // Redirect to login page
                                }
                        } catch ( error )
                        {
                                console.error( 'Error checking authentication:', error );
                                setIsAuthenticated( false ); // Assume not authenticated on error
                                navigate( '/login' ); // Redirect to login page
                        }
                };
                checkAuthStatus();
        }, [ navigate ] );

        const handleLogout=async () =>
        {
                try
                {
                        const response=await fetch( '/api/logout', {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                        } );
                        const data=await response.json();
                        if ( response.ok )
                        {
                                alert( data.message ); // Show success message
                                setIsAuthenticated( false ); // Update authentication status
                                navigate( '/login' ); // Redirect to login page
                        } else
                        {
                                alert( 'Logout failed: '+data.message );
                        }
                } catch ( error )
                {
                        console.error( 'Error during logout:', error );
                        alert( 'An error occurred. Please try again.' );
                }
        };

        // Hide the header or provide alternative UI when not authenticated
        if ( !isAuthenticated )
        {
                return null;
        }

        return (
                <header className="header">
                        <img src="/img/logo1.jpg" alt="Medical Illustration" className="logo-img" />
                        <div className="logo">
                                <span className="health">Health</span>
                                <span className="guard360">Guard360</span>
                        </div>
                        <nav className="nav">
                                <a href="#locations">Locations</a>
                                <a href="#doctors">Doctors</a>
                                <a href="#treatments">Treatments</a>
                                <a href="#diseases">Diseases</a>
                        </nav>
                        <button className="logout-button" onClick={ handleLogout }>Logout</button>
                </header>
        );
}

export default Header;
