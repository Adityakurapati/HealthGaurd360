import React, { useState } from 'react';
import styles from './addPatient.module.css';

const AddPatient=() =>
{
        const [ patient, setPatient ]=useState( {
                name: '',
                age: '',
                contact: '',
        } );

        const handleChange=( e ) =>
        {
                setPatient( {
                        ...patient,
                        [ e.target.name ]: e.target.value
                } );
        };

        const handleSubmit=async ( e ) =>
        {
                e.preventDefault();
                try
                {
                        const response=await fetch( '/api/add-patient', {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                body: JSON.stringify( patient ),
                        } );
                        const data=await response.json();
                        if ( response.ok )
                        {
                                alert( 'Patient added successfully!' );
                                setPatient( { name: '', age: '', contact: '' } );
                        } else
                        {
                                alert( `Error: ${ data.error }` );
                        }
                } catch ( error )
                {
                        console.error( 'Error:', error );
                }
        };

        return (
                <div className={ styles.container }>
                        <h2>Add Patient</h2>
                        <form onSubmit={ handleSubmit }>
                                <label>Name:
                                        <input type="text" name="name" value={ patient.name } onChange={ handleChange } required />
                                </label>
                                <label>Age:
                                        <input type="number" name="age" value={ patient.age } onChange={ handleChange } required />
                                </label>
                                <label>Contact:
                                        <input type="text" name="contact" value={ patient.contact } onChange={ handleChange } required />
                                </label>
                                <button type="submit">Add Patient</button>
                        </form>
                </div>
        );
};

export default AddPatient;
