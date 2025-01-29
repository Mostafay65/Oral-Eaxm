# Oral Exam Platform

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [API Endpoints](#api-endpoints-documentation)
5. [Getting Started](#getting-started)

## Introduction

The Oral Exam Platform is a sophisticated Node.js application designed to revolutionize the way educational institutions conduct oral examinations. It provides a seamless interface for instructors to create and manage exams while enabling students to record and submit their answers digitally. The platform leverages advanced speech-to-text technology and AI-powered grading for efficient evaluation.

- Designed and developed a robust RESTful API to handle audio recordings and integrate with an AI model for speech-to-text transcription.

- Implemented an AI-powered evaluation system to analyze transcribed text and provide automated grading based on predefined criteria.

- Utilized Bull and Redis for background processing to handle time-intensive AI transcription tasks without blocking the main thread.

- Developed a feedback service to deliver detailed evaluation results and scores to students, enhancing their learning experience.

- Integrated robust error logging mechanisms to track and debug issues during background processing, ensuring system stability.

- Conducted code reviews and implemented best practices to ensure code 
quality and maintainability.

## Features

### For Instructors

-   Create and manage oral exams
-   Upload question audio files
-   Set exam schedules and durations
-   Review student submissions
-   Manual grade override capability
-   View AI-generated feedback
-   Email notifications for exam status

### For Students

-   Access scheduled exams
-   Record audio answers
-   View exam results and feedback
-   Track submission status
-   Receive email notifications

### System Features

-   Automated speech-to-text conversion
-   AI-powered answer evaluation
-   Real-time processing status
-   Secure file storage
-   Email notification system

## Technologies Used

-   Node.js & Express.js
-   MongoDB & Mongoose
-   Bull (Queue Management)
-   OpenAI Whisper Speech-to-Text Model
-   Google Gemini API
-   JWT Authentication
-   Nodemailer
-   Redis

## API Endpoints documentation

You can find the API Documentation here: [API Documentation](https://documenter.getpostman.com/view/37891716/2sAYQiAni1#3b5f3bbe-c174-4c97-9204-2f8be0ef72f8)

## Getting Started

1. **Prerequisites**

    ```bash
    - Node.js (v14+)
    - MongoDB
    - Redis
    - Google Gemini API Key
    ```

## Environment Setup

1. **Clone the repository**
    ```bash
    git clone https://github.com/Mostafay65/Oral-Eaxm.git
    ```
2. **Install dependencies**
    ```bash
    npm install
    ```
3. **Set up environment variables**
    ```bash
    cp .env.example .env
    ```
4. Update the `.env` file with your configuration.
    ```
    PORT=3000
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET_KEY=your_jwt_secret
    SMTP_HOST=your_smtp_host
    SMTP_PORT=your_smtp_port
    SMTP_USER=your_smtp_username
    SMTP_PASS=your_smtp_password
    HOST=your_project_host
    GEMINI_API_KEY=your_gemini_api_key
    SPEECH_TO_TEXT_API_HOST=your_speech_to_text_api_host
    ```
5. **Start the server**
    ```bash
    npm run dev
    ```
