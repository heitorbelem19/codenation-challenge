import express from 'express';

const app = express();

app.get('/', (request, response) => {
  return response.json({ message: 'Ola Mundo' });
});

app.listen(3333, () => {
  console.log('Server up and listening on port 3333');
});
