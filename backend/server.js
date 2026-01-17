
require('dotenv').config({ path: __dirname +'/.env'});


const express = require('express');
const healthRoutes = require('./routes/health.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const protectedRoutes = require('./routes/protected.routes.js');
const productRoutes = require('./routes/product.routes.js');
const  prescriptionRoutes = require('./routes/prescription.routes.js');
const cartRoutes = require('./routes/cart.routes.js');
const orderRoutes = require('./routes/order.routes.js');


const app = express();
const PORT = process.env.PORT;
if(!PORT){
    console.error("PORT is not defined in environment variables.Server will not start.");
    process.exit(1);
}
 
app.use(express.json());

app.use('/api/health', healthRoutes);

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes)
app.use('/api/products', productRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);



app.listen(PORT, () => {
    console.log(`Backend running on port ${ PORT}`); 
});