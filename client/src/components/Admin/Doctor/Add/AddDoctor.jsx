import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Phone, User } from 'lucide-react';
import styles from './addDoctor.module.css';

const AddDoctor=() =>
{
        const [ doctor, setDoctor ]=useState( {
                name: '',
                specialty: '',
                contact: '',
        } );

        const handleChange=( e ) =>
        {
                setDoctor( {
                        ...doctor,
                        [ e.target.name ]: e.target.value,
                } );
        };

        const handleSubmit=async ( e ) =>
        {
                e.preventDefault();
                try
                {
                        const response=await fetch( '/api/add-doctor', {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                body: JSON.stringify( doctor ),
                        } );
                        const data=await response.json();
                        if ( response.ok )
                        {
                                alert( 'Doctor added successfully!' );
                                setDoctor( { name: '', specialty: '', contact: '' } );
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
                <motion.div
                        className={ styles.container }
                        initial={ { opacity: 0, y: 50 } }
                        animate={ { opacity: 1, y: 0 } }
                        transition={ { duration: 0.6 } }
                >
                        <h2 className={ styles.title }>
                                <Stethoscope className={ styles.icon } />
                                Add New Doctor
                        </h2>
                        <motion.form
                                onSubmit={ handleSubmit }
                                className={ styles.form }
                                initial={ { opacity: 0 } }
                                animate={ { opacity: 1 } }
                                transition={ { delay: 0.2, duration: 0.8 } }
                        >
                                <div className={ styles.formGroup }>
                                        <label className={ styles.label }>
                                                <User className={ styles.inputIcon } /> Name:
                                        </label>
                                        <motion.input
                                                type="text"
                                                name="name"
                                                value={ doctor.name }
                                                onChange={ handleChange }
                                                required
                                                className={ styles.input }
                                                whileFocus={ { scale: 1.05 } }
                                        />
                                </div>

                                <div className={ styles.formGroup }>
                                        <label className={ styles.label }>
                                                <Stethoscope className={ styles.inputIcon } /> Specialty:
                                        </label>
                                        <motion.input
                                                type="text"
                                                name="specialty"
                                                value={ doctor.specialty }
                                                onChange={ handleChange }
                                                required
                                                className={ styles.input }
                                                whileFocus={ { scale: 1.05 } }
                                        />
                                </div>

                                <div className={ styles.formGroup }>
                                        <label className={ styles.label }>
                                                <Phone className={ styles.inputIcon } /> Contact:
                                        </label>
                                        <motion.input
                                                type="text"
                                                name="contact"
                                                value={ doctor.contact }
                                                onChange={ handleChange }
                                                required
                                                className={ styles.input }
                                                whileFocus={ { scale: 1.05 } }
                                        />
                                </div>

                                <motion.button
                                        type="submit"
                                        className={ styles.submitButton }
                                        whileHover={ { scale: 1.1 } }
                                        whileTap={ { scale: 0.95 } }
                                >
                                        Add Doctor
                                </motion.button>
                        </motion.form>
                </motion.div>
        );
};

export default AddDoctor;
