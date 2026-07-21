# Safety Event Management System - Server

A backend server for managing safety event reports. Built with Node.js, Express, and TypeORM.

## What This Server Does

This is the server-side (backend) part of the safety event management system. It provides:

- User authentication (login and signup)
- API endpoints for managing safety event reports
- Storage and retrieval of event data
- User management with rank-based permissions
- Image upload handling for event reports
- Statistics and overview data
- SQLite database for data storage
- Address search and reverse geocoding (proxy to OpenStreetMap Nominatim)
- Automatic historical weather lookup for an event's date, time and location (proxy to Open-Meteo)

## Technologies Used

- **Node.js** - JavaScript runtime environment
- **Express** - Web framework for building the API
- **TypeScript** - Adds type checking for better code quality
- **TypeORM** - Database management and operations
- **SQLite** - Lightweight database for storing data
- **JWT (JSON Web Tokens)** - User authentication
- **Class Validator** - Validates incoming request data
- **Multer** - Handles file uploads (images)
- **CORS** - Allows requests from the client application
- **Cookie Parser** - Handles authentication cookies

## External APIs

The server integrates with two free, external, key-less APIs to enrich event reports with location and weather data. Both are called from the server (not directly from the client) to keep the integration centralized and CORS-safe.

- **OpenStreetMap Nominatim** (`https://nominatim.openstreetmap.org`) - Address search and reverse geocoding (turning coordinates into a readable address)
- **Open-Meteo** (`https://archive-api.open-meteo.com`, with a fallback to `https://api.open-meteo.com` for very recent dates) - Hourly historical weather data (condition + temperature) for a given date, time and coordinates

## Getting Started

### What You Need

You need **Node.js** installed on your computer.  
Download it from: https://nodejs.org/

### Installation

1. Open a terminal in the `safety-server-yitzchak-shaish` folder
2. Install all required packages:

```bash
npm install
```

### Environment Variables

You can create a `.env` file in the root directory (optional):

```env
PORT=3000
JWT_SECRET=your-secret-key-here
```

**Important:** The client expects the server to run on port `3000`. Make sure to set `PORT=3000` in your `.env` file.

If you don't create a `.env` file, the server will use default values:
- Port: `8080` (you should change this to `3000` to match the client)
- JWT Secret: A default secret string

### Running the Server

Start the development server:

```bash
npm run dev
```

The server will run at `http://localhost:3000` (or the port you specified in `.env`).

**Important:** Make sure the port matches what the client expects (`3000`).

### Building for Production

1. Compile TypeScript to JavaScript:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

### Database Migrations

The server uses TypeORM for database management. Migrations are handled automatically in development mode.

- **Generate migration:** `npm run migration:generate`
- **Run migrations:** `npm run migration:run`
- **Revert migration:** `npm run migration:revert`

## Project Structure

- **src/app.ts** - Main application entry point, sets up Express server

- **src/config/** - Configuration files
  - `datasource.ts` - Database connection configuration
  - `index.ts` - Environment variables and configuration
  - `multer.ts` - File upload configuration

- **src/controllers/** - Request handlers
  - `auth.controller.ts` - Login and signup logic
  - `eventReport.controller.ts` - Event report CRUD operations
  - `overview.controller.ts` - Statistics and overview data
  - `reportImages.controller.ts` - Image upload handling
  - `user.controller.ts` - User management
  - `geo.controller.ts` - Address search and reverse geocoding
  - `weather.controller.ts` - Historical weather lookup

- **src/dto/** - Data Transfer Objects (request validation)
  - `EventReport.dto.ts` - Event report creation/update validation
  - `User.dto.ts` - User registration/login validation

- **src/entities/** - Database models
  - User, EventReport, EventInfo (includes optional `address`, `latitude`, `longitude`), ReporterProfile, EventImage, SummaryInfo

- **src/middlewares/** - Custom middleware functions
  - `auth.middleware.ts` - Authentication and authorization checks
  - `validateBody.middleware.ts` - Request body validation
  - `checkUserExists.middleware.ts` - User existence checks

- **src/routes/** - API route definitions
  - `auth.router.ts` - Authentication routes
  - `eventReport.router.ts` - Event report routes
  - `overview.routes.ts` - Statistics routes
  - `reportImages.routes.ts` - Image upload routes
  - `user.router.ts` - User management routes
  - `geo.router.ts` - Address search / reverse geocoding routes
  - `weather.router.ts` - Weather lookup route

- **src/services/** - Business logic and data processing

- **src/utils/** - Utility functions

- **src/validators/** - Custom validation functions

- **src/db/** - SQLite database file location (`database.sqlite`)

## API Endpoints

### Authentication

- **POST /auth/signup** - Create a new user account
  - Requires: username, password, fullName, rank
  - Returns: User information and authentication token

- **POST /auth/login** - Login to the system
  - Requires: username, password
  - Returns: User information and authentication token

### Event Reports

- **POST /event-report** - Create a new event report (requires authentication)
  - Requires: Event report data in request body
  - Returns: Created event report

- **PUT /event-report** - Update an existing event report (requires authentication)
  - Requires: Event report data with ID in request body
  - Returns: Updated event report

- **DELETE /event-report/:id** - Delete an event report (requires authentication)
  - Requires: Event report ID in URL
  - Returns: Success message

- **GET /event-reports** - Get all event reports (requires authentication)
  - Supports pagination and filtering via query parameters
  - Returns: List of event reports

### Images

- **POST /reports/:reportId/images** - Upload images for an event report
  - Requires: Form data with image files (up to 10 images)
  - Returns: Success message

### Overview/Statistics

- **GET /overview** - Get statistics and overview data (requires authentication)
  - Returns: Statistics about events (total reports, events by status, etc.)

### Users

- **GET /users/get-all** - Get all users (requires authentication)
  - Returns: List of all users

- **GET /users/:id** - Get user by ID
  - Returns: User information

### Location & Weather (external API proxies)

- **GET /geo/search?q=** - Search for an address (proxies OpenStreetMap Nominatim)
  - Requires: `q` query parameter (search text), minimum 2 characters
  - Returns: List of matching addresses with display name and coordinates

- **GET /geo/reverse?lat=&lon=** - Turn coordinates into a readable address (reverse geocoding)
  - Requires: `lat`, `lon` query parameters
  - Returns: Address matching the given coordinates

- **GET /weather?lat=&lon=&date=&time=** - Get the historical weather condition and temperature for a specific location, date and hour
  - Requires: `lat`, `lon`, `date` (YYYY-MM-DD) query parameters; `time` (HH:mm) is optional, defaults to `12:00`
  - Returns: Weather condition (mapped to the app's Hebrew weather categories) and temperature in Celsius

## Main Features

### Authentication
- JWT token-based authentication
- Tokens sent via cookies and Authorization headers
- Middleware to protect routes that require authentication
- User rank-based permission system

### Request Validation
- All incoming requests are validated using DTOs (Data Transfer Objects)
- Invalid requests return proper error messages
- Uses class-validator for validation

### Database
- SQLite database stored in `src/db/database.sqlite`
- TypeORM for database operations
- Automatic table creation on first run
- Support for database migrations

### File Uploads
- Image uploads handled with Multer
- Images stored in `public/uploads` directory
- Supports multiple images per event report (up to 10)
- Images served as static files

### Location & Weather
- Address search and reverse geocoding proxied through OpenStreetMap Nominatim
- Hourly historical weather lookup proxied through Open-Meteo, matched to the event's exact date and time
- Both are proxied from the server so no API key is exposed to the client and CORS is avoided

### Error Handling
- Proper error responses for invalid requests
- 404 handler for non-existent routes
- Error messages in Hebrew

### CORS Support
- Configured to allow requests from the client application
- Supports credentials (cookies)

## Important Notes

- The server uses SQLite database - the database file is created automatically
- Authentication tokens are sent via cookies and Authorization headers
- All event report endpoints require valid authentication
- Image uploads are stored in `public/uploads` directory
- Images are served from `/uploads` and `/images` routes
- The server automatically creates database tables on first run
- Default port is 8080, but should be set to 3000 to match the client
- The server includes rank-based permissions for different user roles
