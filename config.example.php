
<?php
//Fichier de configuration pour ouvrir une connexion vers la base de données, à appeler dans api.php :
// Préparation des paramètres :
$host = '';
$dbname = '';
$user = '';
$password = '';
try
{
    //Déclaration du PDO :
    $connection = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8;",
        $user,
        $password
    );
}
catch (PDOException $e)
{
    die("Erreur de connexion : ". $e->getMessage());
}

?>