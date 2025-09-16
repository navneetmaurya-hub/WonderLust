const mongoose=require("mongoose");
const initdata=require("./data.js");
const Listing=require("../models/listing.js");

main().then((res) =>{
    console.log("connected to db");
}).catch((err) =>{
   console.log(err);
});

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wonderlust');
} 
const initDB= async () => {
   await Listing.deleteMany({});
   initdata.data=initdata.data.map((obj) => ({
      ...obj,
      owner: "68b40274973d7c33f1d80f35"
    })); // Replace with a valid ObjectId from your User collection
   await Listing.insertMany(initdata.data);
   console.log("data was initialed"); 
};
initDB();

