if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require('cors');
const router = require('./routes');
const errorHandler = require('./middlewares/error_handler');

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ status: 'up', message: 'Deal Transaction Service' });
});

app.use('/deals', router);

app.use(errorHandler.generate);

app.listen(PORT, () => console.log('Deal Transaction Service Running'));