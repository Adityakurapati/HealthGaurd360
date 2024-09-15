import os
import firebase_admin
from firebase_admin import credentials, db
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import re
import logging
import dateparser
from datetime import datetime, timedelta
import threading
import schedule
import time
import vonage
import json
from dotenv import load_env

load_env()


# Initialize Firebase
cred = credentials.Certificate('credentials/firebase-credentials.json')
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://healthgaurd360-426f4-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

app = Flask(__name__)
CORS(app)  # This enables CORS for all routes

# Global variables to store IDs
global_patient_id = os.getenv('PATIENT_ID')
global_doctor_id = os.getenv('DOCTOR_ID')

# Vonage setup
VONAGE_API_KEY = 'e0e01efd'
VONAGE_API_SECRET = 'klP3b1gpcuDrxsBE'
VONAGE_BRAND_NAME = 'HealthGaurd360'

vonage_client = vonage.Client(key=VONAGE_API_KEY, secret=VONAGE_API_SECRET)
sms = vonage.Sms(vonage_client)

# Global Firebase reference
ref = db.reference('/')

# Send an SMS alert using Vonage
def send_sms_alert(patient_phone, appointment_time, doctor_name):
    message = f"Reminder: You have an appointment with Dr. {doctor_name} at {appointment_time}. Please be on time."
    responseData = sms.send_message(
        {
            "from": VONAGE_BRAND_NAME,
            "to": patient_phone,
            "text": message,
        }
    )
    if responseData["messages"][0]["status"] == "0":
        print(f"SMS alert sent successfully to {patient_phone} for appointment at {appointment_time}.")
    else:
        print(f"Failed to send SMS to {patient_phone}. Error: {responseData['messages'][0]['error-text']}")

# Check if an appointment is within the next 30 minutes or 1 hour
def check_upcoming_appointments():
    print("Checking upcoming appointments...")
    # Get current time
    current_time = datetime.now()
    
    # Reference to the appointments node
    appointments_ref = ref.child('appointments')
    appointments = appointments_ref.get()

    # Loop through all appointments
    if appointments:
        for appointment_id, appointment_data in appointments.items():
            appointment_date = appointment_data.get('date')
            appointment_time = appointment_data.get('time')
            doctor_id = appointment_data.get('doctor_id')
            patient_id = appointment_data.get('patient_id')

            # Convert date and time to a datetime object
            appointment_datetime_str = f"{appointment_date} {appointment_time}"
            appointment_datetime = datetime.strptime(appointment_datetime_str, "%Y-%m-%d %I:%M %p")
            
            # Calculate the time difference
            time_diff = appointment_datetime - current_time
            print(time_diff)

            # Check if the appointment is within the next 30 minutes or 1 hour
            if timedelta(minutes=0) <= time_diff <= timedelta(minutes=30):
                print(f"Appointment for patient {patient_id} with doctor {doctor_id} is in {time_diff}. Sending alert...")
                
                # Get patient and doctor information
                patient_ref = ref.child(f'users/patients/{patient_id}')
                patient_data = patient_ref.get()
                doctor_ref = ref.child(f'users/doctors/{doctor_id}')
                doctor_data = doctor_ref.get()
                
                if patient_data and doctor_data:
                    patient_phone = patient_data.get('contact_number')
                    doctor_name = doctor_data.get('name')
                    
                    # Send SMS alert
                    if patient_phone:
                        send_sms_alert(patient_phone, appointment_datetime.strftime("%I:%M %p"), doctor_name)
                    else:
                        print(f"Phone number not available for patient {patient_id}.")
            else:
                print(f"No upcoming appointments in the next 30 minutes or 1 hour for {appointment_id}.")


# Schedule task to check appointments every minute
def start_scheduler():
    schedule.every(1).minutes.do(check_upcoming_appointments)

    while True:
        schedule.run_pending()
        time.sleep(1)

# Run the scheduler in a background thread
def run_background_scheduler():
    scheduler_thread = threading.Thread(target=start_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    
    
        
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
    elif re.search(r'\b(show|my)\b.*\b(appointments)\b', command):
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

import re
import dateparser
import firebase_admin
from firebase_admin import db

import re
import dateparser

def add_appointment_command(command):
    appointment_time = "10:00 AM"  # Default time if not provided

    # Extract relationships and assign gender (if applicable)
    relationship_match = re.search(r'\b(for my\s+(\w+))\b', command, re.IGNORECASE)
    if relationship_match:
        relationship = relationship_match.group(2).lower()
        if relationship in ["sister", "mom", "mother"]:
            gender = "female"
        elif relationship in ["brother", "dad", "father"]:
            gender = "male"
        else:
            gender = "Unknown"
    else:
        relationship = "self"

    # Extract doctor's name
    doctor_name_match = re.search(r'\bwith doctor\s+(\w+)\b', command, re.IGNORECASE)
    if doctor_name_match:
        doctor_name = doctor_name_match.group(1).lower()  # Convert to lowercase for case-insensitive comparison
    else:
        return "Doctor's name not provided. Please specify a doctor's name."

    # Lookup doctor's ID based on the name (case-insensitive comparison)
    doctors_ref = ref.child('users').child('doctors')
    doctor_data = doctors_ref.order_by_child('name').equal_to(doctor_name).get()

    # Check if doctor_data is not empty
    if doctor_data:
        doctor_id = list(doctor_data.keys())[0]
    else:
        return f"No doctor found with the name {doctor_name.capitalize()}."

    # Fetch patient's details if the appointment is for "self"
    if relationship == "self":
        patients_ref = ref.child('users').child('patients').child(global_patient_id)
        patient_data = patients_ref.get()
        if patient_data:
            gender = patient_data.get('gender', 'Unknown')  # Get gender from database if available
            age = patient_data.get('age', 'Unknown')        # Get age from database if available
        else:
            return "Patient details not found. Please check your patient ID."
    else:
        # If the appointment is for someone else (like sister/brother), extract age if provided
        age_match = re.search(r'\bage\s*(\d{1,2})\b', command)
        age = age_match.group(1) if age_match else "Unknown"

    # Extract date and time information from the command
    date_match = re.search(r'\b(on|at|by)?\s*(\d{1,2}(?:st|nd|rd|th)?\s+\w+)\b', command, re.IGNORECASE)
    if date_match:
        date_string = date_match.group(2)
        appointment_date = dateparser.parse(date_string)
    else:
        appointment_date = None

    # Handle ambiguous or unrecognized dates
    if not appointment_date:
        if "today" in command.lower():
            appointment_date = dateparser.parse("today")
        elif "tomorrow" in command.lower():
            appointment_date = dateparser.parse("tomorrow")
        elif "next week" in command.lower():
            appointment_date = dateparser.parse("next week")
        else:
            return "Could not understand the date. Please specify a valid date or use terms like 'today,' 'tomorrow,' or 'next week.'"

    # Extract time information from the command
    time_match = re.search(r'\b(\d{1,2}:\d{2}\s*(?:AM|PM)?)\b', command, re.IGNORECASE)
    if time_match:
        appointment_time = time_match.group(1)

    # Prepare appointment data
    appointment_data = {
        "doctor_id": doctor_id,
        "patient_id": global_patient_id,  # Ensure this is set or fetched as needed
        "relationship": relationship.capitalize(),
        "date": appointment_date.strftime('%Y-%m-%d'),
        "time": appointment_time,
        "age": age,
        "gender": gender,
    }

    # Push the appointment data to Firebase
    appointments_ref = ref.child('appointments')
    new_appointment_ref = appointments_ref.push(appointment_data)

    return f"Appointment for your {appointment_data['relationship']} added successfully for {appointment_date.strftime('%A, %Y-%m-%d')} at {appointment_time} with Dr. {doctor_name.capitalize()}. Age: {age}, Gender: {gender}."


def show_my_patients_command(doctor_id):
    logging.debug(f"Starting show_my_patients_command for Doctor ID: {doctor_id}")
    appointments_ref = ref.child('appointments')
    appointments = appointments_ref.order_by_child('doctor_id').equal_to(doctor_id).get()
    
    if appointments:
        phrases = []
        for appointment_id, appointment_data in appointments.items():
            patient_id = appointment_data['patient_id']
            patient_ref = ref.child('users').child('patients').child(patient_id)
            patient_data = patient_ref.get()
            
            if patient_data:
                patient_name = patient_data.get('name', 'Unknown Name')
                patient_gender = patient_data.get('gender', 'Unknown Gender')
                patient_age = patient_data.get('age', 'Unknown Age')
                appointment_time = appointment_data.get('time', 'Unknown Time')
                appointment_date = appointment_data.get('date', 'Unknown Date')
                
                phrase = (f"{len(phrases) + 1}st patient {patient_name} is {patient_gender}, "
                          f"has booked an appointment at {appointment_time} on {appointment_date}, "
                          f"and their age is {patient_age}.")
                
                phrases.append(phrase)
        
        logging.debug(f"Appointments and patient details found: {phrases}")
        return " ".join(phrases)
    else:
        logging.debug(f"No appointments found for Doctor ID: {doctor_id}")
        return f"No appointments found for Doctor ID: {doctor_id}"


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
    logging.debug(f"Fetching appointments for patient ID: {patient_id}")
    appointments_ref = ref.child('appointments')
    appointments = appointments_ref.order_by_child('patient_id').equal_to(patient_id).get()
    
    if appointments:
        phrases = []
        for idx, (appointment_id, appointment_data) in enumerate(appointments.items()):
            doctor_id = appointment_data.get('doctor_id', 'Unknown Doctor')
            appointment_time = appointment_data.get('time', 'Unknown Time')
            appointment_date = appointment_data.get('date', 'Unknown Date')
            
            # Fetch doctor's name
            doctor_ref = ref.child('users').child('doctors').child(doctor_id)
            doctor_data = doctor_ref.get()
            doctor_name = doctor_data.get('name', 'Unknown Doctor')
            
            phrases.append(f"Appointment {idx + 1}: With {doctor_name} at {appointment_time} on {appointment_date}.")
        
        return "Your appointments: " + " ".join(phrases)
    else:
        return "You have no appointments scheduled."

def show_sensor_data_command():
    logging.debug("Fetching latest sensor data")
    # Assuming sensor data is stored in Firebase under 'sensor_data'
    sensor_data_ref = ref.child('sensor_data')
    latest_data = sensor_data_ref.order_by_key().limit_to_last(1).get()
    
    if latest_data:
        data = latest_data.popitem()[1]
        heart_rate = data.get('heart_rate', 'Unknown')
        blood_oxygen = data.get('blood_oxygen', 'Unknown')
        
        return f"Latest sensor data - Heart Rate: {heart_rate}, Blood Oxygen: {blood_oxygen}."
    else:
        return "No sensor data available."

def show_health_news_command():
    logging.debug("Fetching latest health news")
    # Assuming health news data is stored in Firebase under 'news'
    news_ref = ref.child('news')
    latest_news = news_ref.order_by_key().limit_to_last(5).get()
    
    if latest_news:
        news_items = [news_item.get('title', 'No Title') for news_item in latest_news.values()]
        return "Latest health news: " + ", ".join(news_items)
    else:
        return "No health news available."

def show_user_info_command():
    logging.debug(f"Fetching user info for patient ID: {global_patient_id}")
    patient_ref = ref.child('users').child('patients').child(global_patient_id)
    patient_data = patient_ref.get()
    
    if patient_data:
        patient_name = patient_data.get('name', 'Unknown Name')
        patient_gender = patient_data.get('gender', 'Unknown Gender')
        patient_age = patient_data.get('age', 'Unknown Age')
        
        return f"Patient Info - Name: {patient_name}, Gender: {patient_gender}, Age: {patient_age}."
    else:
        return f"No information found for patient ID: {global_patient_id}."

def show_disease_info_command():
    logging.debug("Fetching disease information")
    # Assuming disease data is stored in Firebase under 'diseases'
    diseases_ref = ref.child('diseases')
    diseases = diseases_ref.get()
    
    if diseases:
        disease_info = [f"{disease_data['name']}: {disease_data.get('description', 'No description')}" 
                        for disease_data in diseases.values()]
        return "Disease information: " + ", ".join(disease_info)
    else:
        return "No disease information available."

def show_hospital_info_command():
    logging.debug("Fetching hospital information")
    # Assuming hospital data is stored in Firebase under 'hospitals'
    hospitals_ref = ref.child('hospitals')
    hospitals = hospitals_ref.get()
    
    if hospitals:
        hospital_info = [f"{hospital_data['name']}: {hospital_data.get('address', 'No address provided')}" 
                         for hospital_data in hospitals.values()]
        return "Hospital information: " + ", ".join(hospital_info)
    else:
        return "No hospital information available."

@app.route("/api/bot", methods=["GET"])
def bot():
    command = request.args.get("command", "")
    response = handle_command(command)
    return jsonify({"response": response})


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(f"../client/build/{path}"):
        return send_from_directory("../client/build", path)
    else:
        return send_from_directory("../client/build", "index.html")

# Flask app startup
@app.route('/')
def home():
    return "Appointment reminder system running!"

if __name__ == "__main__":
    run_background_scheduler()  # Start the scheduler when the Flask app starts
    app.run(debug=True)