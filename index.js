require("dotenv").config();
const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const createToken = (user) => {
  const token = jwt.sign(
    {
      uid: user?.uid,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return token;
}

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, process.env.JWT_SECRET);
  if (!verify?.uid) {
    return res.send("You are not authorized");
  }
  req.user = verify.uid;
  next();
}

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
    const userCollection = database.collection("userCollection");

    //post api here 

    app.post("/posts", verifyToken, async (req, res) => {
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

    app.patch("/edit_post/:id", verifyToken, async (req, res) => {
      const id = req.params.id
      const postData = req.body
      const result = await postCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: postData }
      )
      res.send(result)
    })

    app.delete("/posts/:id", verifyToken, async (req, res) => {
      const id = req.params.id
      const result = await postCollection.deleteOne(
        { _id: new ObjectId(id) },
      )
      res.send(result)
    })

    // user data 

    app.post("/user", async (req, res) => {
      const user = req.body;

      const token = createToken(user)
      const isUserExist = await userCollection.findOne({ uid: user?.uid });
      if (isUserExist?._id) {
        return res.send({
          status: "success",
          message: "Login success",
          token
        });
      }
      await userCollection.insertOne(user);
      return res.send({ token });
    });





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