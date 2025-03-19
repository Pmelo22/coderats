CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    github_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    avatar_url TEXT NOT NULL
);

CREATE TABLE rankings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    commits INTEGER DEFAULT 0
);
