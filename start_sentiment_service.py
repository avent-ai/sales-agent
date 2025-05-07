from sentiment_api import app

if __name__ == '__main__':
    print("Starting sentiment analysis service on port 5001...")
    app.run(host='0.0.0.0', port=5001)