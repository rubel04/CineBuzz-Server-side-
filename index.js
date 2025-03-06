import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0goom.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    // await client.connect();
    // console.log("Successfully connect to mongodb");

    const movieCollection = client.db("CineBuzzDB").collection("moviesDb");
    const favoriteMoviesCollection = client
      .db("CineBuzzDB")
      .collection("favoriteMoviesDB");

    // MOVIE RELATED APIS
    app.get("/allMovies", async (req, res) => {
      const cursor = movieCollection.find();
      const movies = await cursor.toArray();
      res.send(movies);
    });
    app.get("/movies", async (req, res) => {
      const cursor = movieCollection.find().limit(6).sort({ rating: -1 });
      const movies = await cursor.toArray();
      res.send(movies);
    });

    app.get("/movie/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await movieCollection.findOne(query);
      res.send(result);
    });

    app.post("/movies", async (req, res) => {
      const newMovies = req.body;
      const result = await movieCollection.insertOne(newMovies);
      res.send(result);
    });

    app.put("/updateMovies/:id", async (req, res) => {
      const id = req.params.id;
      const movie = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateMovie = {
        $set: {
          title: movie.title,
          poster: movie.poster,
          duration: movie.duration,
          rating: movie.rating,
          description: movie.description,
          releaseYear: movie.releaseYear,
          genre: movie.genre,
        },
      };
      const result = await movieCollection.updateOne(filter, updateMovie, options);
      res.send(result);
    });

    app.delete("/movie/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await movieCollection.deleteOne(query);
      res.send(result);
    });


    // FAVORITE MOVIE RELATED APIS
    app.get("/favoriteMovies", async (req, res) => {
      const cursor = favoriteMoviesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/favoriteMovies", async (req, res) => {
      const favMovies = req.body;
      const result = await favoriteMoviesCollection.insertOne(favMovies);
      res.send(result);
    });

    app.delete("/favoriteMovies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await favoriteMoviesCollection.deleteOne(query);
      res.send(result);
    });
  } catch (error) {
    console.log(error);
  }
};

run();

app.get("/", (req, res) => {
  res.send("CineBuzz server is running");
});
app.listen(port, () => {
  console.log(`Cinebuzz server is running on port: ${port}`);
});
