WAGERVERSE

WAGERVERSE est une plateforme moderne et full-stack de paris e-sportifs. Elle offre une expérience fluide aux utilisateurs pour parier sur leurs équipes favorites à travers différents tournois d’e-sport.
L’application propose des cotes en temps réel, une authentification sécurisée, un tableau de bord personnalisé et un panneau d’administration complet pour la gestion de la plateforme.

Fonctionnalités principales

Authentification utilisateur : Inscription et connexion sécurisées via Supabase Auth. Les nouveaux utilisateurs reçoivent un bonus de bienvenue pour commencer à parier.

Liste des matchs en direct : Parcourir les matchs d’e-sport à venir avec détails des équipes, jeux et cotes en temps réel.

Système de paris : Placer des paris sur des équipes avec un montant défini. Le système vérifie le solde de l’utilisateur avant validation.

Tableau de bord utilisateur : Espace personnalisé pour suivre le solde, les mises totales, les gains, le profit/perte et l’historique complet des paris.

Panneau administrateur : Tableau de bord protégé par rôle pour gérer les données principales (création et suppression d’équipes et de matchs).

Backend sécurisé et scalable : Basé sur Supabase et PostgreSQL, avec politiques de sécurité par lignes (RLS) garantissant que les données ne sont accessibles qu’aux utilisateurs autorisés.

Pile technologique

Frontend : React, Vite, TypeScript

Backend & Base de données : Supabase (PostgreSQL, Auth, Storage)

UI Framework : shadcn/ui

Styles : Tailwind CSS

Routing : React Router

Gestion d’état & requêtes : TanStack Query

Formulaires : React Hook Form avec validation Zod

Schéma de la base de données

La base est gérée via Supabase et son schéma est défini dans les fichiers de migration situés dans superbase/migrations/.

Tables principales :

games : titres de jeux e-sport.

teams : informations sur les équipes participantes.

matches : détails des matchs programmés ou terminés (scores inclus).

bets : enregistrements de tous les paris (montant, cote, statut).

profiles : extension de auth.users pour gérer solde et statistiques de paris.

user_roles : gestion des rôles (ex. admin, user) pour le contrôle d’accès.

Toutes les tables ont la Row Level Security (RLS) activée afin de garantir l’intégrité et la sécurité des données.
Exemple : un utilisateur ne peut voir que ses propres paris et son profil, tandis qu’un administrateur a des droits étendus pour la gestion.

Démarrage rapide
Prérequis

Node.js (v18 ou plus récent)

npm (ou un gestionnaire de paquets compatible)

Un compte Supabase

Installation et configuration

Cloner le dépôt :

git clone https://github.com/LoricWorms/WAGERVERSE.git
cd WAGERVERSE


Installer les dépendances :

npm install


Configurer votre projet Supabase :

Créez un nouveau projet sur Supabase
.

Dans le SQL Editor de Supabase, copiez le contenu du fichier
superbase/migrations/20251002134752_8cc0eaac-a255-4363-84fc-c56714f3175b.sql
puis exécutez-le pour mettre en place schéma, rôles et politiques de sécurité.

Définir les variables d’environnement :

Créez un fichier .env à la racine du projet.

Dans Supabase → Project Settings > API, copiez :

Project URL

Clé publique (anon key)

Ajoutez-les dans le fichier .env :

VITE_SUPABASE_URL=VOTRE_URL_SUPABASE
VITE_SUPABASE_PUBLISHABLE_KEY=VOTRE_CLE_ANON_SUPABASE


Lancer le serveur de développement :

npm run dev


L’application est accessible à l’adresse :
👉 http://localhost:8080
