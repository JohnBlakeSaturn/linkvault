const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Database connected.")

    } catch(e) {
        console.log(e)
    }
}

module.exports = dbConnection;