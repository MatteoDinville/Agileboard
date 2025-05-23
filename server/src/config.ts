import dotenv from 'dotenv'

dotenv.config()

const EXPIRES_IN_SECONDS = Number(process.env.JWT_EXPIRES_IN_SECONDS) || 86400

export default {
	port: Number(process.env.PORT) || 4000,
	jwt: {
		secret: process.env.JWT_SECRET!,
		expiresIn: EXPIRES_IN_SECONDS,
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: EXPIRES_IN_SECONDS * 1000
		},
	},
}
