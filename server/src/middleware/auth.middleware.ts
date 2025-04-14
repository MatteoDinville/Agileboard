import { Request, Response, NextFunction } from 'express'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const checkToken = req.cookies.token
	if (!checkToken) { return res.status(401).json({ error: 'Unauthorized' }) }
	next()
}
