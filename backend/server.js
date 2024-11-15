const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error(err));

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/carts', cartRoutes);

app.listen(process.env.BACKEND_PORT, () => {
    console.log(`Server is running on ${process.env.BACKEND_URL}`);
});

// BE INCREDIBLY CAREFUL WITH THIS
// async function clearDatabase() {
//   await mongoose.connect(process.env.DATABASE_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });

// Drop the database
//   await mongoose.connection.db.dropDatabase();

//   console.log("Database cleared!");
//   await mongoose.disconnect();
// }
