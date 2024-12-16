const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error(
    "Mongo URI not available. Please check your environment variables."
  );
}

let cached = global._mongooseClientPromise;

// Check if we already have a cached connection
if (!cached) {
  cached = global._mongooseClientPromise = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    // Return existing connection
    return cached.conn;
  }

  if (!cached.promise) {
    // Create a new connection
    console.log("Establishing a new connection to MongoDB...");
    cached.promise = mongoose
      .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => {
        console.log("MongoDB connected successfully.");
        return mongoose;
      })
      .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = dbConnect;