import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes)

app.get('/api/home', (req, res) => {
	try {
		res.json({ message: 'Bienvenue sur la page d\'accueil' });
	} catch (error) {
		console.error('Home page error:', error);
		res.status(500).json({ message: 'Une erreur est survenue' });
	}
});

app.listen(port, () => {
	console.log(`🚀 Server is running on http://localhost:${port}`);
});
