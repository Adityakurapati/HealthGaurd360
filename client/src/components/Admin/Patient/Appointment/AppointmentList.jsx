import React, { useEffect, useState } from 'react';
import styles from './appointmentList.module.css'; // Import the CSS module

const AppointmentList=() =>
{
        const [ appointments, setAppointments ]=useState( [] );

        useEffect( () =>
        {
                const fetchAppointments=async () =>
                {
                        try
                        {
                                const response=await fetch( '/api/appointments' ); // Fetch appointments from your API
                                const data=await response.json();
                                setAppointments( data );
                        } catch ( error )
                        {
                                console.error( 'Error fetching appointments:', error );
                        }
                };
                fetchAppointments();
        }, [] );

        return (
                <div className={ styles.container }>
                        <h2>Appointments List</h2>
                        <ul>
                                { appointments.map( ( appointment ) => (
                                        <li key={ appointment.id } className={ styles.listItem }>
                                                <div className={ styles.details }>
                                                        <p>
                                                                <i className={ `fa fa-user-md ${ styles.icon }` }></i>
                                                                Patient Name: { appointment.patient_name }
                                                        </p>
                                                        <p>
                                                                <i className={ `fa fa-calendar ${ styles.dateIcon }` }></i>
                                                                Appointment Date: { appointment.appointment_date }
                                                        </p>
                                                        <p>
                                                                <i
                                                                        className={ `fa fa-info-circle ${ styles.statusIcon } ${ appointment.status==='Confirmed'
                                                                                ? styles.confirmed
                                                                                :appointment.status==='Pending'
                                                                                        ? styles.pending
                                                                                        :styles.cancelled
                                                                                }` }
                                                                ></i>{ ' ' }
                                                                Status: { appointment.status }
                                                        </p>
                                                </div>
                                        </li>
                                ) ) }
                        </ul>
                        <button className={ styles.addButton }>Add New Appointment</button>
                </div>
        );
};

export default AppointmentList;
