import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const login = async (email: string, password: string) => {

	const user = await prisma.user.findUnique({
		where: { email }
	})

	if (!user) {
		throw new Error('Authentication failed: No account found with this email address')
	}

	const isPasswordValid = await bcrypt.compare(password, user.password)

	if (!isPasswordValid) {
		throw new Error('Authentication failed: The password you entered is incorrect')
	}

	return {
		message: 'Authentication successful! Welcome back!',
		userId: user.id,
		firstName: user.firstName,
		lastName: user.lastName
	}
}

export const register = async (email: string, password: string, firstName: string, lastName: string) => {
	const hashedPassword = await bcrypt.hash(password, 10)

	const existingUser = await prisma.user.findUnique({
		where: { email }
	})

	if (existingUser) {
		throw new Error('User already exists')
	}
	const user = await prisma.user.create({
		data: {
			email,
			password: hashedPassword,
			firstName,
			lastName
		},
	})
	return { message: 'User created', userId: user.id }
}
