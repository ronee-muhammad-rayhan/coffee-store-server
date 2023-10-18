const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5001;

// middleware
app.use(cors());
app.use(express.json());

const uri =
  //   "mongodb+srv://<username>:<password>@cluster0.nmv0r0r.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp";
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nmv0r0r.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp`;

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
    const coffeeCollection = client.db('coffeeDB').collection('coffeeCollection');
    const userCollection = client.db('coffeeDB').collection('userCollection');

    app.get('/coffees', async (req, res) => {
      const cursor = coffeeCollection.find();
      // console.log(cursor);
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    })

    app.get(`/coffees/:id`, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    })


    app.post('/coffees', async (req, res) => {
      const newCoffee = req.body;
      console.log(newCoffee);

      const result = await coffeeCollection.insertOne(newCoffee);
      console.log(`A coffee is added with the _id:${result.insertedId}`, result);
      res.send(result);

    })

    app.put('/coffees/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) } //filter=query
      const options = { upsert: true }
      const updatedCoffee = req.body
      const coffee = {
        $set: {
          name: updatedCoffee.name,
          quantity: updatedCoffee.quantity,
          supplier: updatedCoffee.supplier,
          taste: updatedCoffee.taste,
          category: updatedCoffee.category,
          details: updatedCoffee.details,
          photo: updatedCoffee.photo,
        }
      }
      const result = await coffeeCollection.updateOne(filter, coffee, options);
      res.send(result)

    })

    app.delete('/coffees/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    })


    // user related apis
    app.post('/users', async (req, res) => {
      const user = req.body
      console.log(user);
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

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
  res.send("Coffee Store server is running");
});

app.listen(port, () => {
  console.log(`Coffee Store server listening on ${port}`);
});
