const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@try-myself.0cjln25.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const roomsCollection = client.db("Resort").collection("Rooms");
    const roomBookingCollection = client
      .db("Resort")
      .collection("roombookings");
    const FeaturedroomsCollection = client
      .db("Resort")
      .collection("FeaturedRoom");

    const reviewCollection = client.db("Resort").collection("Reviews");

    app.get("/roombookings", async (req, res) => {
console.log(req.query.email);
console.log('tok tok token',req.cookies.token);

      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await roomBookingCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/rooms", async (req, res) => {
      const cursor = roomsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/addreviews", async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/featuredRooms", async (req, res) => {
      const cursor = FeaturedroomsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/roombookings", async (req, res) => {
      const booking = req.body;

      console.log(booking);

      const unavailableUntil = new Date();
      unavailableUntil.setHours(unavailableUntil.getHours() + 24);

      const result = await roomBookingCollection.insertOne(booking);
      await roomsCollection.updateOne(
        { _id: new ObjectId(booking.roomId) },
        { $set: { unavailableUntil: unavailableUntil } }
      );

      res.send(result);
    });
    app.patch("/roombookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateBooking = req.body;
      console.log(updateBooking);
      const updatedDoc = {
        $set: {
          status: updateBooking.
          status,
          
        },
        
      };
      const result = await roomBookingCollection.updateOne(filter,updatedDoc)
      res.send(result)
    });

    app.post("/addreviews", async (req, res) => {
      const review = req.body;
      console.log("Received review:", review);

      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.delete("/roombookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await roomBookingCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACESS_TOKEN_SECRET, {
        expiresIn: "2h",
      });

      res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
      })
      .send({ success: true });
    
    });

    app.get("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const options = {
        projection: {
          roomName: 1,
          img: 1,
          facilities: 1,
          description: 1,
          price: 1,
          roomSize: 1,
          specialOffer: 1,
        },
      };

      const result = await roomsCollection.findOne(query, options);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Running");
});
app.listen(port, () => {
  console.log(`Resort is running on port ${port}`);
});
