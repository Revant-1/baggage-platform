# Baggage Platform

This project is a comprehensive baggage tracking and analytics platform consisting of a Node.js backend, a React frontend, and a Python-based YOLO object detection engine.

## Project Structure

- **backend/**: Node.js Express server with Prisma ORM and WebSocket server.
- **frontend/**: React application for scanning and monitoring dashboard.
- **python-engine/**: Python script using YOLOv8 for real-time object detection and streaming.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Python](https://www.python.org/) (v3.8 or higher)
- [PostgreSQL](https://www.postgresql.org/)

## Setup Instructions

### 1. Database Setup (PostgreSQL)

1.  Install and start PostgreSQL.
2.  Create a database (e.g., `baggage_db`).
3.  Note your database connection details (username, password, host, port, database name).

### 2. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    -   Create a `.env` file in the `backend` directory (if it does not exist).
    -   Add the `DATABASE_URL` variable:
        ```env
        DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/baggage_db?schema=public"
        ```
        **Note:** Replace `USER`, `PASSWORD`, and `baggage_db` with your actual PostgreSQL credentials.
4.  Initialize the database schema:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5.  Start the backend server:
    ```bash
    npm start
    ```
    -   The API server runs on `http://localhost:5000`.
    -   The WebSocket server runs on `ws://localhost:8081`.

### 3. Frontend Setup

1.  Open a new terminal and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```
    -   The application will open at `http://localhost:3000`.

### 4. Python Engine Setup

1.  Open a new terminal and navigate to the `python-engine` directory:
    ```bash
    cd python-engine
    ```
2.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the detection engine:
    ```bash
    python live_yolo_engine.py --source <VIDEO_SOURCE> --streamId <STREAM_ID>
    ```
    -   `--source`: Path to a video file or camera index (e.g., `0` for webcam).
    -   `--streamId`: A unique identifier for the stream (e.g., `cam1`).

    **Example:**
    ```bash
    python live_yolo_engine.py --source 0 --streamId cam1
    ```

## Running the Complete System

1.  Ensure the **PostgreSQL Database** is running.
2.  Start the **Backend** (`npm start` in `backend/`).
3.  Start the **Frontend** (`npm start` in `frontend/`).
4.  Run the **Python Engine** with your desired video source.
5.  Open `http://localhost:3000` to view the dashboard and real-time analytics.
