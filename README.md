# Safety Event Management System - Server

A backend server for managing and storing safety event reports, built with Node.js, Express, and TypeORM.

## Overview

This server provides a RESTful API for the safety event management system. It handles:

- User authentication and authorization
- Storing and retrieving safety event reports
- User management and rank-based permissions
- Database operations using SQLite

## Technologies Used

- **Node.js** – JavaScript runtime environment
- **Express** – Web framework for building the API
- **TypeScript** – Adds static typing for improved reliability
- **TypeORM** – Object-Relational Mapping library for database operations
- **SQLite** – Lightweight database for storing data
- **JWT (JSON Web Tokens)** – Used for user authentication
- **Class Validator** – Validates incoming request data
- **CORS** – Enables cross-origin requests from the client

## Getting Started

### Prerequisites

Make sure you have **Node.js** installed.  
It can be downloaded from the official website: https://nodejs.org/

### Installation

Install all required dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
PORT=3000
JWT_SECRET=your-secret-key-here
```

**Important:** The client application expects the server to run on port `3000`. Make sure to set `PORT=3000` in your `.env` file.

If you don't create a `.env` file, the server will use default values:
- Port: `8080` (you should change this to `3000` to match the client)
- JWT Secret: A default secret string

### Running the Server

Start the development server:

```bash
npm run dev
```

The server will run at `http://localhost:3000` (or the port you specified in `.env`). Make sure the port matches what the client expects.

### Building for Production

Compile TypeScript to JavaScript:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Database Migrations

The server uses TypeORM for database management. Migrations are handled automatically in development mode.

- **Generate migration:** `npm run migration:generate`
- **Run migrations:** `npm run migration:run`
- **Revert migration:** `npm run migration:revert`

## Project Structure

- **src/app.ts** – Main application entry point
- **src/config/** – Configuration files (database connection, environment variables)
- **src/controllers/** – Request handlers for different routes
- **src/dto/** – Data Transfer Objects for validating incoming requests
- **src/entities/** – Database entity models (User, EventReport, etc.)
- **src/middlewares/** – Custom middleware functions (authentication, validation)
- **src/routes/** – API route definitions
- **src/services/** – Business logic and data processing
- **src/utils/** – Utility functions (authentication helpers, data formatting)
- **src/validators/** – Custom validation functions
- **src/db/** – SQLite database file location

## API Endpoints

### Authentication

- **POST /auth/signup** – Create a new user account
- **POST /auth/login** – Login and receive authentication token

### Event Reports

- **POST /event-report** – Create a new event report (requires authentication)
- **PUT /event-report** – Update an existing event report (requires authentication)
- **DELETE /event-report/:id** – Delete an event report (requires authentication)
- **GET /event-reports** – Get all event reports with pagination and filters (requires authentication)

### Users

- User management endpoints are available through `/users` routes

## Features

- **JWT Authentication** – Secure token-based user authentication
- **Request Validation** – Automatic validation of incoming request data
- **Rank-Based Permissions** – User roles and permissions system
- **Database Integration** – SQLite database with TypeORM for data persistence
- **Error Handling** – Proper error responses for invalid requests
- **CORS Support** – Allows requests from the client application
- **Static File Serving** – Serves uploaded images from the public folder

## Notes

- The server uses SQLite database stored in `src/db/database.sqlite`
- Authentication tokens are sent via cookies and Authorization headers
- All event report endpoints require valid authentication
- The server automatically creates database tables on first run
- Image uploads are stored in the `public/images` directory

