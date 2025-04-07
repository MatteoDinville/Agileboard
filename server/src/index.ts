import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes, { verifyToken } from './routes/auth';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

app.get('/api/home', verifyToken, (req, res) => {
	try {
		res.json({ message: 'Bienvenue sur la page d\'accueil' });
	} catch (error) {
		console.error('Home page error:', error);
		res.status(500).json({ message: 'Une erreur est survenue' });
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
