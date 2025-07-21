# 🏙️ UrbanFix: An Intelligent E-Governance System for Civic Issue Management

> A full-stack web-based platform to empower citizens to report urban issues to local governments. Built using React, Node.js, MongoDB, and Flask-powered ML microservices. Developed as part of the B.Sc. CSIT Final Year Project at Tribhuvan University, CCT Dharan.

![Project Preview](preview.jpg) <!-- Replace with image path -->

[![Watch Demo](https://img.shields.io/badge/Watch%20Demo-Click%20Here-blue?logo=youtube)](https://your-cloud-video-link.mp4)  
<!-- Replace above with the actual video link. GitHub doesn't support direct video embedding, so link to Google Drive, Cloudinary, or YouTube. -->

---

## 📽️ Preview: User Dashboard

https://github.com/user-attachments/assets/3dc5d3c9-2d1b-4f31-9f31-9ac24aa41d52

---

## 📌 Features

- 🚀 Report civic issues with title, description, image, ward, category, and map location.
- 🧠 ML-based category suggestion using SpaCy + Logistic Regression.
- 🧭 Intelligent duplicate detection using OpenAI embeddings + Cosine Similarity.
- 🧑‍💼 Admin dashboard for verifying issues and updating statuses.
- 📊 Real-time statistics and issue analytics.
- 🧾 Role-based access: Guests, Users, Ward Admins.
- 🗺️ Map view for verified issues (Leaflet.js).

---

## 🧠 Algorithms & Intelligence

### 1. 🔁 Cosine Similarity + Blocking for Duplicate Detection
- Uses OpenAI’s `text-embedding-3-large` model for semantic similarity.
- Blocks comparison scope by **ward + category** for performance.
- Prompts user if similarity ≥ 70% to reduce redundancy.

### 2. 🏷️ Multi-Class Classification (Category Prediction)
- Titles vectorized using **SpaCy’s `en_core_web_lg` model**.
- Logistic Regression classifier predicts category onBlur.
- Enhances admin efficiency and user experience.

---

## 🧩 Tech Stack

| Layer       | Tools Used                                    |
|-------------|-----------------------------------------------|
| Frontend    | React.js, Tailwind CSS, Axios, Leaflet.js     |
| Backend     | Node.js, Express.js, MongoDB, JWT, Bcrypt     |
| ML Service  | Flask, Python, SpaCy, Logistic Regression     |
| Dev Tools   | Postman, GitHub, Cloudinary, OpenAI API       |

---

## 📋 System Architecture

- **Monolithic Architecture** with microservice integration for ML tasks.
- RESTful API communication between client and backend.
- ML service isolated in a Flask container, triggered asynchronously on issue creation.

---

## 🔄 Flowcharts & Diagrams

### 🧭 System Flowchart  
![System Flow](flowchart.png) <!-- Replace with actual image path -->

### 🧩 Use Case Diagram  
![Use Case](usecase.png) <!-- Replace with actual image path -->

---

## 📊 Brief Requirement Analysis

### Functional
- User Authentication & Role-based Authorization
- Civic Issue Reporting & Verification
- Real-time Status Tracking & Map Visualization

### Non-Functional
- 🔐 Secure (JWT, Bcrypt)
- ⚡ Performant (OpenAI API, Blocking Strategy)
- 🔧 Scalable, Transparent, Usable

---

## 🧪 Expected Output

- Verified civic issues mapped and visible publicly
- Interactive dashboards for both citizens and ward officials
- Prevention of duplicate complaints
- ML-powered classification for smoother administration

---

## 📁 Repository Structure

```bash
UrbanFix/
├── client/                 # React Frontend
├── server/                 # Node.js Backend
├── ml-service/            # Flask Microservice
├── public/                # Static assets (preview images, diagrams)
└── README.md

