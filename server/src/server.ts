import 'express-async-errors'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes';
import config from './config';

dotenv.config();

const app = express();
const port = config.port;

app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes)

app.listen(port, () => {
	console.log(`🚀 Server is running on http://localhost:${port}`);
});
