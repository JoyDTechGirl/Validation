require("dotenv").config();
require("./config/database")
const express_session = require('express-session')
const express = require("express");

const PORT = process.env.PORT || 1232;

const app = express();

const userRouter = require('./routes/userRouter');
const productRouter = require("./routes/productRouter")

app.use(express.json());
app.use(express_session({secret: 'return',resave: false}))
require('./utils/passport')
app.use('/api/v1', userRouter)
app.use('/api/v1', productRouter)



app.listen(PORT, () => {
  console.log(`server is listening to port: ${PORT}`);

})