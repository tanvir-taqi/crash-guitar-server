
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { application, query } = require('express');
require('dotenv').config()
const port = process.env.PORT || 5000

const app = express()


app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
res.send("welcome to crash guitar server!")
})

// crashguitar
// Nh59HOrNNs1Q5RYr




const uri = process.env.DB_ACCESS
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
 if(err){
    console.log(err.message);
 }else{
    console.log("database connection established");
 }
});



const run = async ()=>{
   try{

      const categoryCollection = client.db("crashguitar").collection("productCategory")
      const usersCollection = client.db("crashguitar").collection("users")
      const productsCollection = client.db("crashguitar").collection("products")

      // load category collection 
      app.get('/category' , async (req,res)=>{
         const query = {}
         const result = await categoryCollection.find(query).toArray();
         res.send(result)
      })


      // post user to db 

      app.post('/allusers', async (req,res)=>{
         const user = req.body
         
         const result = await usersCollection.insertOne(user)
         res.send(result)
      })

      // load single user by query parameters
      app.get("/users", async (req,res)=>{
         const userEmail = req.query.email
         const query = {email: userEmail}
         const result = await usersCollection.findOne(query)
         res.send(result)
      })


      // post products to db 

      app.post('/products', async(req,res)=>{
         const product = req.body
         const result = await productsCollection.insertOne(product)
         res.send(result)
      })

      // load products by id or all products
      app.get('/products/:id', async(req,res)=>{
         const productId = req.params.id
         const query = {categoryid:productId}
         const result = await productsCollection.find(query).toArray()
         res.send(result)
      })


   }finally{

   }
}
run().catch(err => console.log(err.message))





app.listen(port ,()=>{
    console.log("server listening on port",port);
})