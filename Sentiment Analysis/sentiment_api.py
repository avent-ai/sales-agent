from flask import Flask, request, jsonify
from sentiment_analyzer import SentimentAnalyzer

app = Flask(__name__)
analyzer = SentimentAnalyzer()

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data['text']
    result = analyzer.analyze(text)
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)