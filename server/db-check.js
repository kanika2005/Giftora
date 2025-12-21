const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/the_party_shop';

async function run(){
  try{
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    if(cols.length===0){
      console.log('No collections found in this database.');
    }else{
      for(const c of cols){
        const name = c.name;
        const count = await db.collection(name).countDocuments();
        console.log(`${name}: ${count}`);
      }
    }
    await mongoose.disconnect();
  }catch(e){
    console.error('DB check failed:', e.message);
    process.exit(1);
  }
}

run();
