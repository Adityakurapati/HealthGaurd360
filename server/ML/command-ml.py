import os
import firebase_admin
from firebase_admin import credentials, db
from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import dateparser
import numpy as np
import joblib
import spacy

# Set up logging for debugging
logging.basicConfig(level=logging.DEBUG)

# Initialize Firebase
cred = credentials.Certificate('credentials/firebase-credentials.json')
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://healthgaurd360-426f4-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

app = Flask(__name__)
CORS(app)

# Reference to Firebase root
ref = db.reference('/')

# Load models
command_classifier = joblib.load('models/command_classifier.pkl')
nlp = joblib.load('models/entity_extractor.pkl')

def extract_entities(command):
    doc = nlp(command)
    entities = {}
    
    for ent in doc.ents:
        if ent.label_ == "PERSON":  # Doctor/Patient names
            entities["doctor_id"] = ent.text
        elif ent.label_ == "DATE":
            entities["date"] = ent.text
        elif ent.label_ == "TIME":
            entities["time"] = ent.text
        elif ent.label_ == "AGE":
            entities["age"] = ent.text
        elif ent.label_ == "GPE":  # Geopolitical entity (location, hospital info)
            entities["location"] = ent.text
    
    return entities

def handle_command(command):
    # Step 1: Predict the intent using the command classification model
    intent = command_classifier.predict([command])[0]
    
    # Step 2: Extract entities using spaCy
    entities = extract_entities(command)
    
    # Step 3: Handle the command based on the predicted intent
    if intent == 'add_appointment':
        return add_appointment_command(entities)
    elif intent == 'show_nearby_hospitals':
        return show_nearby_hospitals_command(entities.get('count', 5))
    elif intent == 'show_disease_by_letter':
        return show_disease_by_letter_command(entities.get('letter', 'A'))
    elif intent == 'show_patients':
        return show_my_patients_command(entities.get('doctor_id', ''))
    elif intent == 'available_doctors':
        return show_available_doctors_command()
    elif intent == 'show_appointments':
        return show_my_appointments_command(entities.get('patient_id', ''))
    elif intent == 'sensor_data':
        return show_sensor_data_command()
    elif intent == 'health_news':
        return show_health_news_command()
    elif intent == 'user_info':
        return show_user_info_command()
    elif intent == 'disease_info':
        return show_disease_info_command(command)
    elif intent == 'hospital_info':
        return show_hospital_info_command()
    else:
        return "I'm sorry, I don't understand that command."

# Function for adding an appointment based on extracted entities
def add_appointment_command(entities):
    doctor_id = entities.get('doctor_id', '123')
    patient_id = entities.get('patient_id', '456')
    appointment_date = dateparser.parse(entities.get('date', "today"))
    appointment_time = entities.get('time', "10:00 AM")
    age = entities.get('age', "Unknown")
    gender = entities.get('gender', "Unknown")
    
    # Prepare appointment data
    appointment_data = {
        "doctor_id": doctor_id,
        "patient_id": patient_id,
        "date": appointment_date.strftime('%Y-%m-%d'),
        "time": appointment_time,
        "age": age,
        "gender": gender,
    }

    # Push the appointment to Firebase
    appointments_ref = ref.child('appointments')
    new_appointment_ref = appointments_ref.push(appointment_data)

    return f"Appointment added successfully for {appointment_date.strftime('%A, %Y-%m-%d')} with ID: {new_appointment_ref.key}. Age: {age}, Gender: {gender}"

# Function for showing nearby hospitals
def show_nearby_hospitals_command(count=5):
    hospitals_ref = ref.child('hospitals')
    hospitals = hospitals_ref.order_by_key().limit_to_first(count).get()
    return hospitals if hospitals else "No hospitals found."

# Function to show diseases starting with a letter
def show_disease_by_letter_command(letter):
    diseases_ref = ref.child('diseases')
    diseases = diseases_ref.order_by_child('name').start_at(letter).end_at(letter + "\uf8ff").get()
    return diseases if diseases else f"No diseases found starting with '{letter}'."

# Function to show patients of a doctor
def show_my_patients_command(doctor_id):
    patients_ref = ref.child('patients')
    patients = patients_ref.order_by_child('doctor_id').equal_to(doctor_id).get()
    return patients if patients else f"No patients found for doctor ID {doctor_id}."

# Function to show available doctors
def show_available_doctors_command():
    doctors_ref = ref.child('doctors')
    available_doctors = doctors_ref.order_by_child('availability').equal_to('available').get()
    return available_doctors if available_doctors else "No doctors available."

# Function to show appointments of a patient
def show_my_appointments_command(patient_id):
    appointments_ref = ref.child('appointments')
    appointments = appointments_ref.order_by_child('patient_id').equal_to(patient_id).get()
    return appointments if appointments else f"No appointments found for patient ID {patient_id}."

# Function to display sensor data (dummy implementation)
def show_sensor_data_command():
    sensor_data = {
        "temperature": "24°C",
        "humidity": "60%",
        "air_quality": "Good"
    }
    return sensor_data

# Function to fetch health news (dummy implementation)
def show_health_news_command():
    news = [
        {"title": "New Advances in Medical Technology", "source": "Health Journal"},
        {"title": "Tips for Maintaining a Healthy Lifestyle", "source": "Medical News Today"}
    ]
    return news

# Function to display user information (dummy implementation)
def show_user_info_command():
    user_info = {
        "name": "John Doe",
        "age": 30,
        "gender": "Male",
        "role": "Patient"
    }
    return user_info

# Function to show detailed disease information (dummy implementation)
def show_disease_info_command(command):
    return {"disease": "Influenza", "symptoms": ["Fever", "Cough", "Body Aches"], "treatment": "Rest, Hydration, Antiviral Medication"}

# Function to show hospital information (dummy implementation)
def show_hospital_info_command():
    return {"hospital_name": "City Hospital", "address": "123 Main St.", "contact": "555-1234"}

# Flask route for bot API
@app.route("/api/bot", methods=["GET"])
def bot_api():
    command = request.args.get('command')
    
    if not command:
        return jsonify({"message": "Command not provided"}), 400
    
    response = handle_command(command)
    
    if isinstance(response, dict) or isinstance(response, list):
        return jsonify(response)
    return jsonify({"message": response})

# Main function to run the Flask app
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)