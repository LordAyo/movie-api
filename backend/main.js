// Get the client
const mysql = require("mysql2");
require("dotenv").config();

// Create the connection to database
const pool = mysql.createPool({
  host: process.env.SQL_HOSTNAME,
  user: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DBNAME,
});

// Set up the API
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;

// Make it available for public access
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
});

app.use(cors());
app.options("*", cors());

app.set("json spaces", 2);
app.use(
  bodyParser.json({
    limit: "50mb",
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Listen to outside connection
app.listen(port, () => {
  console.log(`App running on port ${port}. Control+C to exit.`);
});

// Root endpoint
app.get("/", (request, response) => {
  response.json({
    info: "Movie API Backend",
  });
});

// ==== MOVIES ENDPOINTS ====

// Get all movies
app.get("/api/movies", (request, response) => {
  const page = parseInt(request.query.page) || 1;
  const limit = parseInt(request.query.limit) || 10;
  const offset = (page - 1) * limit;

  pool.query(
    "SELECT * FROM movies LIMIT ? OFFSET ?",
    [limit, offset],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }
      response.json({
        status: "success",
        data: result,
      });
    }
  );
});

// Get movie by ID
app.get("/api/movies/:id", (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT * FROM movies WHERE movie_id = ?",
    [id],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      if (result.length === 0) {
        response.status(404).json({
          status: "error",
          message: `Movie with id ${id} not found`,
        });
        return;
      }

      response.json({
        status: "success",
        data: result[0],
      });
    }
  );
});

// Get movie with genres
app.get("/api/movies/:id/with-genres", (request, response) => {
  const id = request.params.id;

  pool.query(
    `SELECT m.*, GROUP_CONCAT(g.name) as genres
         FROM movies m
         LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
         LEFT JOIN genres g ON mg.genre_id = g.genre_id
         WHERE m.movie_id = ?
         GROUP BY m.movie_id`,
    [id],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      if (result.length === 0) {
        response.status(404).json({
          status: "error",
          message: `Movie with id ${id} not found`,
        });
        return;
      }

      response.json({
        status: "success",
        data: result[0],
      });
    }
  );
});

// Search movies by title
app.get("/api/movies/search", (request, response) => {
  const title = request.query.title;

  if (!title) {
    response.status(400).json({
      status: "error",
      message: "Title query parameter is required",
    });
    return;
  }

  pool.query(
    "SELECT * FROM movies WHERE title LIKE ?",
    [`%${title}%`],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      response.json({
        status: "success",
        data: result,
      });
    }
  );
});

// Get movies by genre
app.get("/api/movies/genre/:genreId", (request, response) => {
  const genreId = request.params.genreId;

  pool.query(
    `SELECT m.*
         FROM movies m
         JOIN movie_genres mg ON m.movie_id = mg.movie_id
         WHERE mg.genre_id = ?`,
    [genreId],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      response.json({
        status: "success",
        data: result,
      });
    }
  );
});

// Create a new movie
app.post("/api/movies", (request, response) => {
  const { title, release_year, duration_minutes, plot_summary, rating } =
    request.body;

  if (!title) {
    response.status(400).json({
      status: "error",
      message: "Title is required",
    });
    return;
  }

  pool.query(
    "INSERT INTO movies (title, release_year, duration_minutes, plot_summary, rating) VALUES (?, ?, ?, ?, ?)",
    [title, release_year, duration_minutes, plot_summary, rating],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      response.status(201).json({
        status: "success",
        message: "Movie created successfully",
        id: result.insertId,
      });
    }
  );
});

// Update a movie
app.put("/api/movies/:id", (request, response) => {
  const id = request.params.id;
  const { title, release_year, duration_minutes, plot_summary, rating } =
    request.body;

  if (!title) {
    response.status(400).json({
      status: "error",
      message: "Title is required",
    });
    return;
  }

  pool.query(
    "UPDATE movies SET title = ?, release_year = ?, duration_minutes = ?, plot_summary = ?, rating = ? WHERE movie_id = ?",
    [title, release_year, duration_minutes, plot_summary, rating, id],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      if (result.affectedRows === 0) {
        response.status(404).json({
          status: "error",
          message: `Movie with id ${id} not found`,
        });
        return;
      }

      response.json({
        status: "success",
        message: "Movie updated successfully",
      });
    }
  );
});

// Delete a movie
app.delete("/api/movies/:id", (request, response) => {
  const id = request.params.id;

  pool.query("DELETE FROM movies WHERE movie_id = ?", [id], (error, result) => {
    if (error) {
      response.status(500).json({
        status: "error",
        message: error.message,
      });
      return;
    }

    if (result.affectedRows === 0) {
      response.status(404).json({
        status: "error",
        message: `Movie with id ${id} not found`,
      });
      return;
    }

    response.json({
      status: "success",
      message: "Movie deleted successfully",
    });
  });
});

// ==== GENRES ENDPOINTS ====

// Get all genres
app.get("/api/genres", (request, response) => {
  pool.query("SELECT * FROM genres", [], (error, result) => {
    if (error) {
      response.status(500).json({
        status: "error",
        message: error.message,
      });
      return;
    }

    response.json({
      status: "success",
      data: result,
    });
  });
});

// Get genre by ID
app.get("/api/genres/:id", (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT * FROM genres WHERE genre_id = ?",
    [id],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      if (result.length === 0) {
        response.status(404).json({
          status: "error",
          message: `Genre with id ${id} not found`,
        });
        return;
      }

      response.json({
        status: "success",
        data: result[0],
      });
    }
  );
});

// Create a new genre
app.post("/api/genres", (request, response) => {
  const { name, description } = request.body;

  if (!name) {
    response.status(400).json({
      status: "error",
      message: "Genre name is required",
    });
    return;
  }

  pool.query(
    "INSERT INTO genres (name, description) VALUES (?, ?)",
    [name, description],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      response.status(201).json({
        status: "success",
        message: "Genre created successfully",
        id: result.insertId,
      });
    }
  );
});

// ==== USERS ENDPOINTS ====

// Get all users
app.get("/api/users", (request, response) => {
  pool.query(
    "SELECT user_id, username, email, is_active, created_at FROM users",
    [],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      response.json({
        status: "success",
        data: result,
      });
    }
  );
});

// Get user by ID
app.get("/api/users/:id", (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT user_id, username, email, is_active, created_at FROM users WHERE user_id = ?",
    [id],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      if (result.length === 0) {
        response.status(404).json({
          status: "error",
          message: `User with id ${id} not found`,
        });
        return;
      }

      response.json({
        status: "success",
        data: result[0],
      });
    }
  );
});

// Get user reviews
app.get("/api/users/:id/reviews", (request, response) => {
  const userId = request.params.id;

  pool.query(
    `SELECT r.*, m.title as movie_title
         FROM reviews r
         JOIN movies m ON r.movie_id = m.movie_id
         WHERE r.user_id = ?`,
    [userId],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      response.json({
        status: "success",
        data: result,
      });
    }
  );
});

// ==== REVIEWS ENDPOINTS ====

// Get all reviews
app.get("/api/reviews", (request, response) => {
  pool.query(
    `SELECT r.*, u.username, m.title as movie_title
         FROM reviews r
         JOIN users u ON r.user_id = u.user_id
         JOIN movies m ON r.movie_id = m.movie_id`,
    [],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      response.json({
        status: "success",
        data: result,
      });
    }
  );
});

// Get movie reviews
app.get("/api/reviews/movie/:movieId", (request, response) => {
  const movieId = request.params.movieId;

  pool.query(
    `SELECT r.*, u.username
         FROM reviews r
         JOIN users u ON r.user_id = u.user_id
         WHERE r.movie_id = ?`,
    [movieId],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      response.json({
        status: "success",
        data: result,
      });
    }
  );
});

// Create a review
app.post("/api/reviews", (request, response) => {
  const { movie_id, user_id, rating, review_text } = request.body;

  if (!movie_id || !user_id || !rating) {
    response.status(400).json({
      status: "error",
      message: "Movie ID, user ID, and rating are required",
    });
    return;
  }

  // Validate rating
  if (rating < 1 || rating > 10) {
    response.status(400).json({
      status: "error",
      message: "Rating must be between 1 and 10",
    });
    return;
  }

  pool.query(
    "INSERT INTO reviews (movie_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)",
    [movie_id, user_id, rating, review_text],
    (error, result) => {
      if (error) {
        response.status(500).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      response.status(201).json({
        status: "success",
        message: "Review created successfully",
        id: result.insertId,
      });
    }
  );
});
