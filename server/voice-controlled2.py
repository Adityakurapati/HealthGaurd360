from flask import Flask, request, jsonify, send_from_directory
import os
import logging
import firebase_admin
from firebase_admin import credentials, db
import re
import dateparser
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

# Initialize Firebase (reusing your existing code)
try:
    cred = credentials.Certificate('credentials/firebase-credentials.json')
    firebase_admin.initialize_app(cred, {
        "databaseURL": "https://healthgaurd360-426f4-default-rtdb.asia-southeast1.firebasedatabase.app/"
    })
    # Reference the root of the database
    ref = db.reference('/')
except Exception as e:
    logging.error(f"Firebase initialization error: {e}")
    # You might want to set up a fallback for testing without Firebase

# Global variables to store IDs (reusing your existing code)
global_patient_id = "-O7dVDeL9uJpmvgknDaO"
global_doctor_id = "-O7dUwf9UY1b6agngcho"

# Import all your existing command handler functions
# Command handler with expanded operations (reusing your existing code)
def handle_command(command):
    command = command.lower()
    if re.search(r'\b(add|appointment)\b', command) and not re.search(r'\b(show)\b', command):
        return add_appointment_command(command)
    elif re.search(r'\b(list|show)\b.*\b(hospitals)\b', command):
        match = re.search(r'\b(list|show)\b\s*(\d*)\b.*\b(hospitals)\b', command)
        count = int(match.group(2)) if match and match.group(2) else 5
        return show_nearby_hospitals_command(count)
    elif re.search(r'what disease starts with (\w)', command):
        match = re.search(r'what disease starts with (\w)', command)
        letter = match.group(1).upper()
        return show_disease_by_letter_command(letter)
    elif re.search(r'\b(my patients|show patients)\b', command):
        return show_my_patients_command(global_doctor_id)
    elif re.search(r'\b(available doctors|doctors)\b', command):
        return show_available_doctors_command()
    elif re.search(r'\b(show|my)\b.*\b(appointment|appointments)\b', command):
        return show_my_appointments_command(global_patient_id)
    elif re.search(r'\b(heart rate|blood oxygen|sensor data)\b', command):
        return show_sensor_data_command()
    elif re.search(r'\b(news|health news)\b', command):
        return show_health_news_command()
    elif re.search(r'\b(user|patient) info\b', command):
        return show_user_info_command()
    elif re.search(r'\b(disease|condition) info\b', command):
        return show_disease_info_command()
    elif re.search(r'\b(hospital|clinic) info\b', command):
        return show_hospital_info_command()
    else:
        return "I'm sorry, I don't understand that command. Can you please rephrase or ask something else?"

# Include all your existing command functions here
def add_appointment_command(command):
    # Extract information from the command
    doctor_id = global_doctor_id or "123"
    patient_id = global_patient_id or "456"
    appointment_time = "10:00 AM"
    
    # Extract date information
    date_match = re.search(r'\bat\s*(.*)\b', command)
    appointment_date = dateparser.parse(date_match.group(1)) if date_match else dateparser.parse("next week")
    
    if not appointment_date:
        return "Could not understand the date. Please specify a valid date."

    # Extract age and gender
    age_match = re.search(r'\bage\s*(\d{1,2})\b', command)
    gender_match = re.search(r'\b(male|female|other)\b', command)
    age = age_match.group(1) if age_match else "Unknown"
    gender = gender_match.group(1) if gender_match else "Unknown"

    # Prepare appointment data
    appointment_data = {
        "doctor_id": doctor_id,
        "patient_id": patient_id,
        "date": appointment_date.strftime('%Y-%m-%d'),
        "time": appointment_time,
        "age": age,
        "gender": gender,
    }

    appointments_ref = ref.child('appointments')
    new_appointment_ref = appointments_ref.push(appointment_data)
    
    return f"Appointment added successfully for {appointment_date.strftime('%A, %Y-%m-%d')}. Age: {age}, Gender: {gender}."

def show_my_patients_command(doctor_id):
    logging.debug(f"Starting show_my_patients_command for Doctor ID: {doctor_id}")
    appointments_ref = ref.child('appointments')
    appointments = appointments_ref.order_by_child('doctor_id').equal_to(global_doctor_id).get()
    
    if appointments:
        phrases = []
        for appointment_id, appointment_data in appointments.items():
            patient_id = appointment_data['patient_id']
            patient_ref = ref.child('users').child('patients').child(patient_id)
            patient_data = patient_ref.get()
            
            if patient_data:
                patient_name = patient_data.get('name', 'Unknown Name')
                patient_gender = patient_data.get('gender', 'Unknown Gender')
                patient_age = appointment_data.get('age', 'Unknown Age')
                appointment_time = appointment_data.get('time', 'Unknown Time')
                appointment_date = appointment_data.get('date', 'Unknown Date')
                
                phrase = (f"{len(phrases) + 1}st patient {patient_name} is {patient_gender}, "
                          f"has booked an appointment at {appointment_time} on {appointment_date}, "
                          f"and their age is {patient_age}.")
                
                phrases.append(phrase)
        
        logging.debug(f"Appointments and patient details found: {phrases}")
        return " ".join(phrases)
    else:
        logging.debug(f"No appointments found for Doctor ID: {global_doctor_id}")
        return f"No appointments found for Doctor ID: {global_doctor_id}"

def show_nearby_hospitals_command(count):
    logging.debug(f"Fetching list of {count} nearby hospitals")
    # Assuming hospitals data is stored in Firebase under 'hospitals'
    hospitals_ref = ref.child('hospitals')
    hospitals = hospitals_ref.order_by_key().limit_to_first(count).get()
    
    if hospitals:
        phrases = []
        for idx, (hospital_id, hospital_data) in enumerate(hospitals.items()):
            hospital_name = hospital_data.get('name', 'Unknown Hospital')
            hospital_address = hospital_data.get('address', 'No address provided')
            phrases.append(f"{idx + 1}. {hospital_name} located at {hospital_address}.")
        
        return "Here are the nearest hospitals: " + " ".join(phrases)
    else:
        return "No hospitals found in your vicinity."

def show_disease_by_letter_command(letter):
    logging.debug(f"Fetching diseases that start with the letter {letter}")
    # Assuming disease data is stored in Firebase under 'diseases'
    diseases_ref = ref.child('diseases')
    diseases = diseases_ref.order_by_child('name').start_at(letter).end_at(letter + "\uf8ff").get()
    
    if diseases:
        disease_list = [disease_data['name'] for disease_id, disease_data in diseases.items()]
        return f"Diseases that start with {letter}: " + ", ".join(disease_list)
    else:
        return f"No diseases found that start with the letter {letter}."

def show_available_doctors_command():
    logging.debug("Fetching list of available doctors")
    # Assuming doctors data is stored in Firebase under 'doctors'
    doctors_ref = ref.child('users').child('doctors')
    doctors = doctors_ref.order_by_child('available').equal_to(True).get()
    
    if doctors:
        doctor_list = [f"Dr. {doctor_data['name']} ({doctor_data.get('specialty', 'General')})" 
                       for doctor_id, doctor_data in doctors.items()]
        return "Here are the available doctors: " + ", ".join(doctor_list)
    else:
        return "No available doctors at the moment."

def show_my_appointments_command(patient_id):
    logging.debug(f"Fetching appointments for Patient ID: {patient_id}")
    appointments_ref = ref.child('appointments')
    appointments = appointments_ref.order_by_child('patient_id').equal_to(patient_id).get()
    
    if appointments:
        phrases = []
        for appointment_id, appointment_data in appointments.items():
            doctor_id = appointment_data.get('doctor_id', 'Unknown Doctor')
            appointment_date = appointment_data.get('date', 'Unknown Date')
            appointment_time = appointment_data.get('time', 'Unknown Time')

            # Fetch doctor name from 'doctors'
            doctor_ref = ref.child('users').child('doctors').child(doctor_id)
            doctor_data = doctor_ref.get()
            doctor_name = doctor_data.get('name', 'Unknown Doctor Name') if doctor_data else 'Unknown Doctor Name'
            
            phrases.append(f"Appointment with Dr. {doctor_name} on {appointment_date} at {appointment_time}.")
        
        return " ".join(phrases)
    else:
        return "You have no appointments."

def show_sensor_data_command():
    logging.debug("Fetching sensor data")
    # Assuming sensor data is stored in Firebase under 'sensor_data'
    sensor_data_ref = ref.child('sensor_data')
    sensor_data = sensor_data_ref.order_by_key().limit_to_last(1).get()
    
    if sensor_data:
        latest_data = list(sensor_data.values())[0]
        heart_rate = latest_data.get('heart_rate', 'Unknown')
        blood_oxygen = latest_data.get('blood_oxygen', 'Unknown')
        return f"Your latest heart rate is {heart_rate} bpm, and blood oxygen level is {blood_oxygen}%."
    else:
        return "No sensor data found."

def show_health_news_command():
    logging.debug("Fetching health news")
    # Assuming health news is stored in Firebase under 'health_news'
    news_ref = ref.child('health_news')
    latest_news = news_ref.order_by_key().limit_to_last(1).get()
    
    if latest_news:
        news_data = list(latest_news.values())[0]
        headline = news_data.get('headline', 'Unknown Headline')
        details = news_data.get('details', 'No details available')
        return f"Latest health news: {headline}. Details: {details}"
    else:
        return "No health news available."

def show_user_info_command():
    logging.debug(f"Fetching information for Patient ID: {global_patient_id}")
    patient_ref = ref.child('users').child('patients').child(global_patient_id)
    patient_data = patient_ref.get()
    
    if patient_data:
        patient_name = patient_data.get('name', 'Unknown')
        patient_gender = patient_data.get('gender', 'Unknown')
        patient_age = patient_data.get('age', 'Unknown')
        return f"Patient Info: Name: {patient_name}, Gender: {patient_gender}, Age: {patient_age}."
    else:
        return "Patient information not found."

def show_disease_info_command():
    logging.debug("Fetching disease information")
    # Assuming disease information is stored in Firebase under 'diseases'
    diseases_ref = ref.child('diseases')
    diseases = diseases_ref.order_by_key().limit_to_first(1).get()
    
    if diseases:
        disease_data = list(diseases.values())[0]
        return f"Disease Info: Name: {disease_data.get('name', 'Unknown')}, Description: {disease_data.get('description', 'No description available')}."
    else:
        return "No disease information available."

def show_hospital_info_command():
    logging.debug("Fetching hospital information")
    # Assuming hospital information is stored in Firebase under 'hospitals'
    hospitals_ref = ref.child('hospitals')
    hospitals = hospitals_ref.order_by_key().limit_to_first(1).get()
    
    if hospitals:
        hospital_data = list(hospitals.values())[0]
        return f"Hospital Info: Name: {hospital_data.get('name', 'Unknown')}, Address: {hospital_data.get('address', 'No address available')}."
    else:
        return "No hospital information available."

# Add a fallback mode for testing when Firebase is not available
def get_dummy_response(command):
    dummy_responses = {
        "add appointment": "Appointment added successfully for Monday, 2025-03-10. Age: Unknown, Gender: Unknown.",
        "show my appointments": "Appointment with Dr. Smith on 2025-03-12 at 10:00 AM.",
        "list hospitals": "Here are the nearest hospitals: 1. City Hospital located at 123 Main St. 2. Community Medical Center located at 456 Park Ave.",
        "show available doctors": "Here are the available doctors: Dr. Smith (Cardiology), Dr. Johnson (Pediatrics).",
        "what disease starts with a": "Diseases that start with A: Asthma, Arthritis, Alzheimer's",
        "show heart rate": "Your latest heart rate is 72 bpm, and blood oxygen level is 98%.",
        "show my patients": "1st patient John Doe is male, has booked an appointment at 10:00 AM on 2025-03-15, and their age is 45.",
        "health news": "Latest health news: New breakthrough in diabetes treatment. Details: Researchers discover potential new therapy for type 2 diabetes."
    }
    
    for key in dummy_responses:
        if key in command.lower():
            return dummy_responses[key]
    
    return "I'm sorry, I don't understand that command. Can you please rephrase or ask something else?"

# Define Flask routes
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/process-command', methods=['POST'])
def process_command():
    try:
        data = request.get_json()
        command = data.get('command', '')
        logging.debug(f"Received command: {command}")
        
        try:
            # Try to use the real Firebase-based handler
            response_text = handle_command(command)
        except Exception as e:
            logging.error(f"Error processing with Firebase: {e}")
            # Fall back to dummy responses if Firebase fails
            response_text = get_dummy_response(command)
            
        return jsonify({
            'success': True,
            'response': response_text
        })
    except Exception as e:
        logging.error(f"Error in process_command: {e}")
        return jsonify({
            'success': False,
            'response': "Sorry, there was an error processing your command."
        }), 500

# Add to the bottom of your app.py file:
if __name__ == '__main__':
    # For development with HTTPS support
    try:
        # Try to run with HTTPS (for microphone access)
        from OpenSSL import SSL
        context = SSL.Context(SSL.TLSv1_2_METHOD)
        context.use_privatekey_file('ssl/key.pem')
        context.use_certificate_file('ssl/cert.pem')
        print("Running with HTTPS on 0.0.0.0:5000")
        app.run(host='0.0.0.0', port=5000, debug=True, ssl_context=('ssl/cert.pem', 'ssl/key.pem'))
    except Exception as e:
        # Fallback to HTTP
        print(f"HTTPS setup failed: {e}")
        print("Running with HTTP on 0.0.0.0:5000 (microphone may not work on mobile)")
        app.run(host='0.0.0.0', port=5000)