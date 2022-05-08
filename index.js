const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_DEALER}:${process.env.DB_PASSWORD}@cluster0.dfp10.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const itemCollection = client.db("laptopDealer").collection("item");

    // Authentication Token
    app.post("/login", async (req, res) => {
      const user = req.body;
      const getToken = jwt.sign(user, process.env.JWT_SECRET_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ getToken });
    });

    // Item API
    app.get("/item", async (req, res) => {
      const query = {};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await itemCollection.findOne(query);
      res.send(item);
    });

    //Post a new Item
    app.post("/item", async (req, res) => {
      const newItem = req.body;
      const getResult = await itemCollection.insertOne(newItem);
      res.send(getResult);
    });

    // Put or update a item
    app.put("/item/:id", async (req, res) => {
      const id = req.params.id;
      const quantityNumber = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedQuantity = {
        $set: {
          quantity: quantityNumber.number,
        },
      };
      const result = await itemCollection.updateOne(
        filter,
        updatedQuantity,
        options
      );
      res.send(result);
    });

    //Delete one item
    app.delete("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deleteResult = await itemCollection.deleteOne(query);
      res.send(deleteResult);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running laptop-dealer server");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});
