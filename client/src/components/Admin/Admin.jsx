import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Transition } from '@headlessui/react';
import { Stethoscope, UserPlus, UserCheck, ClipboardList, List } from 'lucide-react';
import AddDoctor from './Doctor/Add/AddDoctor';
import AddPatient from './Patient/Add/AddPatient';
import DoctorList from './Doctor/List/DoctorList';
import PatientList from './Patient/List/PatientList';
import AppointmentList from './Patient/Appointment/AppointmentList'; // Import the AppointmentList component

const styles={
        container: {
                maxWidth: '90rem', // 7xl size in Tailwind
                margin: '0 auto',
                padding: '3rem 1.5rem', // px-6 py-12 in Tailwind
        },
        heading: {
                fontSize: '3rem', // text-5xl in Tailwind
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '3rem',
                background: 'linear-gradient(90deg, #4f46e5, #9333ea)', // Gradient colors
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
        },
        buttonContainer: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '3rem', // gap-12 in Tailwind
        },
        button: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                spaceX: '1.5rem', // Approximation for space-x-6
                background: 'linear-gradient(90deg, #4f46e5, #9333ea)',
                color: 'white',
                padding: '1.5rem 2.5rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
        },
        icon: {
                fontSize: '2.5rem', // text-4xl in Tailwind
        },
        buttonText: {
                fontSize: '1.5rem', // text-2xl in Tailwind
        },
};

const Admin=() =>
{
        const [ view, setView ]=useState( 'options' );

        const renderView=() =>
        {
                switch ( view )
                {
                        case 'addDoctor':
                                return <AddDoctor />;
                        case 'addPatient':
                                return <AddPatient />;
                        case 'doctorList':
                                return <DoctorList />;
                        case 'patientList':
                                return <PatientList />;
                        case 'appointmentList': // New case for appointment list
                                return <AppointmentList />;
                        default:
                                return (
                                        <motion.div
                                                initial={ { opacity: 0, y: 20 } }
                                                animate={ { opacity: 1, y: 0 } }
                                                transition={ { duration: 0.5 } }
                                                style={ styles.buttonContainer }
                                        >
                                                <AnimatedButton icon={ <Stethoscope /> } onClick={ () => setView( 'addDoctor' ) }>
                                                        Add Doctor
                                                </AnimatedButton>
                                                <AnimatedButton icon={ <UserPlus /> } onClick={ () => setView( 'addPatient' ) }>
                                                        Add Patient
                                                </AnimatedButton>
                                                <AnimatedButton icon={ <UserCheck /> } onClick={ () => setView( 'doctorList' ) }>
                                                        Show Doctors
                                                </AnimatedButton>
                                                <AnimatedButton icon={ <ClipboardList /> } onClick={ () => setView( 'patientList' ) }>
                                                        Show Patients
                                                </AnimatedButton>
                                                <AnimatedButton icon={ <List /> } onClick={ () => setView( 'appointmentList' ) }> {/* New button for Appointment List */ }
                                                        Show Appointments
                                                </AnimatedButton>
                                        </motion.div>
                                );
                }
        };

        return (
                <div style={ styles.container }>
                        <h1 style={ styles.heading }>
                                Admin Dashboard
                        </h1>
                        <Transition
                                show={ true }
                                enter="transition-opacity duration-500"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="transition-opacity duration-500"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                        >
                                { renderView() }
                        </Transition>
                </div>
        );
};

// Interactive button with animation
const AnimatedButton=( { icon, onClick, children } ) => (
        <motion.button
                whileHover={ { scale: 1.2, rotate: 5 } }
                whileTap={ { scale: 0.95 } }
                style={ styles.button }
                onClick={ onClick }
        >
                <motion.div
                        whileHover={ { rotate: [ 0, 15, -15, 0 ] } }
                        style={ styles.icon }
                >
                        { icon }
                </motion.div>
                <span style={ styles.buttonText }>{ children }</span>
        </motion.button>
);

export default Admin;
