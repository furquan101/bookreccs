import express from 'express';
import cors from 'cors';
import { updateTrendingBooks, getTrendingBooks } from './scrapers';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/trending-books', async (req, res) => {
    const books = await getTrendingBooks();
    res.json(books);
});

app.post('/api/refresh-trending', async (req, res) => {
    try {
        const books = await updateTrendingBooks();
        res.json({ success: true, count: books.length, books });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to refresh trending books' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
