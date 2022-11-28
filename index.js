
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { application, query } = require('express');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000

const app = express()


app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
   res.send("welcome to crash guitar server!")
})

// crashguitar
// Nh59HOrNNs1Q5RYr


const verifyJwt = (req, res, next) => {
   const authHeader = req.headers.authorization
   if (!authHeader) {
      return res.status(401).send({ message: "unothorized user" })
   }
   const token = authHeader.split(' ')[1]
   jwt.verify(token, process.env.ACCES_TOKEN_SECRET, (error, decoded) => {
      if (error) {
         return res.status(401).send({ message: "unothorized user" })
      }
      req.decoded = decoded
      next()
   })
}



const uri = process.env.DB_ACCESS
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
   const collection = client.db("test").collection("devices");
   // perform actions on the collection object
   if (err) {
      console.log(err.message);
   } else {
      console.log("database connection established");
   }
});



const run = async () => {
   try {

      const categoryCollection = client.db("crashguitar").collection("productCategory")
      const usersCollection = client.db("crashguitar").collection("users")
      const productsCollection = client.db("crashguitar").collection("products")
      const bookingsCollection = client.db("crashguitar").collection("bookings")


      //jwt token post api 
      app.post('/jwt', (req, res) => {
         const user = req.body
         const token = jwt.sign(user, process.env.ACCES_TOKEN_SECRET)
         res.send({ token })

      })


      // load category collection 
      app.get('/category', async (req, res) => {
         const query = {}
         const result = await categoryCollection.find(query).toArray();
         res.send(result)
      })


      // post user to db 
      app.post('/allusers', async (req, res) => {
         const user = req.body
         const userEmail = user.email
         const query = {email : userEmail}

         const oldUsers = await usersCollection.findOne(query)
         if(oldUsers){
            return res.send({message: 'User already exists'})
         }

         const result = await usersCollection.insertOne(user)
         res.send(result)
      })

      // load single user by query parameters
      app.get("/users", async (req, res) => {
         const userEmail = req.query.email
         const query = { email: userEmail }
         const result = await usersCollection.findOne(query)
         res.send(result)
      })


      // post products to db 

      app.post('/products', async (req, res) => {
         const product = req.body
         const result = await productsCollection.insertOne(product)
         res.send(result)
      })

      // load products by id
      app.get('/products/:id', async (req, res) => {
         const productId = req.params.id
         const query = { categoryid: productId }
         const result = await productsCollection.find(query).toArray()
         res.send(result)
      })

      // load products by query email of seller

      app.get('/myproducts', async (req, res) => {
         const userEmail = req.query.email 
         const query = { sellerEmail: userEmail }
         const result = await productsCollection.find(query).toArray()
         res.send(result)

      })


      // delete product by seller by product id 
      app.delete('/myproducts/:id', async (req, res) => {
         const productId = req.params.id
         const query = { _id: ObjectId(productId) }
         const result = await productsCollection.deleteOne(query)
         res.send(result)
      })


      // advertise update 
      app.put('/myproducts/:id', async (req, res) => {
         const productId = req.params.id
         const filter = { _id: ObjectId(productId) }
         const options = { upsert: true }
         const updatedDoc = {
            $set: {
               advertise: true
            }
         }
         const result = await productsCollection.updateOne(filter, updatedDoc, options)
         res.send(result)
      })

      //update product status 
      app.put('/products/:id', async (req, res) => {
         const productId = req.params.id
         const status = req.body.status
         const filter = { _id: ObjectId(productId) }
         const options = { upsert: true }
         const updatedDoc = {
            $set: {
               status: status
            }
         }
         const result = await productsCollection.updateOne(filter, updatedDoc, options)
         res.send(result)
      })

      // post api for booked product
      app.post('/bookings', async (req, res) => {
         const booking = req.body
         const result = await bookingsCollection.insertOne(booking)
         res.send(result)
      })

      // get my orders by email query 
      app.get('/myorders', verifyJwt, async (req, res) => {

         const decoded = req.decoded
         if (decoded.email !== req.query.email) {
             return res.status(403).send({ message: "unothorized user" })
         }
         let query = {}

         const userEmail = req.query.email
         if(userEmail){

             query = { buyersEmail: userEmail }
         }
         const result = await bookingsCollection.find(query).toArray()
         res.send(result)
      })

      // delete my orders
      app.delete('/myorders/:id', async (req, res) => {
         const query = { _id: ObjectId(req.params.id) }
         const result = await bookingsCollection.deleteOne(query)
         res.send(result)
      })

      // load advertised products from db
      app.get('/advertisedproduct',verifyJwt, async (req, res) => {
         const query = { advertise: true }
         const result = await productsCollection.find(query).toArray();
         res.send(result)
      })

      // load all sellers from db
      app.get('/allseller',verifyJwt, async (req, res) => {
         const query = { role: "seller" }
         const result = await usersCollection.find(query).toArray()
         res.send(result)
      })

      // load all buyers from db
      app.get('/allbuyer',verifyJwt, async (req, res) => {
         const query = { role: "buyer" }
         const result = await usersCollection.find(query).toArray()
         res.send(result)
      })

      // delete buyer by id from db
      app.delete('/allbuyer/:id', async (req, res) => {
         const userId = req.params.id
         const query = { _id: ObjectId(userId) }
         const result = await usersCollection.deleteOne(query)
         res.send(result)
      })

      // delete buyer by id from db
      app.delete('/allseller/:id', async (req, res) => {
         const userId = req.params.id
         const query = { _id: ObjectId(userId) }
         const result = await usersCollection.deleteOne(query)
         res.send(result)
      })

      // put request to verify seller account
      app.put('/allseller/:id', async (req, res) => {
         const userId = req.params.id

         const filter = { _id: ObjectId(userId) }
         const options = { upsert: true }
         const updatedDoc = {
            $set: {
               verified: true
            }
         }
         const result = await usersCollection.updateOne(filter, updatedDoc, options)
         res.send(result)
      })

      // load the users verfied info
      app.get('/usersverification', async (req, res) => {
         const userEmail = req.query.email

         const query = { email: userEmail }
         const result = await usersCollection.findOne(query)

         res.send(result)
      })


      // delete deleted sellers products
      app.delete('/usersproducts', async (req, res) => {
         const sellersEmail = req.params.email
         const query = { sellerEmail: sellersEmail }
         const result = await productsCollection.deleteMany(query)
         res.send(result)
      })


   } finally {

   }
}
run().catch(err => console.log(err.message))





app.listen(port, () => {
   console.log("server listening on port", port);
})