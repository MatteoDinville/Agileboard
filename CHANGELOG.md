# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/).

## v1.2.0 (2025-08-22)

### ✨ Features (Pull Requests)

- **🌙 Dark Mode & Theme Switcher** – Implémentation du thème sombre et ajout du basculement entre les modes clair/sombre ([#23](https://github.com/MatteoDinville/Agileboard/pull/23)) `
c0c143b`

### ➕ Added

- Dark mode across the entire application
- Theme switcher allowing users to toggle between light and dark modes

### 🔄 Changed

- Updated UI components for better contrast and readability in dark mode
- Improved overall user experience with theme adaptability

---

## v1.1.0 (2025-08-22)

### 🚀 Features (Pull Requests)

- **📨 Invitation System** – Proof of Concept d’invitation de membres avec notifications ([#15](https://github.com/MatteoDinville/Agileboard/pull/15)) `5e04539`

### 🐛 Fixes (Pull Requests)

- **🐳 Dockerfile Fix** – Correction du Dockerfile pour l’exécution en production ([#17](https://github.com/MatteoDinville/Agileboard/pull/17)) `9e5d0e1`
- **⚙️ ESM Compatibility** – Résolution de l’erreur _ES module_ en production ([#18](https://github.com/MatteoDinville/Agileboard/pull/18)) `29b759b`
- **📂 Import Paths** – Correction des extensions d’import pour démarrer le serveur en production ([#19](https://github.com/MatteoDinville/Agileboard/pull/19)) `b9c9e7e`
- **🌐 API Calls** – Correction des appels API pour fonctionner correctement en production ([#20](https://github.com/MatteoDinville/Agileboard/pull/20)) `5cc9a10`

### ➕ Added

- Proof of concept for inviting project members with real-time notifications

### 🔄 Changed

- Fixed Dockerfile configuration for production builds
- Resolved ES module errors when running Node.js in production
- Corrected server import extensions for startup reliability
- Fixed API call URLs for production environment

---

## v1.0.0 (2025-08-21)

### 🚀 Features (Pull Requests)

- **🔐 Authentication System** - Système d'authentification complet ([#1](https://github.com/MatteoDinville/Agileboard/pull/1)) `2483185`
- **📋 Project Management** - Fonctionnalités de gestion de projets ([#2](https://github.com/MatteoDinville/Agileboard/pull/2)) `5a96bb1`
- **🎨 UI Refactoring** - Refonte et corrections de l'interface ([#3](https://github.com/MatteoDinville/Agileboard/pull/3)) `50664f0`
- **👤 Account Creation & Sign-In** - Création de compte et connexion ([#5](https://github.com/MatteoDinville/Agileboard/pull/5)) `36cdbe2`
- **🏗️ Project Implementation** - Implémentation des projets dans l'application ([#6](https://github.com/MatteoDinville/Agileboard/pull/6)) `c43e293`
- **↩️ Revert Project Implementation** - Annulation temporaire de l'implémentation ([#7](https://github.com/MatteoDinville/Agileboard/pull/7)) `bb71fa6`
- **🏗️ Project Implementation (Final)** - Implémentation finale des projets ([#8](https://github.com/MatteoDinville/Agileboard/pull/8)) `f68d9d3`
- **🔧 Branch Fix** - Correction après erreur de revert ([#9](https://github.com/MatteoDinville/Agileboard/pull/9)) `8acbeec`
- **📊 Kanban View** - Ajout de la vue kanban dans les projets ([#10](https://github.com/MatteoDinville/Agileboard/pull/10)) `9a21a9a`
- **⚙️ Account Settings** - Possibilité de modifier le compte dans les paramètres ([#11](https://github.com/MatteoDinville/Agileboard/pull/11)) `ac0d8d9`
- **🐛 Kanban Task Fixes** - Corrections des tâches dans la vue kanban ([#12](https://github.com/MatteoDinville/Agileboard/pull/12)) `034eb6c`
- **👁️ View Management** - Gestion des vues kanban et backlog ([#13](https://github.com/MatteoDinville/Agileboard/pull/13)) `94fb1d3`
- **🧪 Unit Testing** - Tests unitaires pour l'application ([#14](https://github.com/MatteoDinville/Agileboard/pull/14)) `6708ff3`

### ➕ Added

- Complete authentication system with user registration and login
- Project management functionality with CRUD operations
- Kanban board view for project task visualization
- Backlog view for task management
- Account settings page with user profile modification
- Unit testing framework and test coverage
- User interface components for project and task management
- Account creation workflow with validation
- Task creation and management within projects
- Project member management system

### 🔄 Changed

- Complete UI refactoring with improved design and user experience
- Enhanced project implementation with better structure
- Improved kanban view with better task handling and drag-and-drop functionality
- Refactored authentication flow for better security
- Updated task management system in kanban view
- Enhanced view management between kanban and backlog modes
- Improved error handling and user feedback
- Better responsive design across different screen sizes
- Optimized application performance and loading times

---
