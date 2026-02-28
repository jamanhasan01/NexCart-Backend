import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import userRoute from './routes/user.routes'
import productRoute from './routes/product.routes'
import categoryRoute from './routes/category.routes'
import cartRoute from './routes/cart.route'
import cookieParser from 'cookie-parser'

import connectDB from './config/connectDB'
import cors from 'cors'
import { errorMiddleware } from './middlewares/error.middleware'

dotenv.config()

const app = express()
/* =============================== CORS CONFIG ================================ */
/* =============================== CORS CONFIG ================================ */
const allowedOrigins = ['http://localhost:3000', 'https://zuniva-frontend.vercel.app']

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }),
)

/* ===============================
   Global Middleware
================================ */
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
/* ===============================
   Connect DB
================================ */
connectDB()

/* ===============================
   Test Route
================================ */
app.get('/', (_req, res) => {
  res.send('server running well')
})

/* =============================== All Route Global middle ware ================================ */
app.use('/api/auth', authRoutes)
app.use('/api', userRoute)
app.use('/api', productRoute)
app.use('/api', categoryRoute)
app.use('/api', cartRoute)

/* =============================== Global error middleware ================================ */
app.use(errorMiddleware)
/* ===============================
   Server Start
================================ */
app.listen(process.env.PORT, () => {
  console.log('server running on', process.env.PORT)
})
