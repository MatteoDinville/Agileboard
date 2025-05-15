import { PrismaClient, User } from '@prisma/client'
import createHttpError from 'http-errors'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function register(
	email: string,
	password: string,
	firstName: string,
	lastName: string
): Promise<User> {
	const existing = await prisma.user.findUnique({ where: { email } })
	if (existing) throw createHttpError(409, 'Email déjà utilisé')
	const hash = await bcrypt.hash(password, 10)
	return prisma.user.create({
		data: { email, password: hash, firstName, lastName },
	})
}

export const login = async (email: string, password: string) => {

	const user = await prisma.user.findUnique({
		where: { email }
	})

	if (!user) {
		throw createHttpError(401, 'Aucun compte ne correspond à cet email')
	}

	const isPasswordValid = await bcrypt.compare(password, user.password)

	if (!isPasswordValid) {
		throw createHttpError(401, 'Mot de passe incorrect')
	}

	console.log(user);
	return user
}

export async function getById(id: string): Promise<User> {
	return prisma.user.findUniqueOrThrow({ where: { id } })
}

export async function updateProfile(
	id: string,
	data: { firstName: string; lastName: string; email: string }
): Promise<User> {
	return prisma.user.update({ where: { id }, data })
}
