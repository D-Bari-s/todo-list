# todo-list
TP B1 ESGI Liste Notes
Le but de ce projet est d'avoir un outil de création / modification de notes avec possibilité de connexion / inscription / déconnexion.

Chaque utilisateur n'a accès qu'aux notes qu'il a créé lui-même

## Qui fait quoi ? 
| Fichier | Techno | Rôle | S'exécute où ? |
|---------|--------|------|----------------|
| `index.html` | HTML | Structure la page | Navigateur |
| `style.css` | CSS | Donne l'apparence | Navigateur |
| `api.php` | PHP | Lit/écrit en BDD, répond en JSON | **Serveur** |
| `app.js` | JS | Anime la page, appelle l'API | Navigateur |

## Comment lancer le projet ?

### 1. XAMPP, WAMPP, Laragon - Control pannel
Démarrer le service Apache & MYSQL
Copier le dossier todo-list/ dans /htdocs

### 2. Exécuter le script présent dans database.sql
Ouvrir `http://localhost/phpmyadmin/`

Dans 'Nouvelle base de données' choisir la catégorie 'SQL' et coller l'entièreté du contenu de `database.sql`, puis appuyer sur 'Exécuter'.

### 3. Créer & configurer config.php
Dans le dossier todo-list/, créer un fichier `config.php` avec le contenu de `config.example.php`.

<u>Assigner les valeurs suivantes :</u><br>

```php
$host = 'localhost'
$dbname = 'todo_list'
$user = 'root'
``` 

### 4. Accéder au site servi par Apache :
Dans le navigateur, accéder à `http://localhost/todo-list/`

## Le cycle complet d'une requête

```
[Navigateur]           [Serveur PHP]          [Base SQLite]
     |                      |                       |
     |--- fetch('api.php') →|                       |
     |                      |--- SELECT * FROM ---> |
     |                      |<-- [{id:1, ...}] ---- |
     |<-- JSON [{...}] -----|                       |
     |                      |                       |
     | JS crée les cartes   |                       |
     | et les insère dans   |                       |
     | le DOM               |                       |
```

---


### Erreurs fréquentes 
| Erreur | Cause probable |
|--------|----------------|
| `fetch` échoue (CORS) | On ouvre le HTML sans serveur, pas via `localhost` |
| Erreur d'accès aux données de la DB | script présent dans `database.sql` non exécuté |
| JSON invalide | PHP a affiché un warning avant le json_encode() |