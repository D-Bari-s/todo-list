-- Base de données 
CREATE DATABASE todo_list;

-- Utiliser la base de données créée :
USE todo_list;
-- Table users 
CREATE TABLE users (
    id_user INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Table tasks
CREATE TABLE tasks(
    id_task INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(50) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    priority VARCHAR(20),
    user_id INT NOT NULL,
    state VARCHAR(20) DEFAULT 'en cours',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id_user)
    ON DELETE CASCADE,
    CHECK (priority IN ('basse','moyenne','haute')),
    CHECK (state IN ('en cours','terminée'))
);

-- Création du jeu de données
INSERT INTO users (username, email, password) VALUES
-- 123
('alice', 'alice@mail.com', '$2y$10$9gMVH6KlHJRn73CN4BzTs.O45GREZg7sW3KfyekwC.8K7n08UopZG'),
-- 456
('bob', 'bob@mail.com', '$2y$10$0yTz/IrPnXTDSlfntTmZ5ORoU5vgy2aCNYkfImOm.XggUULeA9sXm'),
-- 789
('charlie', 'charlie@mail.com', '$2y$10$5u61tciuvFNoL/4nsL9/geWQfocKr16JD0Jtxs7xrRNeXvgBRk5rW');

INSERT INTO tasks (title, description, target_date, priority, user_id, state) VALUES
-- Alice (user_id = 1)
('Refonte UI', 'Revoir l\'interface principale', '2025-06-01', 'haute', 1, 'en cours'),
('Corriger bug login', 'Le formulaire ne valide pas les emails', '2025-05-20', 'haute', 1, 'terminée'),
('Rédiger documentation', 'Documenter l\'API REST', '2025-06-15', 'moyenne', 1, 'en cours'),
('Tests unitaires', 'Couvrir les fonctions critiques', '2025-05-28', 'haute', 1, 'en cours'),
('Mise à jour dépendances', 'Mettre à jour les packages npm', '2025-05-25', 'basse', 1, 'terminée'),
('Optimiser les requêtes', 'Réduire le temps de réponse BDD', '2025-06-10', 'moyenne', 1, 'en cours'),
('Déploiement staging', 'Déployer sur l\'environnement de test', '2025-05-30', 'haute', 1, 'en cours'),
('Revue de code', 'Relire les PR en attente', '2025-05-22', 'moyenne', 1, 'terminée'),
('Créer les maquettes', 'Figma pour la v2', '2025-06-20', 'basse', 1, 'en cours'),
('Réunion client', 'Préparer la présentation', '2025-05-21', 'haute', 1, 'terminée'),
('Audit sécurité', 'Vérifier les failles XSS et CSRF', '2025-06-05', 'haute', 1, 'en cours'),
('Optimiser images', 'Compresser les assets', '2025-06-08', 'basse', 1, 'en cours'),
('Rédiger changelog', 'Lister les changements v1.5', '2025-05-19', 'basse', 1, 'terminée'),
('Configurer CI/CD', 'Mettre en place GitHub Actions', '2025-06-12', 'moyenne', 1, 'en cours'),
('Former l\'équipe', 'Session sur les nouvelles pratiques', '2025-06-18', 'moyenne', 1, 'en cours'),
('Corriger bug formulaire', 'Champ téléphone international', '2025-05-18', 'haute', 1, 'terminée'),
('Analyser les logs', 'Identifier les erreurs 500', '2025-06-03', 'moyenne', 1, 'en cours'),
('Mettre à jour README', 'Instructions d\'installation', '2025-05-27', 'basse', 1, 'terminée'),
('Créer endpoint API', 'Route POST /tasks', '2025-06-07', 'haute', 1, 'en cours'),
('Nettoyer la BDD', 'Supprimer les entrées obsolètes', '2025-06-14', 'basse', 1, 'en cours'),
('Rédiger cahier des charges', 'Spécifications v2', '2025-06-22', 'moyenne', 1, 'en cours'),
('Configurer le cache', 'Mettre en place Redis', '2025-06-09', 'moyenne', 1, 'en cours'),
('Corriger bug pagination', 'Offset incorrect page 2', '2025-05-23', 'haute', 1, 'terminée'),
('Ajouter les logs', 'Logger les actions critiques', '2025-06-11', 'moyenne', 1, 'en cours'),
('Tester sur mobile', 'Vérifier le responsive', '2025-06-04', 'basse', 1, 'en cours'),
('Mettre à jour Figma', 'Synchroniser avec le dev', '2025-06-16', 'basse', 1, 'en cours'),
('Corriger CORS', 'Headers manquants sur l\'API', '2025-05-24', 'haute', 1, 'terminée'),
('Planifier la v2', 'Roadmap et priorités', '2025-06-25', 'moyenne', 1, 'en cours'),
('Archiver anciens projets', 'Déplacer sur S3', '2025-06-19', 'basse', 1, 'en cours'),
('Vérifier les backups', 'Tester la restauration BDD', '2025-06-06', 'haute', 1, 'en cours'),

-- Bob (user_id = 2)
('Créer landing page', 'Page d\'accueil produit', '2025-06-01', 'haute', 2, 'en cours'),
('Rédiger emails marketing', 'Campagne de lancement', '2025-05-20', 'moyenne', 2, 'terminée'),
('Analyser concurrents', 'Benchmark des fonctionnalités', '2025-06-15', 'moyenne', 2, 'en cours'),
('Mettre en place analytics', 'Google Analytics + events', '2025-05-28', 'haute', 2, 'en cours'),
('Rédiger blog post', 'Article sur la productivité', '2025-05-25', 'basse', 2, 'terminée'),
('Créer tutoriel vidéo', 'Onboarding utilisateur', '2025-06-10', 'moyenne', 2, 'en cours'),
('A/B test bouton CTA', 'Tester couleur et texte', '2025-05-30', 'haute', 2, 'en cours'),
('Mettre à jour FAQ', 'Ajouter les nouvelles questions', '2025-05-22', 'basse', 2, 'terminée'),
('Créer compte réseaux sociaux', 'Twitter, LinkedIn', '2025-06-20', 'basse', 2, 'en cours'),
('Préparer démo', 'Pour le meetup du 21', '2025-05-21', 'haute', 2, 'terminée'),
('Configurer Mailchimp', 'Listes et automatisations', '2025-06-05', 'moyenne', 2, 'en cours'),
('Optimiser SEO', 'Balises meta et sitemap', '2025-06-08', 'moyenne', 2, 'en cours'),
('Créer charte graphique', 'Couleurs, typos, logos', '2025-05-19', 'haute', 2, 'terminée'),
('Planifier webinaire', 'Invitations et supports', '2025-06-12', 'moyenne', 2, 'en cours'),
('Rédiger politique confidentialité', 'RGPD conforme', '2025-06-18', 'haute', 2, 'en cours'),
('Tester le tunnel de vente', 'Parcours complet', '2025-05-18', 'haute', 2, 'terminée'),
('Créer personas', 'Profils utilisateurs cibles', '2025-06-03', 'moyenne', 2, 'en cours'),
('Mettre à jour pricing', 'Nouveau plan Pro', '2025-05-27', 'haute', 2, 'terminée'),
('Créer page contact', 'Formulaire + carte', '2025-06-07', 'basse', 2, 'en cours'),
('Vérifier mentions légales', 'Conformité juridique', '2025-06-14', 'moyenne', 2, 'en cours'),
('Préparer pitch deck', 'Pour les investisseurs', '2025-06-22', 'haute', 2, 'en cours'),
('Configurer Intercom', 'Chat support en ligne', '2025-06-09', 'moyenne', 2, 'en cours'),
('Corriger liens cassés', 'Audit 404', '2025-05-23', 'basse', 2, 'terminée'),
('Ajouter témoignages', 'Page sociale proof', '2025-06-11', 'basse', 2, 'en cours'),
('Tester formulaire contact', 'Vérifier les emails reçus', '2025-06-04', 'moyenne', 2, 'en cours'),
('Créer kit presse', 'Logos et descriptions', '2025-06-16', 'basse', 2, 'en cours'),
('Mettre en place NPS', 'Enquête satisfaction', '2025-05-24', 'moyenne', 2, 'terminée'),
('Préparer rapport mensuel', 'KPIs et analyses', '2025-06-25', 'moyenne', 2, 'en cours'),
('Archiver campagnes', 'Sauvegarder les stats', '2025-06-19', 'basse', 2, 'en cours'),
('Relire contrats partenaires', 'Vérifier les clauses', '2025-06-06', 'haute', 2, 'en cours'),

-- Charlie (user_id = 3)
('Installer serveur', 'Configuration Ubuntu 24', '2025-06-01', 'haute', 3, 'terminée'),
('Configurer Nginx', 'Reverse proxy et SSL', '2025-05-20', 'haute', 3, 'terminée'),
('Mettre en place Docker', 'Conteneuriser l\'application', '2025-06-15', 'haute', 3, 'en cours'),
('Configurer pare-feu', 'Règles UFW', '2025-05-28', 'haute', 3, 'terminée'),
('Automatiser les backups', 'Script cron quotidien', '2025-05-25', 'moyenne', 3, 'terminée'),
('Monitorer les ressources', 'Grafana + Prometheus', '2025-06-10', 'moyenne', 3, 'en cours'),
('Mettre à jour le serveur', 'apt upgrade', '2025-05-30', 'basse', 3, 'terminée'),
('Configurer SSH', 'Clés et désactivation mot de passe', '2025-05-22', 'haute', 3, 'terminée'),
('Créer environnement dev', 'Docker Compose local', '2025-06-20', 'moyenne', 3, 'en cours'),
('Tester la restauration', 'Simuler une panne', '2025-05-21', 'haute', 3, 'terminée'),
('Configurer DNS', 'Enregistrements A et CNAME', '2025-06-05', 'haute', 3, 'en cours'),
('Mettre en place fail2ban', 'Protection bruteforce', '2025-06-08', 'haute', 3, 'en cours'),
('Rédiger runbook', 'Procédures d\'urgence', '2025-05-19', 'moyenne', 3, 'terminée'),
('Configurer Redis', 'Cache sessions', '2025-06-12', 'moyenne', 3, 'en cours'),
('Auditer les accès', 'Vérifier les users sudo', '2025-06-18', 'haute', 3, 'en cours'),
('Migrer la BDD', 'Vers le nouveau serveur', '2025-05-18', 'haute', 3, 'terminée'),
('Configurer les alertes', 'Email si CPU > 80%', '2025-06-03', 'moyenne', 3, 'en cours'),
('Mettre en place CDN', 'Cloudflare', '2025-05-27', 'moyenne', 3, 'terminée'),
('Tester les endpoints', 'Charge avec k6', '2025-06-07', 'haute', 3, 'en cours'),
('Nettoyer les logs', 'Rotation et archivage', '2025-06-14', 'basse', 3, 'en cours'),
('Documenter l\'infra', 'Schéma réseau', '2025-06-22', 'moyenne', 3, 'en cours'),
('Configurer Let\'s Encrypt', 'Renouvellement auto SSL', '2025-06-09', 'haute', 3, 'terminée'),
('Vérifier les ports ouverts', 'nmap audit', '2025-05-23', 'haute', 3, 'terminée'),
('Mettre en place swap', 'Pour les pics de RAM', '2025-06-11', 'basse', 3, 'en cours'),
('Tester IPv6', 'Compatibilité réseau', '2025-06-04', 'basse', 3, 'en cours'),
('Configurer logrotate', 'Nginx et app logs', '2025-06-16', 'basse', 3, 'en cours'),
('Vérifier certificats SSL', 'Dates d\'expiration', '2025-05-24', 'haute', 3, 'terminée'),
('Planifier migration v2', 'Zéro downtime', '2025-06-25', 'haute', 3, 'en cours'),
('Archiver les anciennes VMs', 'Snapshot avant suppression', '2025-06-19', 'moyenne', 3, 'en cours'),
('Tester le failover', 'Basculement automatique', '2025-06-06', 'haute', 3, 'en cours');