# Movie API

A simple Node.js API for managing movies.

## Project Structure

```
project-root/
├── backend/
│   └── main.js         # Main application with all endpoints
├── .env                # Environment variables
├── package.json        # Project dependencies
├── database-setup.sql  # SQL setup script (optional)
└── README.md           # Documentation
```

## Getting Started

1. Install dependencies:

   ```
   npm install
   ```

2. Set up environment variables in `.env`

This project is a Node.js-based API backend for a movie database application. It provides endpoints for managing movies, genres, users, reviews, and watchlists.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn package manager
- MySQL database

### Database Setup

The API connects to a MySQL database with the following credentials:

- **Host**: gbc.goodcodeclub.com
- **User**: w25_101571659
- **Password**: w25_101571659
- **Database**: w25_101571659_a3

### Installation

1. Clone this repository
2. Install dependencies:

```
npm install
```

3. Install nodemon globally (if not already installed):

```
npm i nodemon -g
```

4. Create a `.env` file in the root directory with the following content:

```
SQL_HOSTNAME=gbc.goodcodeclub.com
SQL_USERNAME=w25_101571659
SQL_PASSWORD=w25_101571659
SQL_DBNAME=w25_101571659_a3
```

### Running the Application

Start the server with nodemon for automatic reloading during development:

```
nodemon backend/main.js
```

Or use npm:

```
npm run dev
```

The API will be available at `http://localhost:3001`.

## API Endpoints

### Movies

- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie by ID
- `GET /api/movies/:id/with-genres` - Get movie with genres
- `GET /api/movies/search?title=keyword` - Search movies by title
- `GET /api/movies/genre/:genreId` - Get movies by genre
- `POST /api/movies` - Create a new movie
- `PUT /api/movies/:id` - Update a movie
- `DELETE /api/movies/:id` - Delete a movie

### Genres

- `GET /api/genres` - Get all genres
- `GET /api/genres/:id` - Get genre by ID
- `POST /api/genres` - Create a new genre

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/reviews` - Get user reviews

### Reviews

- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/movie/:movieId` - Get reviews for a movie
- `POST /api/reviews` - Create a new review

## Project Structure

The project follows a simplified structure:

```
project-root/
  ├── backend/
  │   └── main.js         # Main application with all endpoints
  ├── .env                # Environment variables
  ├── package.json        # Project dependencies
  └── README.md           # Documentation
```

## Technologies Used

- Node.js
- Express.js
- MySQL
- Nodemon (development)
