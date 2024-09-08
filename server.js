const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const app = express();
const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/urlshortener', { useNewUrlParser: true, useUnifiedTopology: true });

// URL Schema
const urlSchema = new mongoose.Schema({
    longUrl: String,
    shortUrl: String,
    code: String
});

const Url = mongoose.model('Url', urlSchema);

// Route to create short URL
app.post('/shorten', async (req, res) => {
    const { longUrl } = req.body;
    const code = shortid.generate();
    const shortUrl = `${req.protocol}://${req.get('host')}/${code}`;

    const url = new Url({ longUrl, shortUrl, code });
    await url.save();

    res.json({ shortUrl });
});

// Route to redirect to the long URL
app.get('/:code', async (req, res) => {
    const { code } = req.params;
    const url = await Url.findOne({ code });

    if (url) {
        return res.redirect(url.longUrl);
    } else {
        return res.status(404).json({ error: 'URL not found' });
    }
});

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));
