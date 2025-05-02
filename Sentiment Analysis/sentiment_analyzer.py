import pandas as pd
import numpy as np
import re
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import pickle
import os

class SentimentAnalyzer:
    def __init__(self, model_path='sentiment_model.pkl', vectorizer_path='vectorizer.pkl', dataset_path='chat_dataset.csv'):
        self.model = None
        self.vectorizer = None
        
        # Try to load pre-trained model and vectorizer if paths provided
        if model_path and os.path.exists(model_path) and vectorizer_path and os.path.exists(vectorizer_path):
            try:
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                with open(vectorizer_path, 'rb') as f:
                    self.vectorizer = pickle.load(f)
                print("Loaded sentiment model and vectorizer from files")
            except Exception as e:
                print(f"Error loading model: {e}")
                self._train_model_from_dataset(dataset_path)
        else:
            print(f"Training sentiment model from dataset {dataset_path}")
            self._train_model_from_dataset(dataset_path)
    
    def _train_model_from_dataset(self, dataset_path):
        """Train the sentiment model using the chat_dataset.csv file"""
        try:
            # Load dataset
            df = pd.read_csv(dataset_path)
            
            # Clean the text
            df['clean_text'] = df['message'].str.lower()
            # Remove special characters
            df['clean_text'] = df['clean_text'].apply(lambda x: re.sub(r'[^a-z\s]', '', x))
            # Remove words with less than 3 characters
            df['clean_text'] = df['clean_text'].apply(lambda x: ' '.join([w for w in x.split() if len(w) > 2]))
            
            # Vectorize the text
            self.vectorizer = CountVectorizer()
            X = self.vectorizer.fit_transform(df['clean_text'])
            
            # Map sentiment labels to numbers
            sentiment_map = {'neutral': 0, 'positive': 1, 'negative': 2}
            df['sentiment_num'] = df['sentiment'].map(sentiment_map)
            y = df['sentiment_num'].values
            
            # Train test split
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
            
            # Train model
            self.model = MultinomialNB()
            self.model.fit(X_train, y_train)
            
            # Save model and vectorizer
            with open('sentiment_model.pkl', 'wb') as f:
                pickle.dump(self.model, f)
            with open('vectorizer.pkl', 'wb') as f:
                pickle.dump(self.vectorizer, f)
                
            # Print accuracy
            from sklearn.metrics import accuracy_score
            y_pred = self.model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            print(f"Model trained with accuracy: {accuracy:.2f}")
            
        except Exception as e:
            print(f"Error training model from dataset: {e}")
            raise ValueError(f"Failed to train model: {e}")
    
    def _clean_text(self, text):
        """Basic text cleaning function"""
        text = text.lower()
        # Remove special chars
        text = re.sub(r'[^a-z\s]', '', text)
        return text
    
    def analyze(self, text):
        """Analyze the sentiment of a text"""
        if not self.model or not self.vectorizer:
            raise ValueError("Model or vectorizer not initialized")
        
        cleaned_text = self._clean_text(text)
        features = self.vectorizer.transform([cleaned_text])
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        
        # Map prediction back to label
        sentiment_labels = {0: "neutral", 1: "positive", 2: "negative"}
        label = sentiment_labels[prediction]
        
        return {
            "label": label,
            "score": float(max(probabilities)),
            "positive_prob": float(probabilities[1] if 1 < len(probabilities) else 0),
            "neutral_prob": float(probabilities[0] if 0 < len(probabilities) else 0), 
            "negative_prob": float(probabilities[2] if 2 < len(probabilities) else 0)
        }