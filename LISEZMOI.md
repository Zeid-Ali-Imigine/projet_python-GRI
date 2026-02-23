# Application de Gestion Immobilière (ImmoGestion)

Ce projet est une application web de gestion immobilière permettant la gestion des revenus, des paiements, des charges, ainsi que des demandes d’allocations pour les biens immobiliers.

L'application dispose de 3 profils distincts :
- **Administrateur** : Vue globale sur toutes les statistiques (Biens, Utilisateurs, Demandes).
- **Propriétaire** : Gestion de ses biens, consultation des revenus/charges, et gestion des listes d'attente.
- **Locataire** : Suivi de ses baux, paiements, et consultation des contrats.

---

## 💻 Technologies et Stack Technique

- **Backend** : Django 4.2 + Django REST Framework (DRF)
- **Base de données** : MySQL
- **Documentation API** : drf-yasg (Swagger/OpenAPI)
- **Frontend** : React.js (Vite), React Router, Axios
- **Design/Styling** : Tailwind CSS v4

---

## ⚙️ Prérequis

- **Python 3.10+** ou plus
- **Node.js 18+** ou plus
- Serveur **MySQL** local actif (par exemple via XAMPP).

---

## 🚀 Installation & Démarrage

### 1. Configuration de la base de données
1. Démarrez votre serveur MySQL local.
2. Assurez-vous d'avoir créé une base de données nommée `gestion_immobiliere` :
   ```sql
   CREATE DATABASE gestion_immobiliere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 2. Démarrage du Backend (Django)
Ouvrez un terminal dans le répertoire du projet, activez l'environnement virtuel et lancez :
```bash
cd backend
python manage.py makemigrations
python manage.py migrate

# Exécuter le script de l'admin par défaut (optionnel si déjà fait)
python setup_admin.py 

# Démarrer le serveur
python manage.py runserver
```
Le backend sera accessible sur : `http://127.0.0.1:8000/`

**Endpoints API & Documentation Swagger :**
- L'API REST est hébergée sur `http://127.0.0.1:8000/api/`
- Documentation complète disponible sur : `http://127.0.0.1:8000/swagger/`

### 3. Démarrage du Frontend (React Vite)
Ouvrez un nouveau terminal, placez-vous dans le répertoire du frontend et installez les dépendances :
```bash
cd frontend
npm install

# Démarrage
npm run dev
```
L'interface utilisateur sera accessible sur : `http://localhost:5173/` ou l'adresse similaire donnée par Vite.

---

## 📌 Architecture de l'API (Ressources Principales)

Toutes les routes commencent par `/api/`

- **Utilisateurs** : `/api/utilisateurs/` (Gestion des profils, rôle : admin, owner, tenant, manager)
- **Biens Immobiliers** : `/api/biens/` (Propriétés, adresse, superficie, loyer estimé...)
- **Demandes de Location** : `/api/demandes/` (Avec actions supplémentaires `/accepter/` et `/refuser/`)
- **Baux** : `/api/baux/` (Liaison Locataire / Bien Immobilier)
- **Paiements** : `/api/paiements/` (Enregistrement des loyers des locataires)
- **Charges & Dépenses** : `/api/charges/` (Gestion financière des propriétés)

---

## 👥 Connexion de test (Mock Frontend)

Actuellement, la simulation de connexion sur l'interface (mock) utilise le nom d'utilisateur saisi :
- Nom : `admin` => accès Tableau de bord Admin
- Nom : `proprietaire` => accès Tableau de bord Propriétaire
- Nom : `locataire` => accès Tableau de bord Locataire

*Note: Vous pouvez lier le backend à tout moment dans le fichier `src/apis/index.js`.*
