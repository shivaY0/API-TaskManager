
const mongoose = require('mongoose');
// const dataModel = require('./api/model');

// const app = express();

// app.use(express.json())

 const mongoConnected= mongoose.connect('mongodb+srv://TestApi:Testapi1@testapi.i4y6fx6.mongodb.net/?retryWrites=true&w=majority',{
     useUnifiedTopology: true,
     useNewUrlParser: true
     }).then(
    () => console.log('DB connected...')
).catch(err => console.log(err))

module.exports = mongoConnected;
