import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import styles from './register.module.css';

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

        useEffect( () =>
        {
                const fetchHospitals=async () =>
                {
                        try
                        {
                                const lat=18.5204;
                                const lng=73.8567;
                                const response=await axios.get( `/api/nearby_hospitals?lat=${ lat }&lng=${ lng }` );
                                setHospitals( response.data );
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
                <div className={ styles.registerContainer }>
                        <motion.h1
                                className={ styles.heading }
                                initial={ { opacity: 0, y: -20 } }
                                animate={ { opacity: 1, y: 0 } }
                                transition={ { duration: 0.5 } }
                        >
                                Register as { role.charAt( 0 ).toUpperCase()+role.slice( 1 ) }
                        </motion.h1>
                        <form onSubmit={ handleSubmit } className={ styles.form }>
                                <div className={ styles.formRow }>
                                        <motion.div className={ styles.inputGroup } whileHover={ { scale: 1.02 } }>
                                                <label htmlFor="role">Role:</label>
                                                <select
                                                        id="role"
                                                        name="role"
                                                        value={ role }
                                                        onChange={ ( e ) => setRole( e.target.value ) }
                                                        className={ styles.input }
                                                >
                                                        <option value="patient">Patient</option>
                                                        <option value="doctor">Doctor</option>
                                                </select>
                                        </motion.div>
                                        <motion.div className={ styles.inputGroup } whileHover={ { scale: 1.02 } }>
                                                <label htmlFor="name">Name:</label>
                                                <input
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        value={ formData.name }
                                                        onChange={ handleChange }
                                                        className={ styles.input }
                                                        required
                                                />
                                        </motion.div>
                                </div>

                                <div className={ styles.formRow }>
                                        <motion.div className={ styles.inputGroup } whileHover={ { scale: 1.02 } }>
                                                <label htmlFor="email">Email:</label>
                                                <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        value={ formData.email }
                                                        onChange={ handleChange }
                                                        className={ styles.input }
                                                        required
                                                />
                                        </motion.div>
                                        <motion.div className={ styles.inputGroup } whileHover={ { scale: 1.02 } }>
                                                <label htmlFor="password">Password:</label>
                                                <input
                                                        type="password"
                                                        id="password"
                                                        name="password"
                                                        value={ formData.password }
                                                        onChange={ handleChange }
                                                        className={ styles.input }
                                                        required
                                                />
                                        </motion.div>
                                </div>

                                <div className={ styles.formRow }>
                                        <motion.div className={ styles.inputGroup } whileHover={ { scale: 1.02 } }>
                                                <label htmlFor="contact_number">Contact Number:</label>
                                                <input
                                                        type="text"
                                                        id="contact_number"
                                                        name="contact_number"
                                                        value={ formData.contact_number }
                                                        onChange={ handleChange }
                                                        className={ styles.input }
                                                        required
                                                />
                                        </motion.div>
                                        <motion.div className={ styles.inputGroup } whileHover={ { scale: 1.02 } }>
                                                <label htmlFor="gender">Gender:</label>
                                                <select
                                                        id="gender"
                                                        name="gender"
                                                        value={ formData.gender }
                                                        onChange={ handleChange }
                                                        className={ styles.input }
                                                        required
                                                >
                                                        <option value="">Select Gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                </select>
                                        </motion.div>
                                </div>

                                { role==='patient'&&(
                                        <div className={ styles.formRow }>
                                                <motion.div className={ styles.inputGroup } whileHover={ { scale: 1.02 } }>
                                                        <label htmlFor="age">Age:</label>
                                                        <input
                                                                type="number"
                                                                id="age"
                                                                name="age"
                                                                value={ formData.age }
                                                                onChange={ handleChange }
                                                                className={ styles.input }
                                                                required
                                                        />
                                                </motion.div>
                                                <motion.div className={ styles.inputGroup } whileHover={ { scale: 1.02 } }>
                                                        <label htmlFor="location">Location:</label>
                                                        <input
                                                                type="text"
                                                                id="location"
                                                                name="location"
                                                                value={ formData.location }
                                                                onChange={ handleChange }
                                                                className={ styles.input }
                                                                required
                                                        />
                                                </motion.div>
                                        </div>
                                ) }

                                { role==='doctor'&&(
                                        <div className={ styles.formRow }>
                                                <motion.div className={ styles.inputGroup } whileHover={ { scale: 1.02 } }>
                                                        <label htmlFor="specialty">Specialty:</label>
                                                        <input
                                                                type="text"
                                                                id="specialty"
                                                                name="specialty"
                                                                value={ formData.specialty }
                                                                onChange={ handleChange }
                                                                className={ styles.input }
                                                                required
                                                        />
                                                </motion.div>
                                                <motion.div className={ styles.inputGroup } whileHover={ { scale: 1.02 } }>
                                                        <label htmlFor="hospital_id">Hospital:</label>
                                                        <select
                                                                id="hospital_id"
                                                                name="hospital_id"
                                                                value={ formData.hospital_id }
                                                                onChange={ handleChange }
                                                                className={ styles.input }
                                                                required
                                                        >
                                                                <option value="">Select Hospital</option>
                                                                { hospitals.map( ( hospital ) => (
                                                                        <option key={ hospital.id } value={ hospital.id }>
                                                                                { hospital.name }
                                                                        </option>
                                                                ) ) }
                                                        </select>
                                                </motion.div>
                                        </div>
                                ) }

                                <motion.button
                                        type="submit"
                                        className={ styles.button }
                                        whileHover={ { scale: 1.05 } }
                                        whileTap={ { scale: 0.95 } }
                                >
                                        Register
                                </motion.button>
                        </form>
                </div>
        );
};

export default Register;