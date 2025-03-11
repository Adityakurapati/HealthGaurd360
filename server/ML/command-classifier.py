import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

print("Starting command classifier training...")

data = {
    'text': [
        'Add an appointment with Dr. Smith',
        'List nearby hospitals',
        'Show me diseases starting with a',
        'Who are my patients?',
        'Available doctors for heart issues',
        'Show appointment for patient 123',
        'What is the latest health news?',
        'Patient information',
        'Details about diabetes',
        'Hospital information'
    ],
    'intent': [
        'add_appointment',
        'show_nearby_hospitals',
        'show_disease_by_letter',
        'show_my_patients',
        'show_available_doctors',
        'show_my_appointments',
        'show_health_news',
        'show_user_info',
        'show_disease_info',
        'show_hospital_info'
    ]
}

df = pd.DataFrame(data)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(df['text'], df['intent'], test_size=0.3, random_state=42)

# Pipeline with TfidfVectorizer and MultinomialNB
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=500)),
    ('clf', MultinomialNB())
])

# Train the model
print("Training the model...")
pipeline.fit(X_train, y_train)

# Predict and evaluate
y_pred = pipeline.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Command Classifier Accuracy: {accuracy * 100:.2f}%")
print(classification_report(y_test, y_pred))

# Save the model
print("Saving the model...")
models_dir = 'models'
if not os.path.exists(models_dir):
    os.makedirs(models_dir)
model_path = os.path.join(models_dir, 'command_classifier.pkl')
joblib.dump(pipeline, model_path)
print(f"Model saved to {model_path}")

print("Command classifier training and saving completed.")