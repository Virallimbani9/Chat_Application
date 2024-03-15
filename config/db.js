const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected !!!');
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
};

module.exports = connectDatabase;
 