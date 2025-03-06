import os
import firebase_admin
from firebase_admin import credentials, db
from flask import Flask, request, jsonify, session, make_response, send_from_directory
from flask_cors import CORS
import bcrypt
import logging
import json
import time  # Ensure this import is present

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

# Helper function to add no-cache headers
def add_no_cache_headers(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# Route to serve React app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

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
@app.route('/appointment', methods=['GET'])
def get_next_appointment():
    try:
        # Sample response with formattedTime and buzzerFlag
        return jsonify({"formattedTime": "1 hr 3 min", "buzzerFlag": "off"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0",debug=True)
