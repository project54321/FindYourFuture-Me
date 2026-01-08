# FindYourFuture - Me

A full-stack web application that helps users identify college majors and career paths that best suit them through a short, interactive quiz.

---

## Features

* Short, intuitive quiz experience
* Personalized major and career recommendations
* Modern frontend built with Vite, React, and TypeScript
* FastAPI backend with modular structure
* Clean separation between frontend and backend
* Designed to be extensible for AI-driven analysis

---

## Tech Stack

### Frontend

* Vite
* React
* TypeScript
* HTML5 / CSS3

### Backend

* FastAPI
* Python
* Uvicorn
* OpenAI

---

## Project Structure

```
FindYourFuture-Me/
├── backend/
│   ├── api/
│   │   └── index.py
│   ├── app/
│   │   ├── __init__.py
│   │   ├── gpt.py
│   │   └── main.py
│   ├── .env
│   ├── .gitignore
│   ├── requirements.txt
│   ├── run.sh
│   └── vercel.json
│
└── frontend/
    ├── public/
    │   ├── favicon.png
    │   └── vite.svg
    │
    ├── src/
    │   ├── assets/
    │   │   └── react.svg
    │   │
    │   ├── App.css
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    │
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    └── vite.config.ts
README.md
```

---

## Setup & Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Project54321/FindYourFuture-Me.git
cd FindYourFuture-Me
```

---

### 2️⃣ Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\\Scripts\\activate  # Windows

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory and add required environment variables:

```
GITHUB_TOKEN=your_api_key_here
```

Run the backend server:

```bash
cd FindYourFuture-Me/backend
./run.sh
```

The API will be available at:

```
http://localhost:8000
```

---

### 3️⃣ Frontend Setup (Vite + React + TypeScript)

```bash
cd FintYourFuture-Me/frontend
npm install
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```

---

## 🔌 API Overview

Example endpoints (may vary based on implementation):

* `POST /api/gpt/` – Submit Prompt as a JSON
* Returns a JSON File as shown below
  ```
  {
  "response": "Hello! 😊 How can I assist you today?"
  }
  ```

FastAPI interactive docs:

```
http://localhost:8000/docs
```

---

## How It Works

1. The user completes a short quiz on the frontend
2. Quiz responses are sent to the FastAPI backend
3. The backend analyzes responses using predefined logic or AI models
4. Recommended majors and career paths are returned
5. Results are displayed clearly to the user

---

## Future Improvements

* User accounts and saved results
* Improved recommendation accuracy with ML
* Expanded career and major database
* Enhanced UI/UX and accessibility
* Production deployment with CI/CD

---

## License

This project is open-source and available under the MIT License.

---

## Acknowledgments

* Built with FastAPI and Vite
* Inspired by students who had difficulties making academic and career decisions
