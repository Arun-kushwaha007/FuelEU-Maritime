# FuelEU Maritime Compliance Platform

## Project Overview

This project is a comprehensive platform designed to help maritime companies comply with the FuelEU Maritime regulation. It provides tools for tracking, managing, and optimizing GHG emissions, ensuring compliance with regulatory requirements.

## Architecture Summary

The application is built using a hexagonal architecture (also known as ports and adapters), which separates the core application logic from external concerns such as databases, APIs, and UI components.

### Folder Structure

*   **Frontend**: Contains the React-based user interface.
    *   `src/`: Main source code directory.
        *   `components/`: Reusable UI components.
        *   `pages/`: Application pages (Routes, Compare, Banking, Pooling).
        *   `hooks/`: Custom React hooks for API integration.
*   **Backend**: Contains the Node.js and Express-based server.
    *   `src/`: Main source code directory.
        *   `core/`: Core application logic and domain models.
        *   `adapters/`: Adapters for external services (e.g., database).
        *   `infrastructure/`: Framework-specific code (e.g., Express routes).

## Tech Stack

*   **Frontend**: React, TypeScript, TailwindCSS, Vite
*   **Backend**: Node.js, TypeScript, Express, Prisma, PostgreSQL

## Setup Instructions

### Prerequisites

*   Node.js (v18 or higher)
*   PostgreSQL

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    ```
2.  **Install frontend dependencies**:
    ```bash
    cd frontend && npm install
    ```
3.  **Install backend dependencies**:
    ```bash
    cd backend && npm install
    ```
4.  **Database setup**:
    *   Create a PostgreSQL database.
    *   Copy the `.env.example` file to `.env` in the `backend` directory and update the `DATABASE_URL` with your database connection string.
5.  **Run database migrations and seeding**:
    ```bash
    cd backend && npx prisma migrate dev --name init
    npx prisma db seed
    ```

## Running the Application

*   **Start the backend server**:
    ```bash
    cd backend && npm run dev
    ```
*   **Start the frontend development server**:
    ```bash
    cd frontend && npm run dev
    ```
*   The application will be available at `http://localhost:5173`.

## Running Tests

*   **Run backend tests**:
    ```bash
    cd backend && npm test
    ```
*   **Run frontend tests**:
    ```bash
    cd frontend && npm test
    ```

## API Documentation

*(This section will be populated with a summary of the available API endpoints)*

## Features Overview

*   **Routes**: [Brief description of the Routes tab]
*   **Compare**: [Brief description of the Compare tab]
*   **Banking**: [Brief description of the Banking tab]
*   **Pooling**: [Brief a description of the Pooling tab]
