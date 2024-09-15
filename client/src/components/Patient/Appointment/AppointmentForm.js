import React, { useState, useEffect } from 'react';
import './AppointmentForm.css';
import Modal from '../Modal/Modal';

function AppointmentForm ( { doctors } )
{
        const [ formData, setFormData ]=useState( {
                patient_name: '',
                age: '',
                mobile: '',
                doctor_id: '',
                disease: '',
                appointment_date: '',
                appointment_time: '',
                email: ''
        } );

        const [ isModalOpen, setIsModalOpen ]=useState( false );
        const [ modalMessage, setModalMessage ]=useState( '' );

        // Update form data based on input changes
        const handleChange=( e ) =>
        {
                setFormData( {
                        ...formData,
                        [ e.target.name ]: e.target.value
                } );
        };

        // Handle form submission
        const handleSubmit=( e ) =>
        {
                e.preventDefault();

                const appointmentData={
                        ...formData,
                        appointment_date: `${ formData.appointment_date }T${ formData.appointment_time }`,
                        status: 'Confirmed'
                };

                fetch( '/api/add-appointment', {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json'
                        },
                        body: JSON.stringify( appointmentData )
                } )
                        .then( response => response.json() )
                        .then( data =>
                        {
                                if ( data.success )
                                {
                                        setModalMessage( "Appointment booked successfully!" );
                                        setIsModalOpen( true );
                                        // Reset form
                                        setFormData( {
                                                patient_name: '',
                                                age: '',
                                                mobile: '',
                                                doctor_id: '',
                                                disease: '',
                                                appointment_date: '',
                                                appointment_time: '',
                                                email: ''
                                        } );
                                } else
                                {
                                        setModalMessage( "Error booking appointment: "+data.error );
                                        setIsModalOpen( true );
                                }
                        } )
                        .catch( error =>
                        {
                                setModalMessage( "Error: "+error );
                                setIsModalOpen( true );
                        } );
        };

        // Close modal
        const closeModal=() =>
        {
                setIsModalOpen( false );
        };

        return (
                <div className="appointment-form">
                        <div className="form-container">
                                <h2>Book An Appointment</h2>
                                <form onSubmit={ handleSubmit }>
                                        <div className="form-row">
                                                <div className="form-group">
                                                        <label htmlFor="patient_name">Your Name*</label>
                                                        <input
                                                                type="text"
                                                                id="patient_name"
                                                                name="patient_name"
                                                                required
                                                                value={ formData.patient_name }
                                                                onChange={ handleChange }
                                                        />
                                                </div>
                                                <div className="form-group">
                                                        <label htmlFor="age">Age*</label>
                                                        <input
                                                                type="number"
                                                                id="age"
                                                                name="age"
                                                                required
                                                                value={ formData.age }
                                                                onChange={ handleChange }
                                                        />
                                                </div>
                                                <div className="form-group">
                                                        <label htmlFor="mobile">Mobile No.*</label>
                                                        <input
                                                                type="tel"
                                                                id="mobile"
                                                                name="mobile"
                                                                required
                                                                value={ formData.mobile }
                                                                onChange={ handleChange }
                                                        />
                                                </div>
                                        </div>
                                        <div className="form-row">
                                                <div className="form-group">
                                                        <label htmlFor="appointment_date">Select Date*</label>
                                                        <input
                                                                type="date"
                                                                id="appointment_date"
                                                                name="appointment_date"
                                                                required
                                                                value={ formData.appointment_date }
                                                                onChange={ handleChange }
                                                        />
                                                </div>
                                                <div className="form-group">
                                                        <label htmlFor="appointment_time">Time*</label>
                                                        <input
                                                                type="time"
                                                                id="appointment_time"
                                                                name="appointment_time"
                                                                required
                                                                value={ formData.appointment_time }
                                                                onChange={ handleChange }
                                                        />
                                                </div>
                                                <div className="form-group">
                                                        <label htmlFor="email">Email</label>
                                                        <input
                                                                type="email"
                                                                id="email"
                                                                name="email"
                                                                value={ formData.email }
                                                                onChange={ handleChange }
                                                        />
                                                </div>
                                        </div>
                                        <div className="form-group">
                                                <label htmlFor="doctor_id">Select Doctor*</label>
                                                <select
                                                        id="doctor_id"
                                                        name="doctor_id"
                                                        required
                                                        value={ formData.doctor_id }
                                                        onChange={ handleChange }
                                                >
                                                        <option value="">Choose a doctor</option>
                                                        { doctors.map( doctor => (
                                                                <option key={ doctor.id } value={ doctor.id }>
                                                                        { doctor.name } - { doctor.specialty||'Specialty not specified' }
                                                                </option>
                                                        ) ) }
                                                </select>
                                        </div>
                                        <div className="form-group">
                                                <label htmlFor="disease">Mention Your Disease</label>
                                                <textarea
                                                        id="disease"
                                                        name="disease"
                                                        value={ formData.disease }
                                                        onChange={ handleChange }
                                                ></textarea>
                                        </div>
                                        <div className="button-group">
                                                <button type="submit">Book Appointment</button>
                                        </div>
                                </form>
                        </div>
                        <div className="image-container">
                                <img src="/img/front.jpg" alt="Medical Illustration" />
                        </div>
                        <Modal isOpen={ isModalOpen } onClose={ closeModal } message={ modalMessage } />
                </div>
        );
}

export default AppointmentForm;
