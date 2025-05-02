
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
```

---

## 📦 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
make setup
```

---

## 🚀 4. Start Backend API

From the root project folder:

```bash
uvicorn run_api:app --port 8000
```

Then open your browser:

👉 [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🌐 5. Start Frontend App

In a  **separate terminal** :

> Make sure [Node.js &amp; npm](https://nodejs.org/) are installed.

```bash
npm install
npm run dev
```

Then open:

👉 [http://localhost:3000](http://localhost:3000/)

---

## 🧪 Tools

Launching the frontend will give access to the built-in tools UI.
