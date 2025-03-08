require("dotenv").config();
require("./config/database")
const express = require("express");

const PORT = process.env.PORT || 1232;

const app = express();

const userRouter = require('./routes/userRouter');
const productRouter = require("./routes/productRouter")

app.use(express.json());
app.use('/api/v1', userRouter)
app.use('/api/v1', productRouter)



app.listen(PORT, () => {
  console.log(`server is listening to port: ${PORT}`);

})