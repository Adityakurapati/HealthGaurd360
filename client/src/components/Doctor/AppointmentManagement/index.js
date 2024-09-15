import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './style.module.css'; // Import CSS module

const AppointmentsList=( { doctorId } ) =>
{
        const [ appointments, setAppointments ]=useState( [] );

        useEffect( () =>
        {
                // Fetch appointments for the specific doctor
                const fetchAppointments=async () =>
                {
                        try
                        {
                                const response=await axios.get( `/api/appointments/${ doctorId }` );
                                setAppointments( response.data );
                        } catch ( error )
                        {
                                console.error( 'Error fetching appointments:', error );
                        }
                };

                fetchAppointments();
        }, [ doctorId ] );

        const toggleCompletion=async ( appointmentId ) =>
        {
                try
                {
                        const response=await axios.patch( `/api/appointments/toggle-complete/${ appointmentId }` );
                        setAppointments( ( prevAppointments ) =>
                                prevAppointments.map( ( app ) =>
                                        app.id===appointmentId
                                                ? { ...app, completed: response.data.completed }
                                                :app
                                )
                        );
                } catch ( error )
                {
                        console.error( 'Error toggling appointment completion:', error );
                }
        };

        return (
                <div>
                        <h2>Appointments Data</h2>
                        <div className={ styles.appointmentsContainer }>
                                { appointments.length>0? (
                                        appointments.map( ( appointment ) => (
                                                <div key={ appointment.id } className={ styles.appointmentCard }>
                                                        <div className={ styles.appointmentDetails }>
                                                                <p>
                                                                        <strong>Patient Name:</strong> { appointment.patient_name }
                                                                </p>
                                                                <p>
                                                                        <strong>Location:</strong> { appointment.location }
                                                                </p>
                                                                <button
                                                                        className={ `${ styles.statusButton } ${ appointment.completed? styles.completed:styles.uncompleted
                                                                                }` }
                                                                        onClick={ () => toggleCompletion( appointment.id ) }
                                                                >
                                                                        { appointment.completed? 'Completed':'Uncompleted' }
                                                                </button>
                                                        </div>
                                                </div>
                                        ) )
                                ):(
                                        <p>No appointments found.</p>
                                ) }
                        </div>
                </div>
        );
};

export default AppointmentsList;
