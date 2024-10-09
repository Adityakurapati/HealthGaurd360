import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import styles from './messaging.module.css'; // Import CSS module

function MessagingComponent ( { doctorId } )
{
        const [ patients, setPatients ]=useState( [] );  // List of patients
        const [ selectedPatientId, setSelectedPatientId ]=useState( null );  // Currently selected patient
        const [ messages, setMessages ]=useState( [] );  // Messages with the selected patient
        const [ newMessage, setNewMessage ]=useState( "" );

        // Fetch the list of patients for the doctor
        useEffect( () =>
        {
                axios.get( `/api/patients?doctor_id=${ doctorId }` )
                        .then( response => setPatients( response.data ) )
                        .catch( error => console.error( "Error fetching patients:", error ) );
        }, [ doctorId ] );

        // Fetch messages between doctor and selected patient
        useEffect( () =>
        {
                if ( selectedPatientId )
                {
                        axios.get( `/api/messages?doctor_id=${ doctorId }&patient_id=${ selectedPatientId }` )
                                .then( response => setMessages( response.data ) )
                                .catch( error => console.error( "Error fetching messages:", error ) );
                }
        }, [ doctorId, selectedPatientId ] );

        // Handle sending messages
        const sendMessage=() =>
        {
                if ( newMessage.trim()==="" ) return;

                const messageData={
                        sender_id: doctorId,
                        receiver_id: selectedPatientId,
                        message_text: newMessage,
                        sender_role: "doctor"
                };

                axios.post( '/api/messages/send', messageData )
                        .then( () =>
                        {
                                // Add new message to the local state
                                setMessages( prevMessages => [
                                        ...prevMessages,
                                        { ...messageData, timestamp: new Date().toISOString() }
                                ] );
                                setNewMessage( "" );
                        } )
                        .catch( error => console.error( "Error sending message:", error ) );
        };

        return (
                <div>

                
                 
                <motion.div
                        className={ styles.messagingComponent }
                        initial={ { opacity: 0, x: -100 } }
                        animate={ { opacity: 1, x: 0 } }
                        transition={ { duration: 0.5 } }
                >
                        <motion.div
                                className={ styles.patientList }
                                initial={ { opacity: 0, x: -100 } }
                                animate={ { opacity: 1, x: 0 } }
                                transition={ { duration: 0.5, delay: 0.2 } }
                        >
                                <h3>Select a Patient</h3>
                                <ul>
                                        { patients.map( patient => (
                                                <motion.li
                                                        key={ patient.id }
                                                        onClick={ () => setSelectedPatientId( patient.id ) }
                                                        className={ selectedPatientId===patient.id? styles.activePatient:"" }
                                                        whileHover={ { scale: 1.05 } }
                                                        transition={ { type: 'spring', stiffness: 300 } }
                                                >
                                                        { patient.name }
                                                </motion.li>
                                        ) ) }
                                </ul>
                        </motion.div>

                        { selectedPatientId? (
                                <motion.div
                                        className={ styles.chatScreen }
                                        initial={ { opacity: 0, x: 100 } }
                                        animate={ { opacity: 1, x: 0 } }
                                        transition={ { duration: 0.5 } }
                                >
                                        <h3>Messages with { patients.find( p => p.id===selectedPatientId )?.name }</h3>
                                        <motion.div
                                                className={ styles.messages }
                                                initial={ { opacity: 0 } }
                                                animate={ { opacity: 1 } }
                                                transition={ { duration: 0.5 } }
                                        >
                                                { messages.length>0? (
                                                        messages.map( msg => (
                                                                <motion.div
                                                                        key={ msg.message_id }
                                                                        className={ styles.message }
                                                                        initial={ { opacity: 0 } }
                                                                        animate={ { opacity: 1 } }
                                                                        transition={ { duration: 0.5 } }
                                                                >
                                                                        <strong>{ msg.sender_role==='doctor'? 'You':'Patient' }:</strong> { msg.message_text }
                                                                        <span className={ styles.timestamp }>{ new Date( msg.timestamp ).toLocaleString() }</span>
                                                                </motion.div>
                                                        ) )
                                                ):(
                                                        <p>No messages found.</p>
                                                ) }
                                        </motion.div>
                                        <motion.input
                                                type="text"
                                                value={ newMessage }
                                                onChange={ e => setNewMessage( e.target.value ) }
                                                placeholder="Type a message"
                                                className={ styles.inputMessage }
                                                whileFocus={ { scale: 1.02 } }
                                                transition={ { type: 'spring', stiffness: 300 } }
                                        />
                                        <motion.button
                                                onClick={ sendMessage }
                                                className={ styles.sendButton }
                                                whileHover={ { scale: 1.05 } }
                                                transition={ { type: 'spring', stiffness: 300 } }
                                        >
                                                Send
                                        </motion.button>
                                </motion.div>
                        ):(
                                <motion.div
                                        className={ styles.selectPatientMessage }
                                        initial={ { opacity: 0 } }
                                        animate={ { opacity: 1 } }
                                        transition={ { duration: 0.5 } }
                                >
                                        <p>Please select a patient to start messaging.</p>
                                </motion.div>
                        ) }
                </motion.div>
                </div>
        );

}

export default MessagingComponent;
