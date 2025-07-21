from flask import Flask, request, jsonify
import spacy
import joblib
import numpy as np
from flask_cors import CORS
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# Load SpaCy model (medium-sized)
nlp = spacy.load("en_core_web_lg")

# Load trained classifier
clf = joblib.load('spacy_model.pkl')

def get_vector(text):
    doc = nlp(text)
    vectors = [token.vector for token in doc if not token.is_stop and not token.is_punct and token.has_vector]
    if vectors:
        return np.mean(vectors, axis=0)
    else:
        return np.zeros(nlp.vocab.vectors_length)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    title = data.get("title")
    if not title:
        return jsonify({'error': 'No title provided'}), 400

    # Get average vector for input title
    vec = get_vector(title).reshape(1, -1)

    # Predict category
    pred = clf.predict(vec)[0]

    return jsonify({'prediction': pred}), 200

if __name__ == '__main__':
    app.run(debug=True)
