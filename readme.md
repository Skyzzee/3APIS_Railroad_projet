# Railroad-api

Bienvenue sur l'API Railroad, vous trouverez dans ce readme les différents commandes pour installer le projet (+ Les dependances installées), mais également la strucutre du projet ainsi qu'une consigne pour vous guider sur le lancement du projet (A LIRE ABSOLUMENT AVANT DE LANCER LE PROJET) et enfin les différentes routes que vous retrouverez également dans la documentation

## Commande d'installation :

npm install      // Permet d'installer tout le projet sur son poste

---------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

----------------------------------------------------------------------------------------------------------------------------------------------------------------------


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
**********************************************************************

Catégorie

Fonction de la route ( Authorisation de la route ): 
Méthodes de requête HTTP :
URL de la requête :
Corps de la requête (informations necessaires) :
Reponse de la requête :
Codes HTTP possibles :
200 -> OK : Requête réussie, réponse retournée
201 -> Created : Ressource créée avec succès
400 -> Bad Request : Requête incorrecte ou mal formée
401 -> Unauthorized : Authentification requise ou invalide
404 -> Not Found : Ressource non trouvée
500 -> Internal Server Error : Erreur serveur inattendue

**********************************************************************

Authentification : 

Inscription ( Admin - Employé - Utilisateur / --- ):
Connection ( Admin - Employé - Utilisateur / NON-CONNECTES seulement ):

Utilisateurs :
Récupération de tous les utilisateurs ( Admin - Employé / CONNECTES ):
Récupération d'un utilisateur par ID ( Admin - Employé - Utilisateur (Lui-même seulement) / CONNECTES ):
Modification d'un utilisateur par ID ( Admin - Utilisateur (Lui-même seulement) / CONNECTES ):
Suppression d'un utilisateur par ID ( Admin - Utilisateur (Lui-même seulement) / CONNECTES ):

Trains :
Création d'un train ( Admin / CONNECTES ):
Récupération de tous les trains ( Admin - Employé - Utilisateur / --- ):
Récupération d'un train par ID ( Admin - Employé - Utilisateur / --- ):
Modification d'un train par ID ( Admin / CONNECTES ):
Suppression d'un train par ID ( Admin / CONNECTES ):

Gares :
Création d'une gare ( Admin / CONNECTES ):
Récupération de toutes les gares ( Admin - Employé - Utilisateur / --- ):
Récupération d'une gare par ID ( Admin - Employé - Utilisateur / --- ):
Modification d'une gare par ID ( Admin / CONNECTES ):
Suppression d'une gare par ID ( Admin / CONNECTES ):

Tickets :
Création d'un ticket - Reservation d'un billet de train ( Admin - Employé - Utilisateur / CONNECTES ):
Récupération de tous les tickets d'un utilisateur par son ID - Historique ( Admin - Employé - Utilisateur (Lui-même seulement) / CONNECTES ):
Récupération de tous les tickets d'un train par son ID - Disponibilité ( Admin - Employé / CONNECTES ):
Récupération d'un ticket par ID ( Admin - Employé - Utilisateur (Lui-même seulement) / CONNECTES ):
Validation d'un ticket par ID ( Admin - Employé / CONNECTES ):