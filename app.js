const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Success')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertMovieNameToPascalCase = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

//API 1
app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
  SELECT 
  movie_name
  FROM 
  movie`
  const moviesArray = await db.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => convertMovieNameToPascalCase(eachMovie)),
  )
})
// API 2
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const postMovieQuery = `
  INSERT INTO 
      movie(director_id, movie_name, lead_actor)
  VALUES (
    ${directorId},
    '${movieName}',
    '${leadActor}')`
  const addMovie = await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

const convertMoviesDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
// API 3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT
    *
  FROM
    movie
  WHERE
    movie_id= ${movieId}`
  const movie = await db.get(getMovieQuery)
  response.send(convertMoviesDbObjectToResponseObject(movie))
})

// API 4
app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const details = request.body
  const {directorId, movieName, leadActor} = details

  const updateMovieQuery = `
    UPDATE 
      movie
    SET
      director_id= ${directorId},
      movie_name= '${movieName}',
      lead_actor= '${leadActor}'
    WHERE 
      movie_id= ${movieId}`
  const updateMovie = await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

// API 5
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE 
  FROM
  movie
  WHERE movie_id= ${movieId}`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

const convertDirectorsDbToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

// API 6
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
  SELECT
    *
  FROM
    director`
  const directorsArray = await db.all(getDirectorsQuery)
  response.send(directorsArray.map(i => convertDirectorsDbToResponseObject(i)))
})

const convertMovieNamesPascalCase = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}
// API 7

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `
  SELECT
    movie_name
  FROM
    director INNER JOIN movie
    ON director.director_id = movie.director_id
  WHERE 
    director.director_id= ${directorId}`
  const directorMoviesArray = await db.all(getDirectorMoviesQuery)
  response.send(directorMoviesArray.map(i => convertMovieNamesPascalCase(i)))
})

module.exports = app
