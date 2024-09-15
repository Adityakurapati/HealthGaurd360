import spacy
import joblib

# Load a pre-trained spaCy model for NER
nlp = spacy.load("en_core_web_sm")

# Sample function to extract entities from a command
def extract_entities(command):
    doc = nlp(command)
    entities = {}
    
    # Extract relevant entities
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

# Test entity extraction
command = "Book an appointment with Dr. Smith on Monday at 10 AM"
entities = extract_entities(command)
print(f"Extracted Entities: {entities}")

# Save the entity extraction function for later use (optional)
joblib.dump(nlp, 'entity_extractor.pkl')
