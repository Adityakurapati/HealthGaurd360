import os
import firebase_admin
from firebase_admin import credentials, db
from flask import Flask, request, jsonify, session, make_response, send_from_directory
from flask_cors import CORS
import bcrypt
import logging
import json
import time
import numpy as np
import pandas as pd
import pickle
from datetime import datetime

# Set up logging for debugging
logging.basicConfig(level=logging.DEBUG)

# Initialize Firebase
cred = credentials.Certificate('credentials/firebase-credentials.json')
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://healthgaurd360-426f4-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

app = Flask(__name__, static_folder="../client/build")
app.secret_key = 'hhdg88sdb9q30eh3bdb38g'  # Secret key for session signing
app.config['SESSION_COOKIE_SECURE'] = True  # Set to True in production (for HTTPS)
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Make cookie inaccessible to JavaScript
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Protection against CSRF attacks

CORS(app)  # This enables CORS for all routes

# Reference the root of the database
ref = db.reference('/')

# Load datasets for disease prediction
sym_des = pd.read_csv("Datasets/symtoms_df.csv")
precautions = pd.read_csv("Datasets/precautions_df.csv")
workout = pd.read_csv("Datasets/workout_df.csv")
description = pd.read_csv("Datasets/description.csv")
medications = pd.read_csv("Datasets/medications.csv")
diets = pd.read_csv("Datasets/diets.csv")

# Load model for disease prediction
svc = pickle.load(open("Files/svc.pkl", "rb"))

# Symptoms dictionary and diseases list for the prediction model
symptoms_dict = {'itching': 0, 'skin_rash': 1, 'nodal_skin_eruptions': 2, 'continuous_sneezing': 3, 'shivering': 4, 'chills': 5, 'joint_pain': 6, 'stomach_pain': 7, 'acidity': 8, 'ulcers_on_tongue': 9, 'muscle_wasting': 10, 'vomiting': 11, 'burning_micturition': 12, 'spotting_ urination': 13, 'fatigue': 14, 'weight_gain': 15, 'anxiety': 16, 'cold_hands_and_feets': 17, 'mood_swings': 18, 'weight_loss': 19, 'restlessness': 20, 'lethargy': 21, 'patches_in_throat': 22, 'irregular_sugar_level': 23, 'cough': 24, 'high_fever': 25, 'sunken_eyes': 26, 'breathlessness': 27, 'sweating': 28, 'dehydration': 29, 'indigestion': 30, 'headache': 31, 'yellowish_skin': 32, 'dark_urine': 33, 'nausea': 34, 'loss_of_appetite': 35, 'pain_behind_the_eyes': 36, 'back_pain': 37, 'constipation': 38, 'abdominal_pain': 39, 'diarrhoea': 40, 'mild_fever': 41, 'yellow_urine': 42, 'yellowing_of_eyes': 43, 'acute_liver_failure': 44, 'fluid_overload': 45, 'swelling_of_stomach': 46, 'swelled_lymph_nodes': 47, 'malaise': 48, 'blurred_and_distorted_vision': 49, 'phlegm': 50, 'throat_irritation': 51, 'redness_of_eyes': 52, 'sinus_pressure': 53, 'runny_nose': 54, 'congestion': 55, 'chest_pain': 56, 'weakness_in_limbs': 57, 'fast_heart_rate': 58, 'pain_during_bowel_movements': 59, 'pain_in_anal_region': 60, 'bloody_stool': 61, 'irritation_in_anus': 62, 'neck_pain': 63, 'dizziness': 64, 'cramps': 65, 'bruising': 66, 'obesity': 67, 'swollen_legs': 68, 'swollen_blood_vessels': 69, 'puffy_face_and_eyes': 70, 'enlarged_thyroid': 71, 'brittle_nails': 72, 'swollen_extremeties': 73, 'excessive_hunger': 74, 'extra_marital_contacts': 75, 'drying_and_tingling_lips': 76, 'slurred_speech': 77, 'knee_pain': 78, 'hip_joint_pain': 79, 'muscle_weakness': 80, 'stiff_neck': 81, 'swelling_joints': 82, 'movement_stiffness': 83, 'spinning_movements': 84, 'loss_of_balance': 85, 'unsteadiness': 86, 'weakness_of_one_body_side': 87, 'loss_of_smell': 88, 'bladder_discomfort': 89, 'foul_smell_of urine': 90, 'continuous_feel_of_urine': 91, 'passage_of_gases': 92, 'internal_itching': 93, 'toxic_look_(typhos)': 94, 'depression': 95, 'irritability': 96, 'muscle_pain': 97, 'altered_sensorium': 98, 'red_spots_over_body': 99, 'belly_pain': 100, 'abnormal_menstruation': 101, 'dischromic _patches': 102, 'watering_from_eyes': 103, 'increased_appetite': 104, 'polyuria': 105, 'family_history': 106, 'mucoid_sputum': 107, 'rusty_sputum': 108, 'lack_of_concentration': 109, 'visual_disturbances': 110, 'receiving_blood_transfusion': 111, 'receiving_unsterile_injections': 112, 'coma': 113, 'stomach_bleeding': 114, 'distention_of_abdomen': 115, 'history_of_alcohol_consumption': 116, 'fluid_overload.1': 117, 'blood_in_sputum': 118, 'prominent_veins_on_calf': 119, 'palpitations': 120, 'painful_walking': 121, 'pus_filled_pimples': 122, 'blackheads': 123, 'scurring': 124, 'skin_peeling': 125, 'silver_like_dusting': 126, 'small_dents_in_nails': 127, 'inflammatory_nails': 128, 'blister': 129, 'red_sore_around_nose': 130, 'yellow_crust_ooze': 131}

diseases_list = {15: 'Fungal infection', 4: 'Allergy', 16: 'GERD', 9: 'Chronic cholestasis', 14: 'Drug Reaction', 33: 'Peptic ulcer disease', 1: 'AIDS', 12: 'Diabetes', 17: 'Gastroenteritis', 6: 'Bronchial Asthma', 23: 'Hypertension', 30: 'Migraine', 7: 'Cervical spondylosis', 32: 'Paralysis (brain hemorrhage)', 28: 'Jaundice', 29: 'Malaria', 8: 'Chicken pox', 11: 'Dengue', 37: 'Typhoid', 40: 'Hepatitis A', 19: 'Hepatitis B', 20: 'Hepatitis C', 21: 'Hepatitis D', 22: 'Hepatitis E', 3: 'Alcoholic hepatitis', 36: 'Tuberculosis', 10: 'Common Cold', 34: 'Pneumonia', 13: 'Dimorphic hemorrhoids (piles)', 18: 'Heart attack', 39: 'Varicose veins', 26: 'Hypothyroidism', 24: 'Hyperthyroidism', 25: 'Hypoglycemia', 31: 'Osteoarthritis', 5: 'Arthritis', 0: '(vertigo) Paroxysmal Positional Vertigo', 2: 'Acne', 38: 'Urinary tract infection', 35: 'Psoriasis', 27: 'Impetigo'}

# Helper function to add no-cache headers
def add_no_cache_headers(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# Helper function to get disease details
def get_disease_details(disease):
    desc = description[description["Disease"] == disease]["Description"].values
    desc = " ".join(desc) if len(desc) > 0 else "No description available."

    pre = precautions[precautions["Disease"] == disease][
        ["Precaution_1", "Precaution_2", "Precaution_3", "Precaution_4"]
    ].values.flatten().tolist()

    med = medications[medications["Disease"] == disease]["Medication"].values.tolist()

    die = diets[diets["Disease"] == disease]["Diet"].values.tolist()

    wrkout = workout[workout["disease"] == disease]["workout"].values.tolist()

    return {
        "description": desc,
        "precautions": pre,
        "medications": med,
        "diets": die,
        "workouts": wrkout,
    }

# Prediction function
def get_predicted_disease(symptoms):
    input_vector = np.zeros(len(symptoms_dict))
    for symptom in symptoms:
        if symptom in symptoms_dict:
            input_vector[symptoms_dict[symptom]] = 1
    prediction_index = svc.predict([input_vector])[0]
    disease = diseases_list.get(prediction_index, "Unknown Disease")
    return disease

# Route to serve React app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Flask route for disease prediction
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        symptoms = data.get("symptoms", [])
        
        if not symptoms:
            return jsonify({"error": "No symptoms provided"}), 400
        
        # Get the predicted disease
        disease = get_predicted_disease(symptoms)

        # Get detailed information about the disease
        details = get_disease_details(disease)

        response = {
            "predicted_disease": disease,
            "details": details
        }
        print("Response")
        print(disease)
        print(details)
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route for nearby hospitals
@app.route('/api/nearby_hospitals', methods=['GET'])
def get_nearby_hospitals():
    try:
        # Parse latitude and longitude from request
        lat = float(request.args.get('lat'))
        lng = float(request.args.get('lng'))
        
        # Reference to the 'hospitals' node in Firebase
        hospitals_ref = ref.child('hospitals')

        # Query hospitals based on latitude
        hospitals = hospitals_ref.order_by_child('lat').start_at(lat - 0.05).end_at(lat + 0.05).get()

        # If hospitals are found, return them as a list of objects
        if hospitals:
            hospital_list = []
            for hospital_id, hospital_data in hospitals.items():
                hospital_data['id'] = hospital_id  # Add ID to the data
                hospital_list.append(hospital_data)
            return add_no_cache_headers(jsonify(hospital_list))
        else:
            return add_no_cache_headers(jsonify([]))  # Return empty if no hospitals found

    except Exception as e:
        logging.error(f"Error fetching hospitals: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Route to add hospitals data
@app.route('/api/add-hospitals', methods=['POST'])
def add_hospitals():
    try:
        hospitals_data = request.json.get('hospitals')
        hospitals_ref = ref.child('hospitals')
        for hospital in hospitals_data:
            hospitals_ref.push(hospital)
        return jsonify({"success": True}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/diseases/<letter>', methods=['GET'])
def get_diseases_by_letter(letter):
    try:
        diseases_ref = ref.child('diseases')
        diseases = diseases_ref.order_by_child('name').start_at(letter).end_at(letter + "\uf8ff").get()
        diseases_list = [disease for disease in diseases.values()] if diseases else []
        return add_no_cache_headers(jsonify(diseases_list))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route for doctors (includes doctor IDs)
@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    try:
        doctors_ref = ref.child('users').child('doctors')
        doctors = doctors_ref.get()
        doctors_list = []
        if doctors:
            for doc_id, doc_data in doctors.items():
                doc_data['id'] = doc_id
                doctors_list.append(doc_data)
        print("********************** List **************")
        print(doctors_list)
        return jsonify(doctors_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route for news
@app.route('/api/news', methods=['GET'])
def get_news():
    try:
        news_ref = ref.child('news')
        news = news_ref.get()
        return add_no_cache_headers(jsonify(list(news.values()) if news else []))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to add doctor data
@app.route('/api/add-doctor', methods=['POST'])
def add_doctor():
    try:
        doctor_data = request.json
        doctors_ref = ref.child('users').child('doctors')
        new_doctor_ref = doctors_ref.push(doctor_data)
        return jsonify({"success": True, "id": new_doctor_ref.key}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/add-patient', methods=['POST'])
def add_patient():
    try:
        patient_data = request.json
        patients_ref = ref.child('users').child('patients')
        new_patient_ref = patients_ref.push(patient_data)
        return jsonify({"success": True, "id": new_patient_ref.key}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/patients', methods=['GET'])
def get_patients():
    try:
        # Reference the 'patients' node in the Firebase Realtime Database
        patients_ref = ref.child('users').child('patients')
        patients = patients_ref.get()  # Fetch all patients

        patients_list = []
        if patients:
            for patient_id, patient_data in patients.items():
                patient_data['id'] = patient_id  # Add node key as 'id'
                patients_list.append(patient_data)

        return jsonify(patients_list)  # Return the list of patients with IDs
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to add appointment data
@app.route('/api/add-appointment', methods=['POST'])
def add_appointment():
    try:
        appointment_data = request.json
        appointments_ref = ref.child('appointments')
        
        # Validate that the doctor exists
        doctors_ref = ref.child('users').child('doctors')
        if not doctors_ref.child(appointment_data['doctor_id']).get():
            return jsonify({"error": "Doctor not found"}), 400
        
        new_appointment_ref = appointments_ref.push(appointment_data)
        return jsonify({"success": True, "id": new_appointment_ref.key}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Route to get all appointments
@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    try:
        appointments_ref = ref.child('appointments')
        appointments = appointments_ref.get()
        appointments_list = []
        if appointments:
            for appointment_id, appointment_data in appointments.items():
                appointment_data['id'] = appointment_id  # Adding id for the React component key
                appointments_list.append(appointment_data)
        return jsonify(appointments_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to get appointments by doctor ID
@app.route('/api/appointments/<doctor_id>', methods=['GET'])
def get_appointments_by_doctor(doctor_id):
    try:
        appointments_ref = ref.child('appointments')
        appointments = appointments_ref.order_by_child('doctor_id').equal_to(doctor_id).get()
        
        appointments_list = []
        if appointments:
            for appointment_id, appointment_data in appointments.items():
                appointment_data['id'] = appointment_id  # Adding id for the React component key
                appointments_list.append(appointment_data)
                
        return jsonify(appointments_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to toggle appointment completion status
@app.route('/api/appointments/toggle-complete/<appointment_id>', methods=['PATCH'])
def toggle_appointment_completion(appointment_id):
    try:
        appointments_ref = ref.child('appointments').child(appointment_id)
        appointment = appointments_ref.get()
        
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404
        
        # Toggle the 'completed' flag
        completed = appointment.get('completed', False)
        appointments_ref.update({'completed': not completed})
        
        return jsonify({"success": True, "completed": not completed}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to store sensor data
@app.route('/api/sensor_data', methods=['GET'])
def store_sensor_data():
    try:
        heartrate = request.args.get('heartrate')
        blood_oxygen = request.args.get('blood_oxygen')

        sensor_data = {
            'heartrate': heartrate,
            'blood_oxygen': blood_oxygen
        }

        ref.child('sensor_data').set(sensor_data)

        return jsonify({"success": True, "sensor_data": sensor_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to register a new user (doctor or patient)
@app.route('/api/register', methods=['POST'])
def register_user():
    try:
        user_data = request.json
        role = user_data.get('role')  # Doctor or Patient

        # Hash the password before storing
        password = user_data['password']
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_data['password'] = hashed_password

        users_ref = ref.child('users')
        
        # Validate role and store based on it
        if role == 'doctor':
            # Check required fields for doctor
            required_keys = ['name', 'password', 'hospital_id', 'specialty', 'contact_number', 'email', 'gender']
            for key in required_keys:
                if key not in user_data:
                    return jsonify({"error": f"{key} is required for doctors"}), 400

            # Check if hospital_id exists
            hospitals_ref = ref.child('hospitals')
            if not hospitals_ref.child(user_data['hospital_id']).get():
                return jsonify({"error": "Hospital not found"}), 400

            doctors_ref = users_ref.child('doctors')
            new_user_ref = doctors_ref.push(user_data)
        
        elif role == 'patient':
            # Check required fields for patient
            required_keys = ['name', 'password', 'contact_number', 'email', 'gender']
            for key in required_keys:
                if key not in user_data:
                    return jsonify({"error": f"{key} is required for patients"}), 400

            patients_ref = users_ref.child('patients')
            new_user_ref = patients_ref.push(user_data)
        
        else:
            return jsonify({"error": "Invalid role specified"}), 400

        return jsonify({"success": True, "id": new_user_ref.key}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Route to login users (both doctors and patients)
@app.route('/api/login', methods=['POST'])
def login():
    try:
        email = request.json.get('email')
        password = request.json.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        users_ref = ref.child('users')

        # Check in both doctors and patients
        for role in ['doctors', 'patients']:
            user_ref = users_ref.child(role)
            users = user_ref.order_by_child('email').equal_to(email).get()

            if users:
                for user_id, user_data in users.items():
                    if bcrypt.checkpw(password.encode('utf-8'), user_data['password'].encode('utf-8')):
                        # Set session for the logged-in user
                        session['user_id'] = user_id
                        session['role'] = role

                        user_data['id'] = user_id
                        user_data['role'] = role
                        return jsonify(user_data), 200
                return jsonify({"error": "Invalid password"}), 401

        return jsonify({"error": "User not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/current_user', methods=['GET'])
def get_current_user():
    try:
        # Check if the user is logged in by looking at the session
        user_id = session.get('user_id')
        role = session.get('role')

        # Debug session details
        print(f"Session user_id: {user_id}, role: {role}")

        if not user_id or not role:
            return jsonify({"error": "User not logged in"}), 401

        # Fetch user details from the appropriate Firebase path based on the role
        if role == 'doctors':
            user_ref = ref.child('users').child('doctors').child(user_id)
        elif role == 'patients':
            user_ref = ref.child('users').child('patients').child(user_id)
        else:
            return jsonify({"error": "Invalid role"}), 400

        # Get the user data
        user_data = user_ref.get()

        # Debug fetched user data
        if user_data:
            user_data['id'] = user_id  # Include the user ID in the response
            user_data['role'] = role
            print(f"======== Fetched user data: =============s{user_data}")
            
            return jsonify(user_data), 200
        else:
            return jsonify({"error": "User not found"}), 404

    except Exception as e:
        print(f"Error in get_current_user: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    try:
        session.clear()  # Clear the session
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({"message": "An error occurred during logout."}), 500

@app.route('/api/messages', methods=['GET'])
def get_messages():
    try:
        doctor_id = request.args.get('doctor_id')
        patient_id = request.args.get('patient_id')

        # Create the conversation_id using sorted doctor_id and patient_id
        conversation_id = f"{min(doctor_id, patient_id)}_{max(doctor_id, patient_id)}"
        conversation_path = f'messages/{conversation_id}'

        # Fetch the conversation
        conversation_ref = db.reference(conversation_path)
        conversation = conversation_ref.get()

        if conversation and 'messages' in conversation:
            # Convert messages dict to a list and sort by timestamp
            messages_list = [
                {**msg, 'id': msg_id}
                for msg_id, msg in conversation['messages'].items()
            ]
            sorted_messages = sorted(messages_list, key=lambda x: x['timestamp'])
            return jsonify(sorted_messages), 200
        else:
            return jsonify([]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/messages/send', methods=['POST'])
def send_message():
    try:
        data = request.json
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        message_text = data.get('message_text')
        sender_role = data.get('sender_role')

        if not all([sender_id, receiver_id, message_text, sender_role]):
            return jsonify({"error": "Missing required fields"}), 400

        # Create the conversation_id using sorted sender_id and receiver_id
        conversation_id = f"{min(sender_id, receiver_id)}_{max(sender_id, receiver_id)}"
        conversation_path = f'messages/{conversation_id}'

        # Reference to the conversation node
        conversation_ref = db.reference(conversation_path)

        # Create a new message
        new_message = {
            'timestamp': int(time.time() * 1000),  # Current time in milliseconds
            'sender_id': sender_id,
            'message_text': message_text,
            'sender_role': sender_role
        }

        # Add the new message to the 'messages' subcollection
        new_message_ref = conversation_ref.child('messages').push(new_message)

        # Update the doctor_id and patient_id fields if they don't exist
        conversation_ref.update({
            'doctor_id': sender_id if sender_role == 'doctor' else receiver_id,
            'patient_id': sender_id if sender_role == 'patient' else receiver_id
        })

        return jsonify({"message": "Message sent successfully", "message_id": new_message_ref.key}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to get the next appointment with formatted time and buzzer flag
@app.route('/api/appointment', methods=['GET'])
def get_next_appointment():
    try:
        # Sample response with formattedTime and buzzerFlag
        return jsonify({"formattedTime": "1 hr 3 min", "buzzerFlag": "off"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)