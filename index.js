const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const router = require('./routes/routes');

/* Body Parser */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* Routes */
app.use('/', router);

/* Server */
app.listen(8080, () => {
  console.log('Server Started');
});
