const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middleware
// 

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@try-myself.0cjln25.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const roomsCollection = client.db("Resort").collection("Rooms");
const roomBookingCollection = client.db("Resort").collection("roombookings")
    const FeaturedroomsCollection = client
      .db("Resort")
      .collection("FeaturedRoom");



    app.get("/rooms", async (req, res) => {
      const cursor = roomsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/featuredRooms", async (req, res) => {
      const cursor = FeaturedroomsCollection.find();
      const result = await cursor.toArray();
      res.send(result);

    });

    app.post('/roombookings',async (req,res)=>{
      const booking = req.body;
      console.log(booking);
      const result = await roomBookingCollection.insertOne(booking);
      res.send(result)
    })

    app.get("/featuredRooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query, options);
      res.send(result);
    });
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

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("S3erver is Running");
});
app.listen(port, () => {
  console.log(`Car Doctor server is running on port ${port}`);
});
