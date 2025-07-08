import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

let clients = [];

// SSE Endpoint untuk browser (client listen di sini)
app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);

  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  const { message } = req.body;

  console.log(`Received webhook: ${message}`);

  // Kirim notifikasi ke semua client SSE
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify({ message })}\n\n`);
  });

  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
