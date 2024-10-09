import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import styles from './messaging.module.css';  // Import the CSS module

const MessagingApp = ({ patientId, doctors }) => {
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch messages between patient and selected doctor
    useEffect(() => {
        if (selectedDoctorId) {
            const fetchMessages = async () => {
                try {
                    const response = await axios.get('/api/messages', {
                        params: {
                            doctor_id: selectedDoctorId,
                            patient_id: patientId,
                        },
                    });

                    setMessages(response.data);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            };
            fetchMessages();
        }
    }, [selectedDoctorId, patientId]);

    // Send a new message
    const sendMessage = async () => {
        try {
            const newMessage = {
                sender_id: patientId,
                receiver_id: selectedDoctorId,
                message_text: messageText,
                sender_role: 'patient',
            };

            // Post the new message to the Flask API
            const response = await axios.post('/api/messages/send', newMessage);

            // Update the local state with the new message and reset input field
            setMessages([...messages, {
                ...newMessage,
                timestamp: Date.now(),
                id: response.data.message_id,  // Use the ID returned by the backend
            }]);
            setMessageText('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Filter doctors based on the search term
    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.messagingAppContainer}>
            {/* Left Side: Doctor List with Search */}
            <div className={styles.doctorList}>
                <h3>Your Doctors</h3>
                <input
                    type="text"
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
                {filteredDoctors.length === 0 ? (
                    <p>No doctors found.</p>
                ) : (
                    filteredDoctors.map(doctor => (
                        <motion.div
                            key={doctor.id}
                            className={`${styles.doctorItem} ${selectedDoctorId === doctor.id ? styles.active : ''}`}
                            onClick={() => setSelectedDoctorId(doctor.id)}
                            whileHover={{ scale: 1.02 }} // Hover animation
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <span>{doctor.name}</span>
                            {doctor.unread_count > 0 && (
                                <span className={styles.unreadBubble}>{doctor.unread_count}</span>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Right Side: Messages with Selected Doctor */}
            <div className={styles.messageView}>
                {selectedDoctorId ? (
                    <>
                        <motion.div
                            className={styles.messageList}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }} // Fade-in animation
                        >
                            {messages.length > 0 ? (
                                messages.map((message, index) => (
                                    <motion.div
                                        key={index}
                                        className={`${styles.message} ${message.sender_role === 'doctor' ? styles.doctorMessage : styles.patientMessage}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.1, duration: 0.3 }} // Fade-in each message
                                    >
                                        <p>
                                            <strong>{message.sender_role === 'doctor' ? 'Doctor' : 'You'}:</strong> {message.message_text}
                                        </p>
                                    </motion.div>
                                ))
                            ) : (
                                <p>No messages yet.</p>
                            )}
                        </motion.div>
                        <motion.div
                            className={styles.messageInput}
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            transition={{ type: 'spring', stiffness: 300 }} // Slide-up animation
                        >
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type your message..."
                                className={styles.textarea}
                            />
                            <motion.button
                                onClick={sendMessage}
                                className={styles.sendButton}
                                whileHover={{ scale: 1.05 }} // Hover animation
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                Send
                            </motion.button>
                        </motion.div>
                    </>
                ) : (
                    <div className={styles.noDoctorSelected}>Select a doctor to start messaging.</div>
                )}
            </div>
        </div>
    );
};

export default MessagingApp;
