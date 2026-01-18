import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    // Replace with your MongoDB URI (best to use process.env.MONGO_URI)
    const conn = await mongoose.connect(`${process.env.MONGODB_URL}`)

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`)
    process.exit(1) // Stop the app if connection fails
  }
}

export default connectDB
