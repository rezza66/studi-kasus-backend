import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import passport from 'passport';
import { connectDB } from './config/database.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import productRoute from './routes/productRoutes.js';
import tagRoute from './routes/tagRoutes.js';
import categoryRoute from './routes/categoryRoute.js';
import deliveryAddressRoute from './routes/deliveryAddressRoute.js';
import cartRoute from './routes/cartRoute.js';
import orderRoute from "./routes/orderRoute.js";
import invoiceRoute from "./routes/invoiceRoute.js";
import { errorHandler } from './middleware/errorHandler.js';
import configurePassport from './config/passport.js';

dotenv.config();

const app = express();
const port = process.env.PORT

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connectDB();

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

configurePassport();

app.use(passport.initialize());

app.use(authRoute);
app.use(userRoute);
app.use(productRoute);
app.use(tagRoute); 
app.use(categoryRoute); 
app.use(deliveryAddressRoute); 
app.use(cartRoute); 
app.use(orderRoute); 
app.use(invoiceRoute); 

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
});
