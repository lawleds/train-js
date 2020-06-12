const dotenv = require('dotenv')
dotenv.config()
const mongodb = require("mongodb");

mongodb.connect(
  process.env.CONNECTIONSTRING,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, client) {
      module.exports = client.db()//database'e nerede ihtiyacımız olursa kullancaz 
      const app = require('./app')
      app.listen(3000)
  }
);
