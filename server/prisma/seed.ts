import { PrismaClient, TaskStatus, TaskPriority } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	console.log("🌱 Début du seeding de développement...");

	console.log("🧹 Nettoyage de la base de données...");
	await prisma.task.deleteMany({});
	await prisma.projectMember.deleteMany({});
	await prisma.project.deleteMany({});
	await prisma.user.deleteMany({});

	console.log("👨‍💻 Création du compte développeur...");
	const devPassword = await bcrypt.hash("passworddev", 10);
	const devUser = await prisma.user.create({
		data: {
			email: "dev@agileboard.fr",
			password: devPassword,
			name: "Développeur AgileBoard",
			createdAt: new Date(),
			updatedAt: new Date()
		}
	});
	console.log(`✅ Compte développeur créé: ${devUser.email}`);

	console.log("👥 Création d'utilisateurs de test...");
	const testUsers: any[] = [];
	const userData = [
		{ email: "alice@test.fr", name: "Alice Martin", password: "test123" },
		{ email: "bob@test.fr", name: "Bob Dupont", password: "test123" },
		{ email: "charlie@test.fr", name: "Charlie Leroy", password: "test123" },
		{ email: "diana@test.fr", name: "Diana Moreau", password: "test123" },
		{ email: "emma@test.fr", name: "Emma Bernard", password: "test123" }
	];

	for (const userInfo of userData) {
		const hashedPassword = await bcrypt.hash(userInfo.password, 10);
		const user = await prisma.user.create({
			data: {
				email: userInfo.email,
				password: hashedPassword,
				name: userInfo.name,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		});
		testUsers.push(user);
		console.log(`✅ Utilisateur créé: ${user.name} (${user.email})`);
	}

	console.log("🏗️ Création de projets...");
	const projects: any[] = [];

	const devProjects = [
		{
			title: "Application E-commerce AgileBoard",
			description: "Développement d'une plateforme e-commerce moderne avec React et Node.js",
			status: "En cours",
			priority: "Haute"
		},
		{
			title: "Système de Gestion RH",
			description: "Application de gestion des ressources humaines avec suivi des employés",
			status: "En attente",
			priority: "Moyenne"
		},
		{
			title: "Dashboard Analytics",
			description: "Tableau de bord analytique pour visualiser les métriques métier",
			status: "Terminé",
			priority: "Basse"
		}
	];

	for (const projectData of devProjects) {
		const project = await prisma.project.create({
			data: {
				title: projectData.title,
				description: projectData.description,
				status: projectData.status,
				priority: projectData.priority,
				ownerId: devUser.id,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		});
		projects.push(project);
		console.log(`✅ Projet créé (propriétaire dev): ${project.title}`);
	}

	const testProjects = [
		{
			title: "Application Mobile Fitness",
			description: "App mobile pour le suivi des entraînements et nutrition",
			status: "En cours",
			priority: "Haute",
			owner: testUsers[0]
		},
		{
			title: "Plateforme de Formation",
			description: "Système de formation en ligne avec cours interactifs",
			status: "En attente",
			priority: "Moyenne",
			owner: testUsers[1]
		},
		{
			title: "Système de Réservation",
			description: "Application de réservation pour hôtels et restaurants",
			status: "Terminé",
			priority: "Basse",
			owner: testUsers[2]
		}
	];

	for (const projectData of testProjects) {
		const project = await prisma.project.create({
			data: {
				title: projectData.title,
				description: projectData.description,
				status: projectData.status,
				priority: projectData.priority,
				ownerId: projectData.owner.id,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		});
		projects.push(project);
		console.log(`✅ Projet créé (propriétaire ${projectData.owner.name}): ${project.title}`);
	}

	console.log("👥 Ajout de membres aux projets...");

	await prisma.projectMember.create({
		data: {
			userId: devUser.id,
			projectId: projects[3].id,
			addedAt: new Date()
		}
	});
	console.log(`✅ Dev ajouté comme membre du projet: ${projects[3].title}`);

	await prisma.projectMember.create({
		data: {
			userId: devUser.id,
			projectId: projects[4].id,
			addedAt: new Date()
		}
	});
	console.log(`✅ Dev ajouté comme membre du projet: ${projects[4].title}`);

	await prisma.projectMember.create({
		data: {
			userId: testUsers[0].id,
			projectId: projects[0].id,
			addedAt: new Date()
		}
	});
	console.log(`✅ ${testUsers[0].name} ajouté comme membre du projet: ${projects[0].title}`);

	await prisma.projectMember.create({
		data: {
			userId: testUsers[1].id,
			projectId: projects[0].id,
			addedAt: new Date()
		}
	});
	console.log(`✅ ${testUsers[1].name} ajouté comme membre du projet: ${projects[0].title}`);

	await prisma.projectMember.create({
		data: {
			userId: testUsers[2].id,
			projectId: projects[1].id,
			addedAt: new Date()
		}
	});
	console.log(`✅ ${testUsers[2].name} ajouté comme membre du projet: ${projects[1].title}`);

	console.log("📋 Création de tâches...");

	const taskTemplates = [
		{
			title: "Analyse des besoins utilisateur",
			description: "Conduire des entretiens avec les utilisateurs pour identifier leurs besoins",
			status: TaskStatus.A_FAIRE,
			priority: TaskPriority.HAUTE
		},
		{
			title: "Création des maquettes UI/UX",
			description: "Créer les maquettes et prototypes pour l'interface utilisateur",
			status: TaskStatus.EN_COURS,
			priority: TaskPriority.HAUTE
		},
		{
			title: "Développement frontend",
			description: "Développer l'interface utilisateur avec React",
			status: TaskStatus.EN_COURS,
			priority: TaskPriority.MOYENNE
		},
		{
			title: "Développement backend",
			description: "Développer l'API backend avec Node.js et Express",
			status: TaskStatus.A_FAIRE,
			priority: TaskPriority.MOYENNE
		},
		{
			title: "Configuration de la base de données",
			description: "Concevoir et implémenter le schéma de base de données",
			status: TaskStatus.TERMINE,
			priority: TaskPriority.BASSE
		},
		{
			title: "Tests unitaires",
			description: "Écrire les tests unitaires pour chaque fonctionnalité",
			status: TaskStatus.A_FAIRE,
			priority: TaskPriority.MOYENNE
		},
		{
			title: "Tests d'intégration",
			description: "Effectuer les tests d'intégration entre les composants",
			status: TaskStatus.A_FAIRE,
			priority: TaskPriority.BASSE
		},
		{
			title: "Déploiement en production",
			description: "Configurer et déployer l'application sur les serveurs de production",
			status: TaskStatus.A_FAIRE,
			priority: TaskPriority.URGENTE
		}
	];

	for (const project of projects) {
		const numTasks = Math.floor(Math.random() * 4) + 3;

		const projectMembers = await prisma.projectMember.findMany({
			where: { projectId: project.id },
			include: { user: true }
		});

		const projectOwner = await prisma.user.findUnique({
			where: { id: project.ownerId }
		});

		const eligibleUsers = [
			{ id: project.ownerId, name: projectOwner?.name || 'Propriétaire' },
			...projectMembers.map(pm => ({ id: pm.userId, name: pm.user.name }))
		];

		for (let i = 0; i < numTasks; i++) {
			const template = taskTemplates[i % taskTemplates.length];
			const assignedTo = Math.random() > 0.3 && eligibleUsers.length > 0
				? eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)]
				: null;
			const dueDate = new Date();
			dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 7);

			await prisma.task.create({
				data: {
					title: template.title,
					description: template.description,
					status: template.status,
					priority: template.priority,
					dueDate: dueDate,
					projectId: project.id,
					assignedToId: assignedTo?.id || null,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			});
		}
		console.log(`✅ ${numTasks} tâches créées pour le projet: ${project.title} (${eligibleUsers.length} membres éligibles)`);
	}

	console.log("\n🎉 Seeding de développement terminé avec succès !");
	console.log(`📊 Résumé:`);
	console.log(`   - 1 compte développeur: dev@agileboard.fr (mot de passe: passworddev)`);
	console.log(`   - ${testUsers.length} utilisateurs de test créés`);
	console.log(`   - ${projects.length} projets créés`);

	const totalMembers = await prisma.projectMember.count();
	console.log(`   - ${totalMembers} membres ajoutés aux projets`);

	const totalTasks = await prisma.task.count();
	console.log(`   - ${totalTasks} tâches créées`);

	console.log("\n🔑 Comptes de test:");
	console.log(`   - dev@agileboard.fr / passworddev (développeur)`);
	for (const user of testUsers) {
		console.log(`   - ${user.email} / test123`);
	}
}

main()
	.catch(e => {
		console.error("❌ Erreur lors du seeding:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
