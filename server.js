const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Import the http module for Socket.io
const socketIo = require('socket.io'); // Import Socket.io
const { Server } = require('https');
const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your frontend's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://apoorvajakati:Skybrain!12345@skybrain-mongoose.tknpzhk.mongodb.net/skybrain-mongoose', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

// Define a mongoose model for users (create a User schema)

const User = mongoose.model('User', {
  email: String,
  password: String, // Note: Password should be securely hashed and salted
});

// Define a POST route for signing up
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  // Create a new user
  const user = new User({ email, password });

  try {
    // Save the user to MongoDB
    await user.save();
    res.status(201).send('Signup successful');
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).send('Signup failed');
  }
});

// Create an HTTP server and attach Socket.io to it
const server = http.createServer(app);
const io = socketIo(server , {
    transports: ['websocket'],
  });

// Define a function to emit random values at regular intervals
function emitRandomValue() {
  setInterval(() => {
    const randomValue = Math.random(); 
    io.emit('randomValue', randomValue); 
  }, 1000); // Emit every 1 second (adjust as needed)
}

function emitRandomName() {
    setInterval(() => {
        const randomName = Math.random();
        io.emit('randomName' , ` Graph values + ${randomName}`)
    },1000)
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('message', (data) => {
    console.log('Received message from client:', data);

    // You can send a response or perform any necessary actions here
  });

  // Start emitting random values when a user connects
  emitRandomValue();

  emitRandomName();

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});