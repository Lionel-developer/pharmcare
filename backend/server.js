
require('dotenv').config({ path: __dirname +'/.env'});


const express = require('express');
const healthRoutes = require('./routes/health.routes.js');
const authRoutes = require('./routes/auth.routes.js');

const app = express();
const PORT = process.env.PORT;
if(!PORT){
    console.error("PORT is not defined in environment variables.Server will not start.");
    process.exit(1);
}

app.use(express.json());

app.use('/api/health', healthRoutes);

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Backend running on port ${ PORT}`); 
});