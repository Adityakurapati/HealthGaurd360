import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './style.module.css'; // Import CSS module

const AppointmentsList = ({ doctorId }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch appointments for the specific doctor
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`/api/appointments/${doctorId}`); // Fixed string interpolation
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  const toggleCompletion = async (appointmentId) => {
    try {
      const response = await axios.patch(`/api/appointments/toggle-complete/${appointmentId}`); // Fixed string interpolation
      setAppointments((prevAppointments) =>
        prevAppointments.map((app) =>
          app.id === appointmentId
            ? { ...app, completed: response.data.completed }
            : app
        )
      );
    } catch (error) {
      console.error('Error toggling appointment completion:', error);
    }
  };

  // Function to handle "View More" and fetch additional data
  const viewMoreDetails = async (appointmentId) => {
    try {
      const response = await axios.get(`/api/appointments/details/${appointmentId}`); // Fixed string interpolation
      setSelectedAppointment(response.data); // Set the fetched details into state
      setIsModalOpen(true); // Open the modal
    } catch (error) {
      console.error('Error fetching appointment details:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div className={styles.appointmentsContainer}>
      <h2 className={styles.title}>Appointments Data</h2>
      <div className={styles.appointmentsList}>
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentCard}>
              <div className={styles.patientIcon}>
                <i className="fas fa-user"></i>
              </div>
              <div className={styles.appointmentDetails}>
                <p className={styles.patientName}>{appointment.patient_name}</p>
                <p className={styles.location}>{appointment.location}</p>
              </div>
              <div className={styles.actions}>
                <button
                  className={`${styles.viewMoreButton} ${styles.actionButton}`} // Fixed string interpolation for className
                  onClick={() => viewMoreDetails(appointment.id)}
                >
                  View More ➔
                </button>
                <button
                  className={`${styles.statusButton} ${appointment.completed ? styles.completed : styles.uncompleted}`} // Fixed string interpolation for className
                  onClick={() => toggleCompletion(appointment.id)}
                >
                  {appointment.completed ? 'Completed' : 'Uncompleted'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No appointments found.</p>
        )}
      </div>

      {/* Modal to display detailed information */}
      {isModalOpen && selectedAppointment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={closeModal}>
              ✖
            </button>
            <h3 className={styles.modalTitle}>Appointment Details</h3>
            <p><strong>Patient Name:</strong> {selectedAppointment.patient_name}</p>
            <p><strong>Age:</strong> {selectedAppointment.age}</p>
            <p><strong>Email:</strong> {selectedAppointment.email}</p>
            <p><strong>Mobile:</strong> {selectedAppointment.mobile}</p>
            <p><strong>Disease:</strong> {selectedAppointment.disease}</p>
            <p><strong>Appointment Date:</strong> {selectedAppointment.appointment_date}</p>
            <p><strong>Appointment Time:</strong> {selectedAppointment.appointment_time}</p>
            <p><strong>Status:</strong> {selectedAppointment.status}</p>
            {/* Add more details as per your API */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
