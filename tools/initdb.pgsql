-- Drops movies table
DROP TABLE IF EXISTS movies;

-- Creates movies table
CREATE TABLE IF NOT EXISTS movies (
    id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY
    , user_id varchar(50) NOT NULL
    , title varchar(128) NOT NULL
    , year smallint NULL
    , imdb_link varchar(300) NULL
    , imdb_score NUMERIC(5,2) NULL
);