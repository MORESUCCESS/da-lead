const mongoose = require('mongoose');

const connectToDb = async ()=>{
    mongoose.connection.on('connected', ()=>{
        console.log("Database connected successfully!")
    })

    await mongoose.connect(`${process.env.MONGODB}/fynlead`)
}

module.exports = connectToDb;