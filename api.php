<?php
// Appel du fichier config : 
require_once "config.php";

//Définition des headers :
//On dit que le PHP répondra tout le temps en JSON
header('Content-Type: application/json; charset=utf-8;');
header('Access-Control-Allow-Origin: *;');


//Pour toutes les requêtes POST :
if ($_SERVER['REQUEST_METHOD'] === 'POST')
{
    //Si le PHP est appelé depuis la création d'un nouvel user :
    if ($_POST['action'] === 'create-user')
    {
        // On récupère les données envoyées en POST via le formulaire :
        $username = $_POST['username'] ?? '';
        $email = $_POST['email'] ?? '';
        $pwd = $_POST['pwd'] ?? '';
        if (empty($username) || empty($email) || empty($pwd))
        {
            echo json_encode(['status'=>'OK','message' => 'merci de remplir les champs nécessaires']);
            exit;
        }
        //On vérifie que l'email & l'username soient unique :
        $verif_string = "SELECT * FROM users WHERE email=:email OR username=:username";

        $sth = $connection->prepare($verif_string);
        $sth->execute([$email,$username]);
        $verif = $sth->fetchAll();
        
        //Si un email ou username est déjà existant :
        if (count($verif) > 0)
        {
            //On retourne un code d'erreur si un utilisateur avec le même email ou username est trouvé
            echo json_encode(['status'=>'success','response' => 'Si aucune adresse mail ou username n\'est trouvée, le compte sera créé.']);
            exit;
        }

        //Sinon on ajoute l'utilisateur à la base :
        //Requête préparée avec paramètres nommés :
        $string = "INSERT INTO users VALUES(:email,:username,:pwd);";
        $sth = $connection->prepare($string);
        $pwd = password_hash($pwd,PASSWORD_BCRYPT);
        $sth->execute([$email,$username,$pwd]);

        echo json_encode(['status'=>'success','response' => 'Si aucune adresse mail ou username n\'est trouvée, le compte sera créé.']);
        exit;

    }
    
    //Si le PHP est appelé depuis la connexion :
    if ($_POST['action'] === 'connect')
    {

    }

    //Si le PHP est appelé depuis la création d'une note :
    if ($_POST['action'] === 'create-note')
    {
        try
        {
            //Nettoyage des paramètres :
            //trim : enlever les espaces
            //Pas besoin d'utiliser htmlspecialchars car on utilise déjà textContent (protégé contre XSS)
            //Si on utilise htmlspecialchars ' devient &#039; donc pas un affichage correct pour utilisateur
            //Puisque textContent récupère le texte brut
            $title = trim($_POST['title']) ?? '';
            $description = trim($_POST['description']) ?? '';
            $priority = trim($_POST['priority']) ?? '';
            $target_date = trim($_POST['target_date']) ?? '';

            //Vérification des paramètres :
            if (empty($title) ||empty($description) ||empty($priority) ||empty($target_date))
            {
                echo json_encode(['status'=>'error','response'=>'Merci de remplir tous les paramètres']);
                exit;
            }

            //Préparation & exécution de la requête :
            $string_create = "INSERT INTO tasks(title,description,priority,target_date)
            VALUES (:title,:description,:priority,:target_date)";

            $sth = $connection->prepare($string_create);
            $sth->execute([
                ':title' => $title,
                ':description' => $description,
                ':priority' => $priority,
                ':target_date' => $target_date
            ]);

            //On récupère le dernier id inséré via la connexion :
            $id = $connection->lastInsertId();

            //Pour récupérer state & created_at, car on en a besoin pour appeler creerCarte(), on récupère toutes les infos :
            $sth_select = $connection->prepare('SELECT * FROM Tasks WHERE id_task=:id');
            $sth_select->execute([':id'=>$id]);
            $infos_card = $sth_select->fetchAll(PDO::FETCH_ASSOC);

            $created_at = $infos_card[0]['created_at'];
            $state = $infos_card[0]['state'];

            //200 = success
            //201 = création réussie
            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'response' => 
                [
                    'id_task' => $id,
                    'title' => $title,
                    'description' => $description,
                    'priority' => $priority,
                    'target_date' => $target_date,
                    'created_at' => $created_at,
                    'state' => $state
                ]
            ]);
            exit;

        }
        catch(PDOException $e)
        {
            echo json_encode(['status'=>'error','response'=>$e->getMessage()]);
        }
    }
    if($_POST['action'] === 'delete-note')
    {
        try
        {
            $id = $_POST['id'];
            $delete_string = "DELETE FROM tasks WHERE id_task=:id";
            $sth = $connection->prepare($delete_string);
            $sth->execute([':id'=>$id]);

            echo json_encode(['status'=>'success','response'=>'Tâche supprimée !']);
            exit;
        }
        catch (PDOException $e)
        {
            echo json_encode(['status'=>'error','response'=>$e->getMessage()]);
            exit;
        }
    }
}

//Si le php est appelé depuis la fonction d'affichage des notes :
if ($_SERVER['REQUEST_METHOD'] === 'GET')
{
    //Une seule requête en GET pour afficher les notes, pas besoin de vérifier l'action :
    // $user_id = $_SESSION['id'] ?? '';

    // if ($user_id == '')
    // {
    //     echo json_encode(['erreur' => 'id vide']);
    //     exit;
    // }
    
    //$string_notes = "SELECT * FROM tasks WHERE user_id = :id";
    $string_notes = "SELECT * FROM tasks";
    $sth = $connection->prepare($string_notes);
    $sth->execute();
    //On récupère un tableau associatif :
    $notes = $sth->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($notes);
    exit;
    //$sth->execute($user_id);
    
    
}
?>
