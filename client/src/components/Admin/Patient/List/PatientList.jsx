import React, { useEffect, useState } from 'react';
import styles from './patientList.module.css'

const PatientList=() =>
{
        const [ patients, setPatients ]=useState( [] );

        useEffect( () =>
        {
                const fetchPatients=async () =>
                {
                        try
                        {
                                const response=await fetch( '/api/patients' ); // Fetching from Flask backend
                                const data=await response.json();
                                setPatients( data ); // Set patients data into state
                        } catch ( error )
                        {
                                console.error( 'Error fetching patients:', error );
                        }
                };

                fetchPatients();
        }, [] );

        return (
                <div className={ styles.container }>
                        <h2>Patients List</h2>
                        <ul>
                                { patients.length>0? (
                                        patients.map( ( patient ) => (
                                                <li key={ patient.id }>
                                                        <p>Name: { patient.name }</p>
                                                        <p>Age: { patient.age }</p>
                                                        <p>Contact: { patient.contact }</p>
                                                </li>
                                        ) )
                                ):(
                                        <p>No patients available</p>
                                ) }
                        </ul>
                </div>
        );
};

export default PatientList;
