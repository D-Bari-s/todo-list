
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <link rel="stylesheet" href="style.css">
    <title>Inscription</title>
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
                <button class="nav-link nav-btn" id="disconnect-btn">Déconnexion</a>
            </div>
            </div>
        </div>
        </nav>

        <h1>Inscription</h1>
        <div id="message" style="display:none;"></div>
        <!-- Formulaire d'inscription : -->
        <form id="inscription-form" action="api.php" method="POST">
            <input type="hidden" name="action" value="create-user">
            <div class="champ">
                <label for="username">Nom d'utilisateur</label>
                <input type="text" id="username" name="username" required>
                <label for="email">Adresse mail</label>
                <input type="text" id="email" name="email" required>
                <label for="pwd">Mot de passe</label>
                <input type="password" id="pwd" name="pwd" required>
                <button type="submit" class="form-btn">Créer le compte</button> <br>
            </div>
        </form>
        <script src="app.js"></script>
    </body>
</html>