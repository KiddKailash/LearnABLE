# LearnAble – Inclusive Learning Support Platform

**A web system that tailors educational content for students and supports teachers in NCCD reporting requirements.**

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [License](#license)

---

## Overview

**LearnAble** is an inclusive learning platform built to:

- Tailor educational content for students with varied learning needs, in alignment with [UDL Guidelines](https://udlguidelines.cast.org/).
- Reduce overhead for teachers by automating documentation and reporting required by the [NCCD](https://www.nccd.edu.au/resources-and-tools/tools/roles/teachers-13).
- Adhere to Version 9 of the [Australian Curriculum](https://v9.australiancurriculum.edu.au/) 
- Adhere to [Australian Privacy Principles](https://www.oaic.gov.au/privacy/australian-privacy-principles)

### The Core Challenge

Classrooms are filled with students who have diverse litiracy, preferred learning styles (e.g., VARK: Visual, Auditory, Reading/Writing, Kinesthetic), and disability considerations (physical, cognitive, sensory, social/emotional). Teachers must adapt lesson content for each learner while maintaining clear, evidence-based records for NCCD. **LearnAble** leverages AI-driven personalization to streamline these tasks, delivering:

1. **Differentiated Learning Materials** to match individual student needs.
2. **Perforemance Tracking & Automated Reporting** for teachers, simplifying NCCD compliance.

---

## Key Features

1. **Personalized Content Generation**  
   Dynamically adjusts text, multimedia, or assessments based on individual learning needs.

2. **Teacher Dashboard & Reporting Tools**  
   Allows educators to document and track adjustments for compliance with NCCD reporting and the Australian Curriculum v9.

3. **Ethical & Privacy Considerations**  
   Uses secure data handling in line with privacy compliance (e.g., de-identification of student data), and role-based access control.

4. **AI-Driven Recommendations (Planned/Optional)**  
   Suggests tailored interventions based on previous student performance or teacher inputs.

5. **Natural Language Processing (Future Scope)**  
   Converts teacher notes into structured, NCCD-compliant reports.

---

## Tech Stack

| Component                 | Technology                                               |
| ------------------------- | -------------------------------------------------------- |
| **Front-end Development** | React                                                    |
| **Back-end Development**  | Django + LangChain (LLM)                                 |
| **Database**              | PostgreSQL                                               |
| **Security & Compliance** | Encryption, RBAC                                         |
| **Deployment**            | TBD (Front(Netlify, Vercel), Back(DigitalOcean, Render)) |

> **Note**: The AI integration uses LangChain and LLMs to tailor content based on student reading levels, disabilities, and learning preferences.

---

## Project Structure
```bash
.
├── README.md # You are here !
├── frontend/
└── backend/
```

### Frontend

- **Folder:** `frontend/`
- **Core Tech:** React, MUI
- **Key Responsibilities:**
  - Rendering the UI for students and teachers
  - Handling user interactions (e.g., selecting preferred content format)
  - Communicating with the backend via RESTful APIs

### Backend

- **Folder:** `backend/`
- **Core Tech:** Django, Python, PostgreSQL
- **Key Responsibilities:**
  - Authentication (role-based: teacher vs. student)
  - Securely storing and retrieving student data
  - Providing AI-driven recommendations (via [LangChain](https://github.com/hwchase17/langchain) or integrated LLMs)
  - Generating and tracking data for NCCD reporting

## Getting Started

To run the project locally, ensure you have the following installed:

- **Node.js (14+ recommended)**
- **Python 3.8+**
- **PostgreSQL (or an equivalent database)**

### 1. Clone the Repository

```bash
git clone https://github.com/<your-team>/LearnAble.git
cd LearnAble
```

### 2. Install Frontend Dependencies and Run Server
Run the following commands in your terminal:

```bash
cd frontend

# Install NPM (if necessary)
brew install npm

# Install dependencies using NPM
npm install

# Run the development server
npm run dev
```

### 3. Install Backend Dependencies
```bash
cd ../backend

# Install poetry (if necessary)
pip install poetry

# Install dependencies using Poetry
poetry install

# Activate the virtual environment
source $(poetry env info --path)/bin/activate

# Run the development server
python manage.py runserver
```

The frontend will be at [http://localhost:5173](http://localhost:5173) by default. 
The backend will be at [http://localhost:8000](http://localhost:8000) by default.

## License
This project is in active development. License terms may be provided later.
