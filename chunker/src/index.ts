import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
const port = 8000;

app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, '../temp/chunks')));


// app.use('/api/uploadthing', uploadthingRouter);

// Route to handle dynamic requests
app.get('*', (req, res) => {
  console.log('Request received:', req.url);

  const filePath = path.join(__dirname, '../temp/chunks', req.url);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log('File not found, sending 404 page');
        fs.readFile(path.join(__dirname, '404.html'), (error, notFoundContent) => {
          if (error) {
            res.status(500).send('Internal Server Error');
          } else {
            res.status(404).send(notFoundContent.toString());
          }
        });
      } else {
        console.error('Error occurred:', err);
        res.status(500).send('Internal Server Error');
      }
    } else {
      res.set('Access-Control-Allow-Origin', '*'); 
      res.status(200).send(content.toString());
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});
