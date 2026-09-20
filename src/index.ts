import express from 'express';
import supplierRouter  from './routes/supplier.route.js';
import hotelRouter from './routes/hotel.route.js'
import healthRouter from "./routes/health.routes.js";
import { errorMiddleware } from './middlewares/error.middleware.js';

const app=express()

app.use(express.json())
app.use('/',supplierRouter)
app.use('/api/hotels',hotelRouter)
app.use('/health',healthRouter)

app.use(errorMiddleware);
app.listen(8000,()=>{
    console.log('server is running on port 8000')
})