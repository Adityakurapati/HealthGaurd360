import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import styles from './register.module.css';  // Import CSS module

const Register=() =>
{
        const [ role, setRole ]=useState( 'patient' );
        const [ formData, setFormData ]=useState( {
                name: '',
                password: '',
                email: '',
                contact_number: '',
                gender: '',
                age: '',
                location: '',
                specialty: '',
                hospital_id: '',
        } );
        const [ hospitals, setHospitals ]=useState( [] );

        // Fetch nearby hospitals based on some lat/lng
        useEffect( () =>
        {
                const fetchHospitals=async () =>
                {
                        try
                        {
                                const lat=18.5204;  // Example latitude
                                const lng=73.8567;  // Example longitude

                                const response=await axios.get( `/api/nearby_hospitals?lat=${ lat }&lng=${ lng }` );
                                setHospitals( response.data );  // Assuming hospital data comes as a list of objects
                        } catch ( error )
                        {
                                console.error( 'Error fetching hospitals:', error );
                        }
                };

                if ( role==='doctor' )
                {
                        fetchHospitals();
                }
        }, [ role ] );

        const handleChange=( e ) =>
        {
                setFormData( { ...formData, [ e.target.name ]: e.target.value } );
        };

        const handleSubmit=async ( e ) =>
        {
                e.preventDefault();
                try
                {
                        const response=await axios.post( '/api/register', {
                                ...formData,
                                role,
                        } );
                        alert( 'Registration successful' );
                        console.log( 'User registered: ', response.data );
                } catch ( error )
                {
                        console.error( 'Error registering user: ', error.response.data );
                        alert( 'Error registering user' );
                }
        };

        return (
                <motion.div
                        className={ styles.registerContainer }
                        initial={ { opacity: 0, y: 20 } }
                        animate={ { opacity: 1, y: 0 } }
                        transition={ { duration: 0.5 } }
                >
                        <motion.h1
                                className={ styles.heading }
                                initial={ { opacity: 0, scale: 0.8 } }
                                animate={ { opacity: 1, scale: 1 } }
                                transition={ { duration: 0.5, type: 'spring', stiffness: 200 } }
                        >
                                Register as { role.charAt( 0 ).toUpperCase()+role.slice( 1 ) }
                        </motion.h1>
                        <form onSubmit={ handleSubmit } className={ styles.form }>
                                <label className={ styles.label }>
                                        Role:
                                        <motion.select
                                                name="role"
                                                value={ role }
                                                onChange={ ( e ) => setRole( e.target.value ) }
                                                className={ styles.input }
                                                whileTap={ { scale: 0.98 } }
                                                transition={ { type: 'spring', stiffness: 200 } }
                                        >
                                                <option value="patient">Patient</option>
                                                <option value="doctor">Doctor</option>
                                        </motion.select>
                                </label>

                                <label className={ styles.label }>
                                        Name:
                                        <motion.input
                                                type="text"
                                                name="name"
                                                value={ formData.name }
                                                onChange={ handleChange }
                                                className={ styles.input }
                                                required
                                                whileFocus={ { scale: 1.02 } }
                                                transition={ { type: 'spring', stiffness: 200 } }
                                        />
                                </label>

                                <label className={ styles.label }>
                                        Email:
                                        <motion.input
                                                type="email"
                                                name="email"
                                                value={ formData.email }
                                                onChange={ handleChange }
                                                className={ styles.input }
                                                required
                                                whileFocus={ { scale: 1.02 } }
                                                transition={ { type: 'spring', stiffness: 200 } }
                                        />
                                </label>

                                <label className={ styles.label }>
                                        Password:
                                        <motion.input
                                                type="password"
                                                name="password"
                                                value={ formData.password }
                                                onChange={ handleChange }
                                                className={ styles.input }
                                                required
                                                whileFocus={ { scale: 1.02 } }
                                                transition={ { type: 'spring', stiffness: 200 } }
                                        />
                                </label>

                                <label className={ styles.label }>
                                        Contact Number:
                                        <motion.input
                                                type="text"
                                                name="contact_number"
                                                value={ formData.contact_number }
                                                onChange={ handleChange }
                                                className={ styles.input }
                                                required
                                                whileFocus={ { scale: 1.02 } }
                                                transition={ { type: 'spring', stiffness: 200 } }
                                        />
                                </label>

                                <label className={ styles.label }>
                                        Gender:
                                        <motion.select
                                                name="gender"
                                                value={ formData.gender }
                                                onChange={ handleChange }
                                                className={ styles.input }
                                                required
                                                whileTap={ { scale: 0.98 } }
                                                transition={ { type: 'spring', stiffness: 200 } }
                                        >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                        </motion.select>
                                </label>

                                { role==='patient'&&(
                                        <>
                                                <label className={ styles.label }>
                                                        Age:
                                                        <motion.input
                                                                type="number"
                                                                name="age"
                                                                value={ formData.age }
                                                                onChange={ handleChange }
                                                                className={ styles.input }
                                                                required
                                                                whileFocus={ { scale: 1.02 } }
                                                                transition={ { type: 'spring', stiffness: 200 } }
                                                        />
                                                </label>

                                                <label className={ styles.label }>
                                                        Location:
                                                        <motion.input
                                                                type="text"
                                                                name="location"
                                                                value={ formData.location }
                                                                onChange={ handleChange }
                                                                className={ styles.input }
                                                                required
                                                                whileFocus={ { scale: 1.02 } }
                                                                transition={ { type: 'spring', stiffness: 200 } }
                                                        />
                                                </label>
                                        </>
                                ) }

                                { role==='doctor'&&(
                                        <>
                                                <label className={ styles.label }>
                                                        Specialty:
                                                        <motion.input
                                                                type="text"
                                                                name="specialty"
                                                                value={ formData.specialty }
                                                                onChange={ handleChange }
                                                                className={ styles.input }
                                                                required
                                                                whileFocus={ { scale: 1.02 } }
                                                                transition={ { type: 'spring', stiffness: 200 } }
                                                        />
                                                </label>

                                                <label className={ styles.label }>
                                                        Hospital:
                                                        <motion.select
                                                                name="hospital_id"
                                                                value={ formData.hospital_id }
                                                                onChange={ handleChange }
                                                                className={ styles.input }
                                                                required
                                                                whileTap={ { scale: 0.98 } }
                                                                transition={ { type: 'spring', stiffness: 200 } }
                                                        >
                                                                <option value="">Select Hospital</option>
                                                                { hospitals.map( ( hospital ) => (
                                                                        <option key={ hospital.id } value={ hospital.id }>
                                                                                { hospital.name }
                                                                        </option>
                                                                ) ) }
                                                        </motion.select>
                                                </label>
                                        </>
                                ) }

                                <motion.button
                                        type="submit"
                                        className={ styles.button }
                                        whileHover={ { scale: 1.05 } }
                                        transition={ { type: 'spring', stiffness: 200 } }
                                >
                                        Register
                                </motion.button>
                        </form>
                </motion.div>
        );
};

export default Register;
