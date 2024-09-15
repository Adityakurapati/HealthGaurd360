import os
import firebase_admin
from firebase_admin import credentials, db
from flask import Flask, jsonify, request
from flask_cors import CORS
import re
import logging
import dateparser
import pyttsx3
from threading import Thread
import speech_recognition as sr
import json
from dotenv import load_env

load_env()

# Set up logging for debugging
logging.basicConfig(level=logging.DEBUG)


# Initialize Firebase
cred = credentials.Certificate('credentials/firebase-credentials.json')
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://healthgaurd360-426f4-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

app = Flask(__name__, static_folder="../client/build")
CORS(app)  # This enables CORS for all routes

# Reference the root of the database
ref = db.reference('/')

# Global variables to store IDs
global_patient_id = os.getenv('PATIENT_ID')
global_doctor_id = os.getenv('DOCTOR_ID')

# Initialize text-to-speech engine
tts_engine = pyttsx3.init()

# Initialize speech recognition
recognizer = sr.Recognizer()

# Command handler with expanded operations
def handle_command(command):
    command = command.lower()
    if re.search(r'\b(add|appointment)\b', command) and not re.search(r'\b(show)\b', command):
        return add_appointment_command(command)
    elif re.search(r'\b(list|show)\b.*\b(hospitals)\b', command):
        match = re.search(r'\b(list|show)\b\s*(\d*)\b.*\b(hospitals)\b', command)
        count = int(match.group(2)) if match.group(2) else 5
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

@app.route("/api/store_ids", methods=["GET"])
def store_ids():
    global global_patient_id, global_doctor_id

    patient_id = request.args.get('patient_id')
    doctor_id = request.args.get('doctor_id')

    # Check if at least one ID is provided
    if not patient_id and not doctor_id:
        return jsonify({"message": "At least one of patient ID or doctor ID must be provided"}), 400

    # Update the global variables only if they are provided
    if patient_id:
        global_patient_id = patient_id
    if doctor_id:
        global_doctor_id = doctor_id

    return jsonify({"message": "IDs stored successfully", "stored_ids": {"patient_id": global_patient_id, "doctor_id": global_doctor_id}}), 200

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
        return f"Latest sensor data: Heart Rate: {heart_rate}, Blood Oxygen: {blood_oxygen}."
    else:
        return "No sensor data available."

def show_health_news_command():
    logging.debug("Fetching health news")
    # Assuming health news is stored in Firebase under 'news'
    news_ref = ref.child('news')
    news = news_ref.order_by_key().limit_to_last(1).get()
    
    if news:
        latest_news = list(news.values())[0]
        return f"Latest health news: {latest_news.get('headline', 'No headline available')}"
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

@app.route("/api/bot", methods=["POST"])
def bot():
    data = request.get_json()
    command = data.get('command', '')
    response = handle_command(command)
    
    # Speak the response
    tts_engine.say(response)
    tts_engine.runAndWait()
    
    return jsonify({"response": response}), 200

@app.route('/api/speak', methods=['POST'])
def speak():
    data = request.get_json()
    text = data.get('text', '')
    tts_engine.say(text)
    tts_engine.runAndWait()
    return jsonify({"status": "success"}), 200

def listen_for_commands():
    while True:
        with sr.Microphone() as source:
            print("Listening for commands...")
            audio = recognizer.listen(source)
            try:
                command = recognizer.recognize_google(audio)
                print(f"Command received: {command}")
                response = handle_command(command)
                print(f"Response: {response}")
                # Optionally, send the response to a text-to-speech endpoint or handle it as needed
                tts_engine.say(response)
                tts_engine.runAndWait()
            except sr.UnknownValueError:
                print("Sorry, I did not understand that.")
            except sr.RequestError as e:
                print(f"Could not request results; {e}")

if __name__ == "__main__":
    # Start the speech recognition in a separate thread
    Thread(target=listen_for_commands, daemon=True).start()
    app.run(port=5000)
