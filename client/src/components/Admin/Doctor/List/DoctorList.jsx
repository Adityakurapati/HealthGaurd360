import React, { useEffect, useState } from 'react';
import styles from './doctorList.module.css';

const DoctorList=() =>
{
        const [ doctors, setDoctors ]=useState( [] );

        useEffect( () =>
        {
                const fetchDoctors=async () =>
                {
                        try
                        {
                                const response=await fetch( '/api/doctors' );
                                const data=await response.json();
                                setDoctors( data );
                        } catch ( error )
                        {
                                console.error( 'Error fetching doctors:', error );
                        }
                };
                fetchDoctors();
        }, [] );

        return (
                <div className={ styles.container }>
                        <h2>Doctors List</h2>
                        <ul>
                                { doctors.map( ( doctor ) => (
                                        <li key={ doctor.id }>
                                                <p>Name: { doctor.name }</p>
                                                <p>Specialty: { doctor.specialty }</p>
                                                <p>Contact: { doctor.contact }</p>
                                        </li>
                                ) ) }
                        </ul>
                </div>
        );
};

export default DoctorList;
