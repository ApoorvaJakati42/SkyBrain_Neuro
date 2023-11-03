const http = require('http');
const cors = require('cors');

const server = http.createServer((req, res) => {
  const corsOptions = {
    origin: '*', // Allow requests from any origin
    methods: 'GET', // Allow only GET requests (adjust as needed)
  };

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
  });

  // Function to send data to the client
  function sendEventData() {
    // Customize the data as needed
    const randomValue = Math.random(); // Example: Generate random data
    const data = { message: `Random value: ${randomValue}` };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  // Send data every second
  const intervalId = setInterval(sendEventData, 1000);

  // Close the connection when the client disconnects
  req.on('close', () => {
    clearInterval(intervalId);
    console.log('Client disconnected.');
  });
});

server.listen(3001, () => {
  console.log('SSE server is running on port 3001');
});
