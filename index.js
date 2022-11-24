
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000

const app = express()


app.use(cors())

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

      // load category collection 
      app.get('/category' , async (req,res)=>{
         const query = {}
         const result = await categoryCollection.find(query).toArray();
         res.send(result)
      })


   }finally{

   }
}
run().catch(err => console.log(err.message))





app.listen(port ,()=>{
    console.log("server listening on port",port);
})