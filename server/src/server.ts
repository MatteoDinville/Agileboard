import 'express-async-errors'

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import routes from './routes'
import config from './config'

const app = express()

const FRONT_URL = process.env.FRONT_URL ?? 'http://localhost:5173'
app.use(cors({
	origin: FRONT_URL,
	credentials: true,
}))
app.options('*', cors())

app.use(express.json())
app.use(cookieParser())

app.use('/api', routes)

app.use((
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction
) => {
	const status = err.status ?? err.statusCode ?? 500
	const message = err.expose === false
		? 'Internal Server Error'
		: err.message

	console.error(err)
	return res.status(status).json({ message })
})

app.listen(config.port, () =>
	console.log(`🚀 Server running on http://localhost:${config.port}`)
)
