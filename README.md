# 🧠 Sales Agent Setup Guide
Follow these steps to run the Sales Agent locally.

---

## 🔑 1. Environment Setup

Copy the example environment file and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env` and replace the OpenAI key with your own.

---

## 🐍 2. Python Setup (via `pyenv`)

> Make sure you have [pyenv](https://github.com/pyenv/pyenv) and [pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv) installed.

```bash
pyenv install 3.10
pyenv virtualenv 3.10 sales-agent
pyenv local sales-agent
pyenv activate sales-agent
```

---

## 📦 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
pip install flask-cors email-validator
make setup
```

---

## 🚀 4. Start Backend Services

### Start Sentiment Analysis Service

In the root project folder:

```bash
python start_sentiment_service.py
```

This will start the sentiment analysis service on port 5001.

### Start Backend API

From the root project folder (in a separate terminal):

```bash
# Option 1: Full API (if you have all dependencies configured)
uvicorn run_api:app --port 8000

# Option 2: Debug API (simplified for testing)
uvicorn debug_api:app --port 8002
```

For Option 1, open your browser:
👉 [http://localhost:8000/docs](http://localhost:8000/docs)

For Option 2, update your frontend .env file with:
```
NEXT_PUBLIC_API_URL=http://localhost:8002
```

---

## 🌐 5. Start Frontend App

In a **separate terminal**:

> Make sure [Node.js &amp; npm](https://nodejs.org/) are installed.

```bash
cd frontend
npm install
npm run dev
```

Then open:
👉 [http://localhost:3000](http://localhost:3000/)
👉 [http://localhost:3000/chat](http://localhost:3000/chat) (for chat interface with sentiment analysis)

---

## 🧪 Tools

Launching the frontend will give access to the built-in tools UI.

---

## 🔍 Troubleshooting

### CORS Issues
- If you encounter CORS errors in the console, ensure both backend services have CORS properly enabled.
- The sentiment analysis service requires flask-cors to be installed.

### Connection Issues
- If you see "Failed to connect to server" errors, confirm all services are running.
- Check that the required ports (3000, 5001, 8000/8002) are available.

### API Response Errors
- The debug API provides simple responses for testing the chat interface.
- For full functionality, use the main API (run_api.py) with all dependencies configured.
