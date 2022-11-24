
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





app.listen(port ,()=>{
    console.log("server listening on port",port);
})