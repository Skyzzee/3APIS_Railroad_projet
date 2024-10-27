# Railroad-api

Bienvenue sur l'API Railroad, vous trouverez dans ce readme les différents commandes pour installer le projet (+ Les dependances installées), mais également la strucutre du projet ainsi qu'une consigne pour vous guider sur le lancement du projet (A LIRE ABSOLUMENT AVANT DE LANCER LE PROJET) et enfin les différentes routes que vous retrouverez également dans la documentation

## Commande d'installation :

npm install      // Permet d'installer tout le projet sur son poste

------------------------------------------------------------------------------------------------------------------------------
npm init -y      // Installation de Node.js

npm install express    // Framework léger pour gérer les routes et les requêtes HTTP
npm install dotenv        // Pour charger des variables d'environnement à partir d'un fichier .env
npm install mongoose        // ODM pour interagir avec MongoDB

npm install jsonwebtoken     // Pour générer et vérifier des tokens JWT
npm install bcryptjs      // Pour hasher les mots de passe avant de les stocker en base de données
 
npm install joi    // Pour valider les schémas de données dans les requêtes HTTP

npm install --save-dev jest      // Framework de tests
npm install --save-dev supertest       // Outil pour tester les requêtes HTTP sur l'API
npm install --save-dev nodemon      // Redémarre automatiquement le serveur lorsqu'un fichier change

npm install --save-dev mongodb-memory-server      // Créer une base de donnée en mémoire pour les tests (afin de ne pas polluer la vrai base de donnée)

------------------------------------------------------------------------------------------------------------------------------

## Structure du projet :

app.js : Point d'entrée de l'application
controllers/ : Contient la logique de fonctionnement de l'api pour chaque routes
middleware/ : Pour des middlewares comme l'authentification JWT
models/ : Contient les modèles Mongoose pour interagir avec MongoDB
routes/ : Contient les routes de l'API
tests/ : Les fichiers de test pour chaque fonctionnalité
.env : Fichier qui contient les variables sensibles
package.json : Fichier qui contient des informations essentielles sur le projet (dépendances, les scripts, les versions)


## ATTENTION AU .env :

Si vous souhaitez lancer le projet (avec npm start), vérifier dans le fichier .env que "NODE_ENV" est comme paramètre "development", 
sinon si vous souhaitez lancer les tests changer le paramètre afin de le remplacer par "test".

Voici les 2 lignes possibles suivant ce que vous souhaitez faire :

NODE_ENV=development            - Lancer le projet (npm start)

NODE_ENV=test            - Lancer les tests seulement (npm test)


## Les routes du projet : 
*******************************************************************************************

### Catégorie

    Fonction de la route ( Authorisation de la route ): 
    Méthodes de requête HTTP :
    URL de la requête :
    Corps de la requête (informations necessaires) :
    Codes HTTP possibles :

    200 -> OK : Requête réussie, réponse retournée
    201 -> Created : Ressource créée avec succès
    204 -> No Content : Requête réussie sans contenu dans la réponse
    400 -> Bad Request : Requête incorrecte ou mal formée
    401 -> Unauthorized : Authentification requise ou invalide
    403 -> Forbidden : Accès refusé pour l'utilisateur non autorisé
    404 -> Not Found : Ressource non trouvée
    500 -> Internal Server Error : Erreur serveur inattendue

*******************************************************************************************

### Authentification : 

    Fonction de la route ( Authorisation de la route ): 
        Inscription (Admin - Employé - Utilisateur / Non requise)

    Méthodes de requête HTTP :
        POST

    URL de la requête :
        /user/register

    Corps de la requête (informations necessaires) :
        { 
            "pseudo": "string", -- required, -- unique
            "email": "string", -- required, -- unique
            "password": "string", -- required
            "role": "string", -- enum: ['user', 'admin', 'employee'], -- default: 'user'
        }
        
    Codes HTTP possibles :
        201 : Created - Utilisateur créé avec succès
        400 : Bad Request - Requête incorrecte (pseudo, email ou mot de passe manquant, pseudo ou email déjà utilisés)
        500 : Internal Server Error - Erreur serveur

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Connection (Admin - Employé - Utilisateur / Non-connectés seulement)

    Méthodes de requête HTTP :
        POST

    URL de la requête :
        /user/login

    Corps de la requête (informations nécessaires) :
        { 
            "email": "string", -- required, -- unique
            "password": "string", -- required
        }
        
    Codes HTTP possibles :
        200 : OK - Connexion réussie
        400 : Bad Request - Identifiants manquants ou incorrects
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------------
### Utilisateurs :

    Fonction de la route (Autorisation de la route): 
        Récupération de tous les utilisateurs (Admin - Employé / Connectés)

    Méthodes de requête HTTP :
        GET

    URL de la requête :
        /user/

    Corps de la requête (informations nécessaires) :
        Aucun

    Codes HTTP possibles :
        200 : OK - Liste des utilisateurs récupérée avec succès
        401 : Unauthorized - Autorisation requise
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Récupération d'un utilisateur par ID (Admin - Employé - Utilisateur (Lui-même seulement) / Connectés)

    Méthodes de requête HTTP :
        GET

    URL de la requête :
        /user/:id

    Corps de la requête (informations nécessaires) :
        Aucun

    Codes HTTP possibles :
        200 : OK - Utilisateur récupéré avec succès
        401 : Unauthorized - Autorisation requise
        403 : Forbidden - Accès interdit (utilisateur non propriétaire)
        404 : Not Found - Utilisateur non trouvé
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Modification d'un utilisateur par ID (Admin - Utilisateur (Lui-même seulement) / Connectés)

    Méthodes de requête HTTP :
        PUT

    URL de la requête :
        /user/:id

    Corps de la requête (informations nécessaires) :
        { 
            "pseudo": "string", -- required, -- unique
            "email": "string", -- required, -- unique
        }
        
    Codes HTTP possibles :
        200 : OK - Utilisateur mis à jour avec succès
        400 : Bad Request - Requête incorrecte
        401 : Unauthorized - Autorisation requise
        403 : Forbidden - Accès interdit (utilisateur non propriétaire)
        404 : Not Found - Utilisateur non trouvé
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Suppression d'un utilisateur par ID (Admin - Utilisateur (Lui-même seulement) / Connectés)

    Méthodes de requête HTTP :
        DELETE

    URL de la requête :
        /user/:id

    Corps de la requête (informations nécessaires) :
        Aucun

    Codes HTTP possibles :
        200 : OK - Utilisateur supprimé avec succès
        401 : Unauthorized - Autorisation requise
        403 : Forbidden - Accès interdit (utilisateur non propriétaire)
        404 : Not Found - Utilisateur non trouvé
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------------
### Trains :

    Fonction de la route (Autorisation de la route): 
        Création d'un train (Admin / Connectés)

    Méthodes de requête HTTP :
        POST

    URL de la requête :
        /train/

    Corps de la requête (informations nécessaires) :
        { 
            "nom": "string", -- required, -- unique
            "start_station": "ObjectId", -- required
            "end_station": "ObjectId", -- required
            "time_of_departure": "Date", -- required
        }
        
    Codes HTTP possibles :
        201 : Created - Train créé avec succès
        400 : Bad Request - Requête incorrecte
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Récupération de tous les trains (Admin - Employé - Utilisateur / ---)

    Méthodes de requête HTTP :
        GET

    URL de la requête :
        /train/

    Corps de la requête (informations nécessaires) :
        Aucun

    Codes HTTP possibles :
        200 : OK - Liste des trains récupérée avec succès
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Récupération d'un train par ID (Admin - Employé - Utilisateur / ---)

    Méthodes de requête HTTP :
        GET

    URL de la requête :
        /train/:id

    Corps de la requête (informations nécessaires) :
        Aucun

    Codes HTTP possibles :
        200 : OK - Train récupéré avec succès
        404 : Not Found - Train non trouvé
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Modification d'un train par ID (Admin / Connectés)

    Méthodes de requête HTTP :
        PUT

    URL de la requête :
        /train/:id

    Corps de la requête (informations nécessaires) :
        { 
            "nom": "string", -- required, -- unique
            "start_station": "ObjectId", -- required
            "end_station": "ObjectId", -- required
            "time_of_departure": "Date", -- required
        }
        
    Codes HTTP possibles :
        200 : OK - Train mis à jour avec succès
        400 : Bad Request - Requête incorrecte
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Suppression d'un train par ID (Admin / Connectés)

    Méthodes de requête HTTP :
        DELETE

    URL de la requête :
        /train/:id

    Corps de la requête (informations nécessaires) :
        Aucun

    Codes HTTP possibles :
        200 : OK - Train supprimé avec succès
        404 : Not Found - Train non trouvé
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------------
### Gares :

    Fonction de la route (Autorisation de la route): 
        Création d'une gare (Admin / Connectés)

    Méthodes de requête HTTP :
        POST

    URL de la requête :
        /station/

    Corps de la requête (informations nécessaires) :
        { 
            "name": "string", -- required, -- unique
            "open_hour": "string", -- required
            "close_hour": "string", -- required
            "image": "string", -- required
        }
        
    Codes HTTP possibles :
        201 : Created - Gare créée avec succès
        400 : Bad Request - Requête incorrecte
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Récupération de toutes les gares (Admin - Employé - Utilisateur / ---)

    Méthodes de requête HTTP :
        GET

    URL de la requête :
        /station/

    Corps de la requête (informations nécessaires) :
        Aucun

    Codes HTTP possibles :
        200 : OK - Liste des gares récupérée avec succès
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Récupération d'une gare par ID (Admin - Employé - Utilisateur / ---)

    Méthodes de requête HTTP :
        GET

    URL de la requête :
        /station/:id

    Corps de la requête (informations nécessaires) :
        Aucun

    Codes HTTP possibles :
        200 : OK - Gare récupérée avec succès
        404 : Not Found - Gare non trouvée
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Modification d'une gare par ID (Admin / Connectés)

    Méthodes de requête HTTP :
        PUT

    URL de la requête :
        /station/:id

    Corps de la requête (informations nécessaires) :
        { 
            "name": "string", -- required, -- unique
            "open_hour": "string", -- required
            "close_hour": "string", -- required
            "image": "string", -- required
        }
        
    Codes HTTP possibles :
        200 : OK - Gare mise à jour avec succès
        400 : Bad Request - Requête incorrecte
        404 : Not Found - Gare non trouvée
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Suppression d'une gare par ID (Admin / Connectés)

    Méthodes de requête HTTP :
        DELETE

    URL de la requête :
        /station/:id

    Corps de la requête (informations nécessaires) :
        Aucun

    Codes HTTP possibles :
        200 : OK - Gare supprimée avec succès
        404 : Not Found - Gare non trouvée
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------------
### Tickets :

    Fonction de la route (Autorisation de la route): 
        Création d'un ticket - Réservation d'un billet de train (Admin - Employé - Utilisateur / Connectés)

    Méthodes de requête HTTP :
        POST

    URL de la requête :
        /ticket/:id_train/booking

    Corps de la requête (informations nécessaires) :
        Aucun
        
    Codes HTTP possibles :
        201 : Created - Ticket réservé avec succès
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Récupération de tous les tickets d'un utilisateur par son ID - Historique (Admin - Employé - Utilisateur (Lui-même seulement) / Connectés)

    Méthodes de requête HTTP :
        GET

    URL de la requête :
        /ticket/history

    Corps de la requête (informations nécessaires) :
        Aucun

    Codes HTTP possibles :
        200 : OK - Historique des tickets récupéré avec succès
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Récupération de tous les tickets d'un train par son ID - Disponibilité (Admin - Employé / Connectés)

    Méthodes de requête HTTP :
        GET

    URL de la requête :
        /ticket/:id_train/available

    Corps de la requête (informations nécessaires) :
        Aucun

    Codes HTTP possibles :
        200 : OK - Liste des tickets récupérée avec succès
        404 : Not Found - Aucun ticket trouvé
        500 : Internal Server Error - Erreur serveur inattendue

------------------------------------------------------------------------------------------------------------------------------
    Fonction de la route (Autorisation de la route): 
        Récupération d'un ticket par ID (Admin - Employé - Utilisateur (Lui-même seulement) / Connectés)

    Méthodes de requête HTTP :
        GET

    URL de la requête :
        /ticket/:id

    Corps de la requête (informations nécessaires) :
        Aucun

    Codes HTTP possibles :
        200 : OK - Ticket récupéré avec succès
        403 : Forbidden - Accès interdit (utilisateur non propriétaire)
        404 : Not Found - Ticket non trouvé
        500 : Internal Server Error - Erreur serveur inattendue

--------------------------------------------------------------------------------------

    Fonction de la route (Autorisation de la route): 
        Validation d'un ticket par ID (Admin - Employé / Connectés)

    Méthodes de requête HTTP :
        GET

    URL de la requête :
        /ticket/:id/validate

    Corps de la requête (informations nécessaires) :
        Aucun

    Codes HTTP possibles :
        200 : OK - Ticket validé avec succès
        404 : Not Found - Ticket non trouvé
        500 : Internal Server Error - Erreur serveur inattendue
