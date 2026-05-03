<?php
require_once "config.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST')
{
    $email = $_POST['email'] ?? '';
    $pwd = $_POST['pwd'] ?? '';
}

$string = "SELECT * FROM users WHERE email=:email";


?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <link rel="stylesheet" href="style.css">
    <title>Connexion</title>
</head>
    <body>
        <!-- Navbar bootstrap : -->
        <nav class="navbar navbar-expand-lg bg-body-tertiary navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="index.html">ToDo - List</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav">
                    <a class="nav-link" aria-current="page" href="index.html">Notes</a>
                    <a class="nav-link active" aria-current="page" href="connexion.php">Connexion</a>
                    <a class="nav-link" href="#">Déconnexion - A changer pour gérer via PHP</a>
                </div>
            </div>
        </div>
        </nav>

        <!-- Formulaire de connexion : -->
        <h1>Connexion</h1>
        <form id="connect-form" action="" method="POST">
            <input type="hidden" name="action" value="connect">
            <div class="champ">
                <label for="email">Adresse mail</label>
                <input type="text" id="email" name="email" required>
                <label for="pwd">Mot de passe</label>
                <input type="paswword" id="pwd" name="pwd" required>
                <button type="submit" class="form-btn">Connexion</button> <br>
                <a href="inscription.php">Créer un compte</a>
            </div>
            <script href="app.js"></script>
        </form>
    </body>
</html>