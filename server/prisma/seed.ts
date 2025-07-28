// prisma/seed.ts ------------------------------------------------------------
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/** -------------------- CONFIG -------------------- */
const PASSWORD_PLAINTEXT = 'password123'
const BCRYPT_ROUNDS = 10

const usersSeed = [
	{ email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: Role.ADMIN },
	{ email: 'po@example.com', firstName: 'Product', lastName: 'Owner', role: Role.PRODUCT_OWNER },
	{ email: 'scrum@example.com', firstName: 'Scrum', lastName: 'Master', role: Role.SCRUM_MASTER },
	{ email: 'dev@example.com', firstName: 'Dev', lastName: 'User', role: Role.DEVELOPER },
	{ email: 'user@example.com', firstName: 'Basic', lastName: 'User', role: Role.USER },
] as const

const projectsSeed = [
	{
		key: 'AGB',
		name: 'AgileBoard',
		description: 'Plateforme de gestion de projet agile (démo).',
		members: [
			{ email: 'po@example.com', role: Role.PRODUCT_OWNER },
			{ email: 'scrum@example.com', role: Role.SCRUM_MASTER },
			{ email: 'dev@example.com', role: Role.DEVELOPER },
		],
	},
	{
		key: 'WEB',
		name: 'Website Redesign',
		description: 'Refonte complète du site vitrine.',
		members: [
			{ email: 'admin@example.com', role: Role.SCRUM_MASTER },
			{ email: 'dev@example.com', role: Role.DEVELOPER },
			{ email: 'user@example.com', role: Role.USER },
		],
	},
] as const
/** ------------------------------------------------ */

async function seedUsers() {
	console.info('⏳ Seeding users…')

	for (const u of usersSeed) {
		await prisma.user.upsert({
			where: { email: u.email },
			update: { firstName: u.firstName, lastName: u.lastName, role: u.role },
			create: {
				...u,
				password: await bcrypt.hash(PASSWORD_PLAINTEXT, BCRYPT_ROUNDS),
			},
		})
	}

	console.info(`✅ Users ready (${usersSeed.length})`)
}

async function seedProjectsWithMembers() {
	console.info('⏳ Seeding projects & members…')

	// On récupère les users pour leurs IDs
	const allUsers = await prisma.user.findMany({
		where: { email: { in: usersSeed.map((u) => u.email) } },
		select: { id: true, email: true },
	})
	const userByEmail = Object.fromEntries(allUsers.map((u) => [u.email, u.id]))

	for (const p of projectsSeed) {
		// 1. upsert du projet (sans membres pour l’instant)
		const project = await prisma.project.upsert({
			where: { key: p.key },
			update: { name: p.name, description: p.description },
			create: { key: p.key, name: p.name, description: p.description },
		})

		// 2. upsert des ProjectMember
		for (const m of p.members) {
			const userId = userByEmail[m.email]
			if (!userId) continue // l’utilisateur n’existe pas => skip

			await prisma.projectMember.upsert({
				where: {
					userId_projectId: {
						userId,
						projectId: project.id,
					},
				},
				update: { role: m.role },      // change le rôle si besoin
				create: {
					userId,
					projectId: project.id,
					role: m.role,
				},
			})
		}
	}

	console.info(`✅ Projects ready (${projectsSeed.length})`)
}

async function main() {
	try {
		await seedUsers()
		await seedProjectsWithMembers()
	} catch (err) {
		console.error('❌ Seeding failed :', err)
	} finally {
		await prisma.$disconnect()
	}
}

main()
