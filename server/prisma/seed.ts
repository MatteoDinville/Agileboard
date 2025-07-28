import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const firstNames = [
	'Antoine', 'Marie', 'Pierre', 'Sophie', 'Lucas', 'Emma', 'Thomas', 'Camille',
	'Nicolas', 'Julie', 'Alexandre', 'Sarah', 'Maxime', 'Laura', 'Benjamin',
	'Léa', 'Julien', 'Manon', 'Romain', 'Clara'
];

const lastNames = [
	'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand',
	'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy',
	'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard'
];

function getRandomElement<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

function generateEmail(firstName: string, lastName: string): string {
	const emailUser = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`
	return emailUser
}

async function main() {
	console.log('🌱 Début du seeding...');

	console.log('🧹 Nettoyage de la base de données...');
	await prisma.user.deleteMany({});

	console.log('👥 Création de 20 utilisateurs...');

	const hashedPassword = await bcrypt.hash('password123', 10);

	for (let i = 1; i <= 20; i++) {
		const firstName = getRandomElement(firstNames);
		const lastName = getRandomElement(lastNames);
		const email = generateEmail(firstName, lastName);

		const user = await prisma.user.create({
			data: {
				email: email,
				password: hashedPassword,
				name: `${firstName} ${lastName}`,
				createdAt: new Date(Date.now()),
				updatedAt: new Date(Date.now())
			},
		});

		console.log(user)
		if (i % 20 === 0) {
			console.log(`✅ ${i} utilisateurs créés`);
		}
	}
	console.log('\n🎉 Seeding terminé avec succès !');
}

main()
	.catch((e) => {
		console.error('❌ Erreur lors du seeding:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
