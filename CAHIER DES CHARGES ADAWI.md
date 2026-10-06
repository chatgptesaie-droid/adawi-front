# CAHIER DES CHARGES
**Nom de l'entreprise :** KAUZA  
**Nom du projet :** Adawi — Plateforme E-commerce de Mode  
**Thème du stage :** Conception et développement d'une plateforme e-commerce multi-rôles pour la digitalisation du commerce de mode au Togo : cas de la marque Adawi  
**Personne à contacter :** M. KPELOU  
**Adresse :** Agbalépédo, Lomé – Togo  
**Téléphone :** 93 29 22 48  
**Email :** newbrain02@gmail.com  

---

## SOMMAIRE

1. [Présentation de l'entreprise](#i-présentation-de-lentreprise)
2. [Présentation du projet](#ii-présentation-du-projet)
3. [L'arborescence](#iii-larborescence)
4. [Fonctionnalités](#iv-fonctionnalités)
5. [Technologie et Outils](#v-technologie-et-outils)
6. [Planning prévisionnel](#vi-planning-prévisionnel)

---

## I. Présentation de l'entreprise

**KAUZA** est une agence digitale basée à Lomé (Togo), spécialisée dans la transformation numérique des entreprises. Sa mission est de connecter les entreprises au digital en leur proposant des solutions sur mesure — création de sites web, développement d'applications, stratégie digitale et e-commerce — afin de renforcer leur présence en ligne et d'accélérer leur croissance.

Sa vision : faire du digital un levier accessible et concret pour toutes les entreprises, qu'elles soient startups ou structures établies, en leur offrant des outils performants adaptés au contexte local togolais et africain.

---

## II. Présentation du projet

### 1. Contexte général

Le secteur de la mode au Togo et en Afrique de l'Ouest connaît une mutation profonde, avec une clientèle de plus en plus connectée et un intérêt grandissant pour les marques locales. Cependant, les créateurs et vendeurs de mode locaux manquent de vitrines numériques professionnelles permettant de présenter, vendre et gérer leurs collections en ligne.

**Adawi** répond à ce besoin en proposant une plateforme e-commerce multi-vendeurs dédiée à la mode, fabriquée localement au Togo, avec une expérience d'achat fluide, des outils de gestion avancés pour les vendeurs et un pilotage complet pour l'administrateur.

### 2. Problématique

Comment concevoir une plateforme e-commerce de mode intuitive, multi-rôles (Admin / Vendeur / Client), permettant la gestion complète du cycle de vente — depuis la publication des produits jusqu'à la livraison et le service après-vente — tout en offrant des fonctionnalités avancées telles que la prise de rendez-vous, le paiement par versements échelonnés, la gestion des promotions et un système de support intégré ?

### 3. Objectifs

- Développer une boutique en ligne multi-vendeurs permettant aux vendeurs de publier et gérer leurs produits.
- Offrir aux clients une expérience d'achat complète : navigation, panier, commande, paiement mobile (Mobile Money), suivi de livraison, rendez-vous et demandes de remboursement.
- Fournir à l'administrateur un tableau de bord complet pour piloter les ventes, les utilisateurs, les rapports financiers, les promotions et le support client.
- Assurer la sécurité des accès via un système d'authentification par rôles (RBAC).

---

## III. L'arborescence

| RUBRIQUE | SOUS-RUBRIQUE | DESCRIPTIF |
|---|---|---|
| **Page d'accueil** | Vitrine publique | Bannière promotionnelle, nouveaux produits, services, témoignages, newsletter |
| | Navigation | Boutique, Blog, À propos, Équipe, Contact, FAQ, Livraison, Retour |
| **Authentification** | Connexion / Inscription | Email + mot de passe, choix du rôle (Client / Vendeur) |
| | Sécurité | Mot de passe oublié, réinitialisation par lien email |
| **Boutique** | Catalogue produits | Grille de produits avec filtres (catégorie, taille, couleur, prix), recherche |
| | Fiche produit | Détail produit avec modal, galerie images, tailles, couleurs, ajout au panier |
| | Panier | Gestion du panier (ajout, modification, suppression, vidage) |
| | Checkout | Saisie adresse livraison, choix méthode de paiement (Mobile Money), validation |
| **Espace Client** | Tableau de bord | Résumé des commandes, accès rapide |
| | Commandes | Liste et détail des commandes passées |
| | Suivi livraison | Suivi en temps réel de l'état de la commande |
| | Rendez-vous | Réservation de créneaux disponibles chez un vendeur |
| | Versements | Consultation des paiements échelonnés |
| | Remboursements | Demande et suivi des remboursements |
| | Tickets Support | Création et suivi de tickets d'assistance |
| | Profil | Modification des informations personnelles |
| **Espace Vendeur** | Tableau de bord | KPIs : revenus, commandes, produits, croissance |
| | Produits | Ajouter, modifier, activer/désactiver, supprimer |
| | Commandes | Liste des commandes reçues, mise à jour des statuts |
| | Inventaire | Alertes stock faible, statistiques d'inventaire |
| | Remboursements | Gestion des demandes de remboursement |
| | Support | Gestion des tickets clients |
| | Blog | Création et gestion d'articles de blog |
| | Utilisateurs | Gestion des utilisateurs rattachés au vendeur |
| | Rendez-vous | Gestion des créneaux et des rendez-vous clients |
| | Disponibilités | Paramétrage des créneaux horaires disponibles |
| | Versements | Suivi des paiements échelonnés |
| | Panier vendeur | Gestion du panier côté vendeur |
| **Espace Admin** | Tableau de bord | KPIs globaux : revenus, commandes, clients, vendeurs, commission, marges |
| | Produits | Gestion globale de tous les produits |
| | Commandes | Supervision de toutes les commandes, mise à jour statuts |
| | Catégories | Création, modification, suppression des catégories |
| | Utilisateurs | Gestion de tous les utilisateurs (rôles, activation) |
| | Promotions | Création et gestion des codes et périodes promotionnelles |
| | Remboursements | Supervision des demandes de remboursement |
| | Support | Gestion de tous les tickets de support |
| | Blog | Création, modification, suppression d'articles |
| | Rapports | Rapports de ventes, produits, exportation CSV/PDF |
| | Rendez-vous | Supervision de tous les rendez-vous |
| | Versements | Supervision des paiements échelonnés |
| | Paramètres | Configuration générale de la plateforme |
| **Blog** | Liste des articles | Affichage paginé des articles publiés |
| | Article détail | Lecture complète d'un article avec zoom images |
| **Pages statiques** | À propos | Présentation de la marque Adawi |
| | Équipe | Présentation de l'équipe |
| | Services | Description des services proposés |
| | FAQ | Questions fréquentes |
| | Livraison | Politique de livraison |
| | Retour | Politique de retour |
| | Contact | Formulaire de contact |
| | Guide des tailles | Tableau des tailles disponibles |

---

## IV. Fonctionnalités

### MODULE AUTHENTIFICATION & SÉCURITÉ

| FONCTIONNALITÉ | DESCRIPTIF |
|---|---|
| Inscription | Création de compte avec choix de rôle (Client / Vendeur), validation email et mot de passe |
| Connexion | Authentification par email + mot de passe avec redirection selon le rôle |
| Déconnexion | Invalidation de la session et redirection vers la page d'accueil |
| Mot de passe oublié | Envoi d'un lien de réinitialisation par email |
| Réinitialisation mot de passe | Formulaire sécurisé de changement de mot de passe via lien tokenisé |
| Contrôle d'accès (RBAC) | Permissions différenciées par rôle : Admin, Vendeur (Seller), Client |
| Gestion de session | Sessions sécurisées côté serveur via cookies signés |

---

### MODULE BOUTIQUE (PUBLIC)

| FONCTIONNALITÉ | DESCRIPTIF |
|---|---|
| Catalogue produits | Affichage paginé des produits avec filtres multi-critères (catégorie, prix, taille, couleur, tri) |
| Recherche | Recherche par mots-clés sur les produits |
| Fiche produit | Affichage détaillé : images haute résolution, description, tailles disponibles, couleurs, prix |
| Zoom images | Modal de zoom sur les images produit |
| Promotions actives | Affichage automatique des réductions en cours sur les produits concernés |

---

### MODULE PANIER & COMMANDE

| FONCTIONNALITÉ | DESCRIPTIF |
|---|---|
| Ajout au panier | Ajout d'un produit avec sélection de taille, couleur et quantité |
| Gestion du panier | Modification des quantités, suppression d'articles, vidage complet |
| Persistance panier | Synchronisation du panier en base de données pour les utilisateurs connectés |
| Checkout | Saisie de l'adresse de livraison (rue, ville, code postal, pays, téléphone) |
| Méthode de paiement | Paiement via Mobile Money (réseau et numéro de téléphone) |
| Méthode de livraison | Choix du mode de livraison |
| Validation commande | Création de la commande avec génération d'un identifiant unique |
| Confirmation | Notification de confirmation de commande |

---

### MODULE ESPACE CLIENT

| FONCTIONNALITÉ | DESCRIPTIF |
|---|---|
| Tableau de bord | Vue d'ensemble des commandes récentes et statistiques personnelles |
| Historique commandes | Liste des commandes passées avec statuts et détails (articles, montant, adresse) |
| Suivi livraison | Suivi en temps réel : étapes de livraison (confirmé, en préparation, expédié, livré) avec historique |
| Prise de rendez-vous | Consultation des créneaux disponibles chez un vendeur et réservation en ligne |
| Versements échelonnés | Consultation et suivi du plan de paiement en plusieurs fois |
| Demande de remboursement | Formulaire de demande de remboursement lié à une commande |
| Suivi remboursement | Suivi du statut de la demande (en attente, traité, refusé) |
| Tickets de support | Création d'un ticket avec catégorie (commande, produit, paiement, livraison, technique) et priorité |
| Suivi tickets | Suivi de l'état du ticket (ouvert, en cours, résolu, fermé) |
| Profil utilisateur | Modification des informations personnelles (nom, email, téléphone) |

---

### MODULE ESPACE VENDEUR

| FONCTIONNALITÉ | DESCRIPTIF |
|---|---|
| Tableau de bord | KPIs : revenu total, commandes totales, évolution hebdomadaire/mensuelle, produits actifs, valeur moyenne des commandes |
| Gestion produits | Ajouter un produit (nom, description, prix, images, tailles, couleurs, stock), modifier, activer/désactiver, supprimer |
| Gestion commandes | Liste des commandes avec filtres par statut, mise à jour du statut de livraison |
| Gestion inventaire | Alertes de stock faible, statistiques globales d'inventaire (valeur totale, produits en rupture) |
| Gestion remboursements | Traitement des demandes de remboursement clients |
| Gestion tickets support | Réponse et résolution des tickets clients |
| Blog vendeur | Création, modification et publication d'articles de blog |
| Gestion utilisateurs | Consultation et gestion des clients rattachés |
| Rendez-vous | Gestion des rendez-vous planifiés avec les clients (confirmation, annulation, notes) |
| Disponibilités | Paramétrage des créneaux horaires disponibles pour les rendez-vous |
| Versements | Suivi des paiements échelonnés liés aux commandes |
| Nouveaux produits | Section dédiée aux ajouts récents de produits |
| Panier vendeur | Gestion du panier depuis l'interface vendeur |

---

### MODULE ESPACE ADMINISTRATEUR

| FONCTIONNALITÉ | DESCRIPTIF |
|---|---|
| Tableau de bord global | KPIs : revenus total, commandes, clients, vendeurs, commission collectée, coût total, marge brute, croissance des revenus, croissance des commandes, alertes stock faible, remboursements |
| Graphiques | Graphique des ventes (SalesChart), croissance utilisateurs (UserGrowthChart), catégories top vendeuses, ventes géographiques, statuts commandes |
| Gestion produits | Supervision de tous les produits (tous vendeurs confondus), activation/désactivation, suppression |
| Gestion commandes | Vue globale de toutes les commandes, filtres par statut, mise à jour des statuts, export |
| Gestion catégories | Création, modification, suppression des catégories produits |
| Gestion utilisateurs | Liste de tous les utilisateurs, modification des rôles, activation/suspension |
| Promotions | Création de promotions (nom, description, % de réduction, date début/fin), activation/désactivation, calculateur de prix |
| Remboursements | Supervision de toutes les demandes de remboursement avec statistiques |
| Tickets support | Vue globale des tickets, affectation, mise à jour du statut, réponse |
| Blog | Création, modification, publication et suppression d'articles de blog |
| Rapports | Rapports de ventes (montants, commandes), rapports produits (ventes par produit), filtres par période, export CSV/PDF |
| Rendez-vous | Supervision de tous les rendez-vous (stats : total, par statut, à venir, aujourd'hui) |
| Versements échelonnés | Supervision des paiements échelonnés (stats : payés, en attente, en retard, montants) |
| Paramètres | Configuration générale de la plateforme |
| Notifications | Système de notifications en temps réel avec marquage lu/non lu |

---

### MODULE BLOG

| FONCTIONNALITÉ | DESCRIPTIF |
|---|---|
| Liste des articles | Affichage paginé des articles publiés avec vignettes, tags et extrait |
| Détail article | Lecture complète de l'article avec zoom des images |
| Gestion back-office | Création (titre, contenu, slug, image de couverture, tags, extrait), modification, suppression |

---

### MODULE NOTIFICATIONS

| FONCTIONNALITÉ | DESCRIPTIF |
|---|---|
| Centre de notifications | Dropdown de notifications pour Admin et Vendeur |
| Alertes en temps réel | Notification lors d'une nouvelle commande, d'un ticket, d'un remboursement |
| Marquage lu | Marquer une ou toutes les notifications comme lues |
| Détail notification | Modal de détail d'une notification |

---

### MODULE RENDEZ-VOUS & DISPONIBILITÉS

| FONCTIONNALITÉ | DESCRIPTIF |
|---|---|
| Créneaux disponibles | Le vendeur définit ses disponibilités (date, heure début/fin, durée en minutes) |
| Réservation client | Le client consulte les créneaux disponibles par vendeur et réserve un créneau |
| Gestion admin/vendeur | Confirmation, annulation, ajout de notes (client, vendeur, admin) |
| Rappels | Système de rappel (reminder_sent) pour les rendez-vous à venir |
| Création manuelle | L'admin ou le vendeur peut créer manuellement un rendez-vous |

---

### MODULE PAIEMENTS ÉCHELONNÉS

| FONCTIONNALITÉ | DESCRIPTIF |
|---|---|
| Création versement | Création d'un plan de versements pour une commande (montant, date d'échéance) |
| Suivi client | Consultation du statut de chaque versement (en attente, payé, en retard, annulé) |
| Gestion admin | Validation, annulation ou modification d'un versement, consultation des statistiques |
| Méthode de paiement | Enregistrement de la méthode utilisée pour chaque versement |

---

## V. Technologie et Outils

### 1. Frontend
- **Framework :** Remix.js (React Router v7) — rendu SSR + hydratation côté client
- **Langage :** TypeScript
- **UI / Styling :** Tailwind CSS
- **Composants UI :** Headless UI, Lucide React (icônes)
- **Animations :** Framer Motion
- **Gestion état :** Context API React (CartContext, ToastContext)
- **Compression images :** browser-image-compression

### 2. Backend
- **Framework API :** FastAPI (Python)
- **Base de données :** MongoDB
- **Authentification :** JWT (Bearer token) stocké en session cookie signée côté serveur Remix
- **Hachage mot de passe :** bcrypt

### 3. Infrastructure
- **Serveur Remix :** Node.js ≥ 20
- **Build tool :** Vite
- **Déploiement backend :** Render.com
- **Déploiement frontend :** À définir (compatible Vercel, Railway, Render)

### 4. Outils de développement
- ESLint + TypeScript ESLint
- PostCSS + Autoprefixer
- VSCode (workspace configuré)

---

## VI. Planning prévisionnel

| Numéro | Tâches | Délai |
|---|---|---|
| 1 | Phase de planification et analyse des besoins | 3 jours |
| 2 | Conception technique (maquettes UI/UX, architecture API) | 5 jours |
| 3 | Développement du frontend (pages publiques + espace client) | 15 jours |
| 4 | Développement du backend (API, modèles, authentification) | 15 jours |
| 5 | Développement des espaces Vendeur et Admin | 10 jours |
| 6 | Intégration des modules avancés (RDV, versements, blog, rapports) | 7 jours |
| 7 | Tests, corrections et optimisations | 7 jours |
| 8 | Mise en production et formation | 3 jours |
| **TOTAL** | | **~65 jours** |

---

*Document rédigé par KAUZA — Lomé, Togo*  
*Contact : newbrain02@gmail.com | Tél : 93 29 22 48*
