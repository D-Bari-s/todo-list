<?php
// Appel du fichier config : 
require_once "config.php";

//Définition des headers :
//On dit que le PHP répondra tout le temps en JSON
header('Content-Type: application/json; charset=utf-8;');
header('Access-Control-Allow-Origin: *;');

//Indispensable pour utiliser les sessions :
session_start();

//Pour toutes les requêtes POST :
if ($_SERVER['REQUEST_METHOD'] === 'POST')
{
    $action = $_POST['action'];
    //Si le PHP est appelé depuis la création d'un nouvel user :
    if ($action === 'create-user')
    {
        try
        {
            // On récupère les données envoyées en POST via le formulaire :
            $username = $_POST['username'] ?? '';
            $email = $_POST['email'] ?? '';
            $pwd = $_POST['pwd'] ?? '';
            if (empty($username) || empty($email) || empty($pwd))
            {
                http_response_code(400);
                echo json_encode(['status'=>'error','message' => 'merci de remplir les champs nécessaires']);
                exit;
            }
            //On vérifie que l'email & l'username soient unique :
            $verif_string = "SELECT * FROM users WHERE email=:email OR username=:username";

            $sth = $connection->prepare($verif_string);
            $sth->execute([
                ':email' => $email,
                ':username' => $username]);
            $verif = $sth->fetchAll();
            
            //Si un email ou username est déjà existant :
            if (count($verif) > 0)
            {
                //On retourne le même message si un user est trouvé
                //Permet de ne pas donner de piste à un HACKER MALVEILLANT
                echo json_encode(['status'=>'success','response' => 'Si aucune adresse mail ou utilisateur n\'est trouvée, le compte sera créé.']);
                exit;
            }

            //Sinon on ajoute l'utilisateur à la base :
            //Requête préparée avec paramètres nommés :
            $string = "INSERT INTO users(email,username,password) VALUES(:email,:username,:pwd);";
            $sth = $connection->prepare($string);
            $pwd = password_hash($pwd,PASSWORD_BCRYPT);
            $sth->execute([
                ':email' => $email,
                ':username' => $username,
                ':pwd' => $pwd]);

            echo json_encode(['status'=>'success','response' => 'Si aucune adresse mail ou utilisateur n\'est trouvée, le compte sera créé.']);
            exit;
        }
        catch (PDOException $ex)
        {
            http_response_code(500);
            echo json_encode($ex->getMessage());
            exit;
        }
        

    }
    if ($action === 'disconnect')
    {
        unset($_SESSION['user_id']);
        unset($_SESSION['user']);

        echo json_encode(['status'=>'success','response'=>'Disconnected']);
    }
    //Si le PHP est appelé depuis la connexion :
    if ($action === 'connect')
    {
        try
        {
            $email = $_POST['email'] ?? '';
            $password = $_POST['pwd'] ?? '';

            if (empty($email) || empty($password))
            {
                //Bad request :
                http_response_code(400);
                echo json_encode(['status'=>'error','response'=>'Merci de remplir tous les champs']);
                exit;
            }

            $string_verify = "SELECT * FROM users WHERE email=:email";
            $sth = $connection->prepare($string_verify);
            $sth->execute([':email' => $email]);
            $resultat = $sth->fetchAll(PDO::FETCH_ASSOC);
            if (count($resultat) == 0)
            {
                //Unauthorized :
                http_response_code(401);
                echo json_encode(['status' => 'error', 'response' => 'Mail ou mot de passe incorrect']);
                exit;
            }
            else if (password_verify($password, $resultat[0]['password']))
            {
                $_SESSION['user_id'] = $resultat[0]['id_user'];
                $_SESSION['user'] = $resultat[0]['username'];
                echo json_encode(['status' => 'success', 'response' => 'Password match']);
                exit;
            }
            else
            {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'response' => 'Mail ou mot de passe incorrect']);
            }
        
        }
        catch (PDOException $ex)
        {
            //Internal error :
            http_response_code(500);
            echo json_encode(['status'=>'error','response'=>$ex->getMessage()]);
            exit;
        }
    }

    //Vérfier la connexion :
    if($action === 'verify-connection')
    {
        if (empty($_SESSION['user_id']))
        {
            http_response_code(401);
            echo json_encode(['status'=>'error','response'=>'Aucun utilisateur connecté']);
            exit;
        }
        else
        {
            echo json_encode(['status'=>'success',
            'response'=>
            [
                'user_id'=> $_SESSION['user_id'],
                'username' => $_SESSION['user']
            ]]);
        }

    }

    //Si le PHP est appelé depuis le popup de modification :
    if ($action === 'modify-note')
    {   
        try
        {
            //Construction d'une requête dynamique :
            $fields = [];
            $params = [];
            
            //On regarde d'abord si le code est appelé simplement pour terminer la tâche:
            //Evite de regarder les autres paramètres pour rien:
            if (isset($_POST['state']) && !empty($_POST['state']))
            {
                $fields['state'] = 'state = :state';
                $params['state'] = trim($_POST['state']);
            }
            else
            {
                //On regarde si le paramètre est rempli, si oui on l'ajoute au tableau :
                if (isset($_POST['title']) && !empty($_POST['title']))
                {
                    $fields['title'] = 'title = :title';
                    $params['title'] =trim($_POST['title']); 
                }
                if (isset($_POST['description']) && !empty($_POST['description']))
                {
                    $fields['description'] = 'description = :description';
                    $params['description'] = trim($_POST['description']); 
                }
                if (isset($_POST['priority']) && !empty($_POST['priority']))
                {
                    $fields['priority'] = 'priority = :priority';
                    $params['priority'] = trim($_POST['priority']); 
                }
                if (isset($_POST['target_date']) && !empty($_POST['target_date']))
                {
                    $fields['target_date'] = 'target_date = :target_date';
                    $params['target_date'] = trim($_POST['target_date']); 
                }
            }
            if(isset($_POST['id']) && !empty($_POST['id']))
            {
                $params['id'] = trim($_POST['id']);
            }
            else
            {
                http_response_code(400);
                echo json_encode(['status'=>'error','response'=>'id vide']);
                exit;
            }

            //Si aucun paramètre n'est rempli par l'utilisateur :
            if (empty($fields) || empty($params))
            {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'response' => 'Merci de remplir au moins un champ']);
                exit;
            }

            //On concatène les paramètres à modifier en un seul string, séparés par une virgule, s'il y en a plus d'un :
            $imploded_fields = implode(",",$fields);

            //On prépare & on exécute la requête : 
            $string_update = "UPDATE Tasks SET $imploded_fields WHERE id_task = :id";
            $sth = $connection->prepare($string_update);
            //PDO va lire un à un les paramètres nommés & associer les valeurs dans la requête :
            $sth->execute($params);
            $response = $sth->fetchAll();
            echo json_encode(['status'=>'success','response'=>$response]);
            exit;
        }
        catch (PDOException $e)
        {
            http_response_code(500);
            echo json_encode(['status'=>'error', 'response' => $e->getMessage()]);
            exit;
        }      

    }
    //Si le PHP est appelé depuis la création d'une note :
    if ($action === 'create-note')
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
            $user_id = $_SESSION['user_id'] ?? '';

            //Vérification des paramètres :
            if (empty($title) ||empty($description) ||empty($priority) ||empty($target_date) || empty($user_id))
            {
                http_response_code(400);
                echo json_encode(['status'=>'error','response'=>'Merci de remplir tous les paramètres']);
                exit;
            }

            //Préparation & exécution de la requête :
            $string_create = "INSERT INTO tasks(title,description,priority,target_date,user_id)
            VALUES (:title,:description,:priority,:target_date,:user_id)";

            $sth = $connection->prepare($string_create);
            $sth->execute([
                ':title' => $title,
                ':description' => $description,
                ':priority' => $priority,
                ':target_date' => $target_date,
                ':user_id' => $user_id
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
            http_response_code(500);
            echo json_encode(['status'=>'error','response'=>$e->getMessage()]);
        }
    }
    if($action === 'delete-note')
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
            http_response_code(500);
            echo json_encode(['status'=>'error','response'=>$e->getMessage()]);
            exit;
        }
    }
}

//Si le php est appelé depuis la fonction d'affichage des notes :
if ($_SERVER['REQUEST_METHOD'] === 'GET')
{
    try
    {
        //On récupère les paramètres passés par le JS :
        $user_id = $_SESSION['user_id'] ?? '';
        if ($user_id == '')
        {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'response' => 'Aucun utilisateur']);
            exit;
        }
        $state = $_GET['state'] ?? '';
        $priority = $_GET['priority'] ?? '';
        $order = $_GET['order'];
        $direcion = $_GET['direction'];
        //Par défaut page 1 avec 100 notes affichées :
        //On cast pour 2 raisons :
        // - Calcul pas possible si string & int
        // - MYSQL n'accepte que des int pour LIMIT & OFFSET : il faut les cast
        $page = (int)($_GET['page'] ?? '');
        $per_page = (int)($_GET['per_page'] ?? '');
        
        
        
        //On construit la requête de base :
        $string_notes = "SELECT * FROM tasks WHERE user_id = :id";
        $params = [];
        $params['id'] = $user_id;
        
        //Si un filtre est appliqué, on doit étendre le WHERE :
        if ($state != '') 
        {
            $string_notes .= " AND state = :state";
            $params['state'] = $state;
        }
        //Deux if séparés pour prendre en compte les deux filtres :
        if ($priority != '')
        {
            $string_notes .= " AND priority = :priority";
            $params['priority'] = $priority;
        }
        //Comme on ne peut passer un nom de colonne dans les paramètres nommés, il faut créer un filtre :
        $order_filter=['target_date','created_at','priority'];
        $direction_filter=['ASC','DESC'];
        //Ensuite on met le ORDER BY en vérifiant que le order & direction sont des valeurs valides :
        if(in_array($order,$order_filter) && in_array($direction,$direction_filter))
        {
            $string_notes .= " ORDER BY $order $direction";
        }
        //On n'ajoute qu'à la fin le LIMIT & OFFSET :
        
        if($page != '' && $per_page != '')
        {

            //Si page == 0 -> pas d'offset :
            $offset = ($page - 1) * $per_page;
            //On peut se permettre de faire de l'interpolation car les paramètres ont été cast explicitement en int :
            //Pas de risque d'injection
            $string_notes.=" LIMIT $per_page OFFSET $offset";
        }
        

        //Préparation de la requête :
        $sth = $connection->prepare($string_notes);
        $sth->execute($params);
        //On récupère un tableau associatif :
        $notes = $sth->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'response' => $notes]);
        exit;
    }
    catch (PDOException $ex)
    {
        http_response_code(500);
        echo
         json_encode(['status' => 'error' , 'response' => $ex->getMessage()]);
        exit;
    }
    

    
    
}
?>
