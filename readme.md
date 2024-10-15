# Railroad-api


## Commande d'installation :

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




## Structure du projet :

app.js : Point d'entrée de l'application
middleware/ : Pour des middlewares comme l'authentification JWT
models/ : Contiendra les modèles Mongoose pour interagir avec MongoDB
routes/ : Contiendra les routes de l'API et leur fonctionnement
tests/ : Les fichiers de test pour chaque fonctionnalité
.env : Fichier qui contient les variables sensibles
package.json : Fichier qui contient des informations essentielles sur le projet (dépendances, les scripts, les versions)