import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function getPasswordHash() {
	const PASSWORD = 'password123';
	const ROUNDS = 10;
	return bcrypt.hash(PASSWORD, ROUNDS);
}

async function seedUsers() {
	const hashedPassword = await getPasswordHash();

	const usersData = [
		{
			email: 'admin@example.com',
			firstName: 'Admin',
			lastName: 'User',
			role: Role.ADMIN,
		},
		{
			email: 'po@example.com',
			firstName: 'Product',
			lastName: 'Owner',
			role: Role.PRODUCT_OWNER,
		},
		{
			email: 'scrum@example.com',
			firstName: 'Scrum',
			lastName: 'Master',
			role: Role.SCRUM_MASTER,
		},
		{
			email: 'dev@example.com',
			firstName: 'Dev',
			lastName: 'User',
			role: Role.DEVELOPER,
		},
		{
			email: 'user@example.com',
			firstName: 'Basic',
			lastName: 'User',
			role: Role.USER,
		},
	].map((u) => ({ ...u, password: hashedPassword }));

	await prisma.$transaction([
		prisma.user.deleteMany(),
		prisma.user.createMany({
			data: usersData,
			skipDuplicates: true,
		}),
	]);

	console.info(`✅ Seeded ${usersData.length} users`);
}

async function main() {
	try {
		await seedUsers();
	} catch (error) {
		console.error('❌ Seeding failed:', error);
	} finally {
		await prisma.$disconnect();
	}
}

main();
