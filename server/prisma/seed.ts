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

const projectTitles = [
	'Application E-commerce', 'Système de Gestion RH', 'Plateforme de Formation',
	'Application Mobile Fitness', 'Dashboard Analytics', 'Système de Réservation',
	'Plateforme de Streaming', 'Application de Livraison', 'Système de Facturation',
	'Application de Chat', 'Plateforme de Crowdfunding', 'Système de Gestion Stock',
	'Application de Voyage', 'Plateforme de Freelance', 'Système de CRM',
	'Application de Santé', 'Plateforme de Gaming', 'Système de Monitoring',
	'Application de Finance', 'Plateforme de Collaboration', 'Système de Sécurité',
	'Application de Transport', 'Plateforme de Marketplace', 'Système de Support',
	'Application de Médias', 'Plateforme de Formation', 'Système de Gestion Projet',
	'Application de Social', 'Plateforme de Trading', 'Système de Gestion Client',
	'Application de Design', 'Plateforme de Musique', 'Système de Gestion Événement',
	'Application de Sport', 'Plateforme de Recrutement', 'Système de Gestion Document',
	'Application de Cuisine', 'Plateforme de Location', 'Système de Gestion Inventaire',
	'Application de Mode', 'Plateforme de Donation', 'Système de Gestion Budget'
];

const projectDescriptions = [
	'Développement d\'une plateforme e-commerce complète avec gestion des produits, panier et paiements',
	'Système de gestion des ressources humaines avec suivi des employés et congés',
	'Plateforme de formation en ligne avec cours interactifs et suivi des progrès',
	'Application mobile de fitness avec programmes d\'entraînement personnalisés',
	'Dashboard analytique pour visualiser les données métier en temps réel',
	'Système de réservation pour hôtels, restaurants et services',
	'Plateforme de streaming vidéo avec gestion des contenus',
	'Application de livraison avec suivi en temps réel',
	'Système de facturation automatisé pour entreprises',
	'Application de chat en temps réel avec messagerie privée et groupes',
	'Plateforme de crowdfunding pour projets créatifs',
	'Système de gestion de stock avec alertes automatiques',
	'Application de voyage avec réservation et planification',
	'Plateforme de freelance pour connecter talents et clients',
	'Système de CRM pour gestion de la relation client',
	'Application de santé avec suivi médical et rendez-vous',
	'Plateforme de gaming avec tournois et classements',
	'Système de monitoring pour infrastructure IT',
	'Application de finance personnelle avec budgets et investissements',
	'Plateforme de collaboration pour équipes distribuées',
	'Système de sécurité avec authentification multi-facteurs',
	'Application de transport avec covoiturage et VTC',
	'Marketplace pour vente et achat de produits d\'occasion',
	'Système de support client avec tickets et chat',
	'Application de médias avec création et partage de contenu',
	'Plateforme de formation professionnelle avec certifications',
	'Système de gestion de projet avec Kanban et Gantt',
	'Application de réseau social avec partage de moments',
	'Plateforme de trading avec graphiques et analyses',
	'Système de gestion client avec historique et notes',
	'Application de design avec outils créatifs',
	'Plateforme de musique avec streaming et playlists',
	'Système de gestion d\'événements avec billetterie',
	'Application de sport avec statistiques et défis',
	'Plateforme de recrutement avec matching candidat-entreprise',
	'Système de gestion documentaire avec versioning',
	'Application de cuisine avec recettes et planification',
	'Plateforme de location de biens entre particuliers',
	'Système de gestion d\'inventaire avec codes-barres',
	'Application de mode avec tendances et shopping',
	'Plateforme de donation pour associations caritatives',
	'Système de gestion de budget personnel et familial'
];

const taskTitles = [
	'Analyse des besoins utilisateur', 'Création des maquettes UI/UX', 'Développement frontend',
	'Développement backend', 'Configuration de la base de données', 'Tests unitaires',
	'Tests d\'intégration', 'Tests de performance', 'Déploiement en production',
	'Documentation technique', 'Formation des utilisateurs', 'Optimisation des performances',
	'Sécurisation de l\'application', 'Mise en place du monitoring', 'Gestion des erreurs',
	'Interface d\'administration', 'API REST/GraphQL', 'Authentification et autorisation',
	'Gestion des fichiers', 'Notifications en temps réel', 'Système de recherche',
	'Export de données', 'Import de données', 'Génération de rapports',
	'Dashboard analytique', 'Système de backup', 'Intégration de paiement',
	'Gestion des emails', 'Système de commentaires', 'Gestion des rôles',
	'Historique des actions', 'Système de tags', 'Filtres avancés',
	'Tri et pagination', 'Export PDF', 'Génération de QR codes',
	'Système de géolocalisation', 'Push notifications', 'Mode hors ligne',
	'Synchronisation des données', 'Gestion des versions', 'Système de templates'
];

const taskDescriptions = [
	'Conduire des entretiens avec les utilisateurs pour identifier leurs besoins',
	'Créer les maquettes et prototypes pour l\'interface utilisateur',
	'Développer l\'interface utilisateur avec React/Vue/Angular',
	'Développer l\'API backend avec Node.js/Python/Java',
	'Concevoir et implémenter le schéma de base de données',
	'Écrire les tests unitaires pour chaque fonctionnalité',
	'Effectuer les tests d\'intégration entre les composants',
	'Réaliser les tests de charge et de performance',
	'Configurer et déployer l\'application sur les serveurs de production',
	'Rédiger la documentation technique et utilisateur',
	'Former les utilisateurs finaux à l\'utilisation du système',
	'Optimiser les requêtes et améliorer les temps de réponse',
	'Implémenter les mesures de sécurité (HTTPS, validation, etc.)',
	'Configurer les outils de monitoring et d\'alerting',
	'Implémenter la gestion centralisée des erreurs',
	'Développer l\'interface d\'administration pour les gestionnaires',
	'Créer l\'API REST ou GraphQL pour les échanges de données',
	'Implémenter l\'authentification et la gestion des autorisations',
	'Développer le système de gestion et stockage des fichiers',
	'Implémenter les notifications push et emails en temps réel',
	'Développer le moteur de recherche avec filtres avancés',
	'Créer les fonctionnalités d\'export de données (CSV, Excel)',
	'Implémenter l\'import de données depuis des fichiers externes',
	'Développer le système de génération de rapports automatisés',
	'Créer les tableaux de bord avec graphiques et métriques',
	'Configurer le système de sauvegarde automatique des données',
	'Intégrer les passerelles de paiement (Stripe, PayPal)',
	'Configurer l\'envoi automatique d\'emails transactionnels',
	'Implémenter le système de commentaires et avis',
	'Développer la gestion des rôles et permissions utilisateurs',
	'Créer l\'historique détaillé des actions utilisateurs',
	'Implémenter le système de tags et catégorisation',
	'Développer les filtres avancés pour la recherche',
	'Implémenter le tri et la pagination des résultats',
	'Créer les fonctionnalités d\'export en format PDF',
	'Implémenter la génération de QR codes pour les éléments',
	'Intégrer la géolocalisation pour les fonctionnalités mobiles',
	'Configurer les notifications push pour les applications mobiles',
	'Développer le mode hors ligne avec synchronisation',
	'Implémenter la synchronisation des données entre appareils',
	'Créer le système de gestion des versions des documents',
	'Développer un système de templates personnalisables'
];

const statuses = ['À faire', 'En cours', 'Terminé'];
const priorities = ['Basse', 'Moyenne', 'Haute', 'Urgente'];
const projectStatuses = ['En attente', 'En cours', 'Terminé', 'En pause'];
const projectPriorities = ['Basse', 'Moyenne', 'Haute', 'Urgente'];

function getRandomElement<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

function generateEmail(firstName: string, lastName: string, index: number): string {
	const emailUser = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@gmail.com`
	return emailUser
}

function getRandomDate(start: Date, end: Date): Date {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
	console.log('🌱 Début du seeding...');

	console.log('🧹 Nettoyage de la base de données...');
	await prisma.task.deleteMany({});
	await prisma.projectMember.deleteMany({});
	await prisma.project.deleteMany({});
	await prisma.user.deleteMany({});

	console.log('👥 Création de 30 utilisateurs...');

	const hashedPassword = await bcrypt.hash('password123', 10);
	const users: any[] = [];

	for (let i = 1; i <= 30; i++) {
		const firstName = getRandomElement(firstNames);
		const lastName = getRandomElement(lastNames);
		const email = generateEmail(firstName, lastName, i);

		const user = await prisma.user.create({
			data: {
				email: email,
				password: hashedPassword,
				name: `${firstName} ${lastName}`,
				createdAt: new Date(Date.now()),
				updatedAt: new Date()
			},
		});

		users.push(user);
		console.log(`✅ Utilisateur créé: ${user.name} (${user.email})`);
	}

	console.log('\n🏗️ Création de 35 projets...');

	const projects: any[] = [];
	for (let i = 0; i < 35; i++) {
		const title = getRandomElement(projectTitles);
		const description = getRandomElement(projectDescriptions);
		const status = getRandomElement(projectStatuses);
		const priority = getRandomElement(projectPriorities);
		const owner = getRandomElement(users);

		const project = await prisma.project.create({
			data: {
				title: `${title} #${i + 1}`,
				description: description,
				status: status,
				priority: priority,
				ownerId: owner.id,
				createdAt: getRandomDate(new Date('2024-01-01'), new Date()),
				updatedAt: new Date()
			},
		});

		projects.push(project);
		console.log(`✅ Projet créé: ${project.title} (Propriétaire: ${owner.name})`);
	}

	console.log('\n👥 Ajout de membres aux projets...');

	for (const project of projects) {
		// Ajouter 2-5 membres par projet (en plus du propriétaire)
		const numMembers = Math.floor(Math.random() * 4) + 2;
		const availableUsers = users.filter(user => user.id !== project.ownerId);
		const selectedUsers = availableUsers.sort(() => 0.5 - Math.random()).slice(0, numMembers);

		for (const user of selectedUsers) {
			await prisma.projectMember.create({
				data: {
					userId: user.id,
					projectId: project.id,
					addedAt: getRandomDate(project.createdAt, new Date())
				},
			});

	console.log('\n📋 Création de tâches pour chaque projet...');

	for (const project of projects) {
		// Créer 5-15 tâches par projet
		const numTasks = Math.floor(Math.random() * 11) + 5;
		const projectUsers = await prisma.projectMember.findMany({
			where: { projectId: project.id },
			include: { user: true }
		});
		const allProjectUsers = [project.ownerId, ...projectUsers.map(pm => pm.userId)];

		for (let i = 0; i < numTasks; i++) {
			const title = getRandomElement(taskTitles);
			const description = getRandomElement(taskDescriptions);
			const status = getRandomElement(statuses);
			const priority = getRandomElement(priorities);
			const assignedToId = Math.random() > 0.3 ? getRandomElement(allProjectUsers) : null;
			const dueDate = Math.random() > 0.5 ? getRandomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) : null;

			await prisma.task.create({
				data: {
					title: `${title} #${i + 1}`,
					description: description,
					status: status,
					priority: priority,
					dueDate: dueDate,
					projectId: project.id,
					assignedToId: assignedToId,
					createdAt: getRandomDate(project.createdAt, new Date()),
					updatedAt: new Date()
				},
			});
		}

		console.log(`✅ ${numTasks} tâches créées pour le projet: ${project.title}`);
	}

	console.log('\n🎉 Seeding terminé avec succès !');
	console.log(`📊 Résumé:`);
	console.log(`   - ${users.length} utilisateurs créés`);
	console.log(`   - ${projects.length} projets créés`);

	const totalMembers = await prisma.projectMember.count();
	console.log(`   - ${totalMembers} membres ajoutés aux projets`);

	const totalTasks = await prisma.task.count();
	console.log(`   - ${totalTasks} tâches créées`);
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
