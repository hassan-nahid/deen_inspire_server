require("dotenv").config();
const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const port = process.env.PORT;

app.use(cors());
app.use(express.json());



const uri = process.env.MONGODB_URL

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const database = client.db("Deen_Inspire");
    const postCollection = database.collection("postCollection");

    //post api here 

    app.post("/posts", async (req, res) => {
      const postData = req.body
      const result = await postCollection.insertOne(postData)
      res.send(result)
    })

    app.get("/posts", async (req, res) => {
      const shoeData = postCollection.find()
      const result = await shoeData.toArray()
      res.send(result)
    })

    app.get("/posts/:id", async (req, res) => {
      const id = req.params.id
      const result = await postCollection.findOne({ _id: new ObjectId(id) })
      res.send(result)
    })

    app.patch("/posts/:id", async (req, res) => {
      const id = req.params.id
      const postData = req.body
      const result = await postCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: postData }
      )
      res.send(result)
    })

    app.patch("/edit_post/:id", async (req, res) => {
      const id = req.params.id
      const postData = req.body
      const result = await postCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: postData }
      )
      res.send(result)
    })

    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id
      const result = await postCollection.deleteOne(
        { _id: new ObjectId(id) },
      )
      res.send(result)
    })


    await client.db("admin").command({ ping: 1 });
    console.log("successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Server is Running...");
});

app.listen(port, (req, res) => {
  console.log("App is listening on port :", port);
});