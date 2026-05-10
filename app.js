
// ---------------------- Récupérer les éléments nécessaires : ---------------------------------------

const formulaire = document.getElementById('form-note');
const message = document.getElementById('message');
const liste_notes = document.getElementById('liste-notes');
const popup = document.getElementById('popup');

//Catégories en scope global :
const notes_basses = null;
const notes_moyennes = null;
const notes_hautes = null;

// ---------------------- Définition des fonctions : -------------------------------------------------


// Afficher les notes
async function afficherNotes()
{
    try
    {
        liste_notes.innerHTML = '';
        //On appelle le PHP, GET par défaut :
        const response = await fetch('api.php');
        const notes = await response.json();
 
        //Si aucune note, afficher message :
        if (notes.length == 0)
        {
            liste_notes.innerHTML = '<p>Aucune note pour l\'instant, ajoutez votre première note...</p>';
        }

        //Créer & afficher les catégories :
        afficherCategories(notes);

        //Sinon, créer les notes :
        notes.forEach($note =>{
            //Créer la carte :
            const current_note = creerCarte($note);
            //Trouver la catégorie associée et y ajouter la carte
            const current_note_priority = document.getElementById($note.priority);
            current_note_priority.appendChild(current_note);
        });
    }
    catch(erreur)
    {
        console.log(erreur.message);
    }
}

function afficherCategories(notes)
{
    //Créer les catégories, permet d'ajouter simplement une categorie si nécessaire
    //en gardant le scope global :
    const priorites = ['basse','moyenne','haute'];
    $index = 0;
    const categories = [notes_basses,notes_moyennes,notes_hautes];

    //Parcours des categories :
    categories.forEach($categorie =>{
        //On crée la catégorie avec la classe associée :
        $categorie = document.createElement('div');
        $categorie.id = priorites[$index];
        //On lui ajoute un titre H2 :
        const categorie_title = document.createElement('h2');
        categorie_title.textContent = priorites[$index];
        $categorie.appendChild(categorie_title);
        //On ajoute la categorie à la liste des notes :
        liste_notes.appendChild($categorie);
        //On incrémente l'index :
        $index++;
        
    });
}

//Créer les cartes correspondantes aux notes récupérées par le PHP 
function creerCarte(note)
{
    try
    {
        //Création de la carte, en reprenant les classes bootstrap (évite de faire 50 lignes de CSS)
        //Div de la carte :
        const note_card = document.createElement('div');
        note_card.className = 'card border-light mb-3';
        note_card.style='max-width: 18rem;';
        //On récupère l'id de la tâche pour la suppression (sans l'afficher) :
        note_card.dataset.id = note.id_task;

        //Header de la note (emoji + date formatée) :
        const note_header = document.createElement('div');
        note_header.className = 'card-header';
        note_header.textContent = `📅 Créée le ${formatDateTime(note.created_at)}`;

        //Div du body de la carte :
        const note_body = document.createElement('div');
        note_body.className = 'card-body';

        //titre de la note :
        const note_title = document.createElement('h5');
        note_title.className = 'note-title';
        note_title.textContent = note.title;
        
        //Description de la note :
        const note_description = document.createElement('p');
        note_description.className = 'note-description';
        note_description.textContent = note.description;
        
        //Statut de la note :
        const note_state = document.createElement('p');
        note_state.className = 'note-state';
        note_state.textContent = note.state;

        //Priorité de la note :
        const note_priority = document.createElement('p');
        note_priority.id = 'note-priority';
        note_priority.textContent = 'Priorité : '+note.priority;
        //Date de rendue :
        const note_target_date = document.createElement('p');
        //Permet de mettre en évidence si la date de rendue est dépassée :
        const is_late = new Date(note.target_date) < Date.now();
        //Si la note est en retard, en évidence :
        note_target_date.className = is_late ? 'text-danger' : 'text-success';
        note_target_date.classList.add('target-date');
        note_card.style.backgroundColor = is_late ? 'rgba(248, 8, 8, 0.2)' : 'white';
        // Texte :
        note_target_date.textContent = `📅 Date de rendue : ${formatDate(note.target_date)}`;
        //Ajout de la date de rendue au dataset pour l'ajouter dans le popup:
        note_card.dataset.target_date = note.target_date;
        //Actions sur la note :
        const delete_note = document.createElement('button');
        delete_note.className = 'logo-crud';
        delete_note.textContent = '🗑️';
        //EventListener : au clic du bouton on déclenche la fonction supprimerNote
        //en lui passant l'id de la note & la carte :
        delete_note.addEventListener('click', ()=>supprimerNote(note.id_task, note_card));

        //EventListener : ouvrir un popoup pour modifier la note
        const modify_note = document.createElement('button');
        modify_note.className = 'logo-crud';
        modify_note.textContent = '📝';
        modify_note.addEventListener('click', ()=>ouvrirPopup(note.id_task));

        //Bouton pour marquer la tâche commme terminée :
        //Ce bouton doit désactiver les modifs de la tâche et la rendre verte
        const fulfill_note = document.createElement('button');
        fulfill_note.className = 'logo-crud';
        

        //Ajouter les éléments au body de la card :
        //Plus simple à maintenir, suffit d'ajouter un élément au tableau :
        const elements =[
            note_title,
            note_description,
            note_state,
            note_priority,
            note_target_date,
            delete_note,
            modify_note
        ];

        elements.forEach($element =>{
            note_body.appendChild($element);
        });

        //On ajoute le header & le body à la carte :
        note_card.appendChild(note_header);
        note_card.appendChild(note_body);

        return note_card;
    }
    catch(erreur)
    {
        afficherMessage(erreur, 'text-danger');
        return null;
    }
    
}

//Construction du popup :
function construirePopup()
{
    //Cloner le formulaire pour éviter le code HTML duppliqué :
    const cloned_formulaire = formulaire.cloneNode([deep=true]);
    cloned_formulaire.id ='modif-form';

    //On l'ajoute au popup :
    const div_test = document.getElementById('popup-modif');
    div_test.appendChild(cloned_formulaire);

    //On modifie le contenu du bouton :
    const button_modif = cloned_formulaire.querySelector('#form-btn');
    button_modif.textContent = 'Modifier la note';

    //On autorise les champs vides pour que l'utilisateur choisisse quoi modifier :
    //"required" ne prend pas de valeur, on le retire donc
    cloned_formulaire.querySelector('#description').removeAttribute("required");
    cloned_formulaire.querySelector('#title').removeAttribute("required");

    //On modifie l'action du formulaire en ciblant l'hidden input :
    cloned_formulaire.querySelector('#action-form').value = 'modify-note';

    //Ajouter le bouton pour fermer le popup :
    const button_close = document.createElement('button');
    button_close.textContent = 'Fermer le popup';
    button_close.addEventListener('click', () => fermerPopup());
    button_close.classList.add('form-btn');
    popup.appendChild(button_close);

    //Ajouter un eventListener au formulaire de modification :
    cloned_formulaire.addEventListener('submit', async function(evenement)
    {
        try
        {
            //Empêcher le rafraîchissement de la page :
            evenement.preventDefault();

            //Empêcher les doubles appels :
            const button = cloned_formulaire.querySelector('#form-btn');
            button.disabled = true;
            button.textContent = 'Modification en cours...';

            //Récupérer les données du formulaire avec FormData :
            const donnees = new FormData(cloned_formulaire);
            console.log(donnees['target_date']);
            //On récupère l'id de la carte pour savoir laquelle modifier :
            const card = popup.querySelector('.card');
            const id_card = card.dataset.id;
            
            //On l'ajoute au body :
            donnees.append('id',`${id_card}`);
            const response = await fetch('api.php',
                {
                    method: 'POST',
                    body: donnees
                }
            );

            const resultat = response.json();
            if (response.status === 'error')
            {
                afficherMessage(response.response, 'text-danger');
            }

            button.disabled = false;
            button.textContent ='Modifier la note';
            fermerPopup();
            afficherNotes();
            console.log(response.response);
            afficherMessage('Note modifiée avec succès ! ✅');
        }
        catch (e)
        {
            afficherMessage(e, 'text-danger');
        }
        


        
    });
}

//Fonction pour ouvrir un popup en fonction de la tâche
function ouvrirPopup(note_id)
{
    //On ajoute la classe open au popup :
    popup.classList.add('open');
    //On récupère l'élément possédant la classe card et dont l'id correspond à l'id de la note à modifier
    const note_to_modify = liste_notes.querySelector(`.card[data-id="${note_id}"]`);
    //On la clone :
    const cloned_note = note_to_modify.cloneNode(true);
    cloned_note.id = 'cloned-note';
    //Enlever les 2 logos CRUD :
    cloned_note.querySelector('.logo-crud').remove();
    cloned_note.querySelector('.logo-crud').remove();

    //Puis on récupère la div 'popup-actuel' pour lui ajouter :
    const popup_actuel = popup.querySelector('#popup-actuel');
    popup_actuel.appendChild(cloned_note);

    //Modification des champs par defaut, pour que ça match avec ceux de la note :
    const champ_date = popup.querySelector('#target_date');
    const champ_priority = popup.querySelector('#priority');

    //On récupère la data dans le dataset de la carte & on l'assigne :
    const default_date = cloned_note.dataset.target_date;
    champ_date.value = default_date;
    
    //On récupère la priorité actuelle en la reformattant :
    let selected_priority = cloned_note.querySelector('#note-priority').textContent.replace('Priorité : ','');

    //Et pour l'option dont la value correspond, on lui ajoute l'attribut 'selected' :
    champ_priority.querySelector(`option[value=${selected_priority}]`).setAttribute('selected','');
}

function fermerPopup()
{
    //On enlève la classe open :
    popup.classList.remove('open');
    //On retire la note du popup en la retirant du popup :
    popup.querySelector('.card').remove();
}

//Affichage du message dans la div message, avec le contenu & le type envoyé, par défaut success :
function afficherMessage(texte, type = 'text-success')
{
    const message = document.getElementById('message');
    message.textContent = texte;
    message.className = type;
    message.style.display = 'block';

    //Disparition du message après 3s :
    setTimeout(() =>
        {
            message.style.display = 'none';
        }
    ,3000);

}

//Fonction supprimerNote appelée depuis le bouton correspondant :
async function supprimerNote(id, card)
{
    if(!confirm('Supprimer cette note ?')) return;

    try
    {
        //Construction des données avec FormData() :
        const donnees = new FormData();
        //Id de la carte :
        donnees.append('id',id);
        //Spécifier l'action :
        donnees.append('action','delete-note');

        //Construction de la requête vers api.php :
        const response = await fetch('api.php',
            {
                method: 'POST',
                body: donnees
            }
        );

        const resultat = await response.json();

        if (resultat.status == 'success')
        {
            //On enlève la card du DOM, pas besoin de raffraîchir :
            card.remove();
            afficherMessage('Note supprimée !');
        }
        else
        {
            afficherMessage(resultat.response, 'text-danger');
        }

    }
    catch(erreur)
    {
        afficherMessage(erreur,'text-danger');
    }
}

//Pas besoin de fonction, mais d'un eventListener pour le formulaire de création de note :
formulaire.addEventListener('submit', async function(evenement)
{
    //Pas de rechargement de la page (on évvite le comportement par défaut) : 
    try
    {
        evenement.preventDefault();

        const button = document.getElementById('form-btn');
        //Désactive le bouton pendant l'envoi du formulaire :
        button.disabled = true;
        button.textContent = 'Envoi en cours...';

        //On forme les données à l'aide de FormData :
        const donnees = new FormData(formulaire);

        //Requête vers api.php en POST avec les donnees du formulaire :
        const response = await fetch('api.php',
            {
                method: 'POST',
                body: donnees
            }
        );

        const resultat = await response.json();

        //Si une erreur est déclenchée :
        if (resultat.status == 'error')
        {
            afficherMessage(resultat.response, 'text-danger');
            return;
        }
        console.log(resultat.response.id_task);
        //On réactive le bouton :
        button.disabled = false;
        button.textContent = 'Ajouter la note';

        //Message de débug & clear le formulaire :
        afficherMessage('Note ajoutée avec succès ! ✅');
        formulaire.reset();

        //On crée la carte :
        const response_card = resultat.response;
        const new_card = creerCarte(response_card);

        //On récupère la priorité de la note (basse, moyenne ou haute) :
        const new_card_priority= new_card.querySelector('#note-priority');
        //On veut seulement garder le titre de la catégorie :
        const priority_title = new_card_priority.textContent.replace('Priorité : ','');

        //On récupère la catégorie portant le même nom :
        const new_card_categorie = document.getElementById(priority_title);
        /*
            insertBefore(nouvelleCarte, listeNotes.firstChild)
            → insère avant le premier enfant (= en haut de la liste)
            
            Si la liste est vide, firstChild = null → appendChild
        */
        if (new_card_categorie.firstChild && new_card_categorie.firstChild.tagName !== 'P') 
        {
            //Insérer avant le premier élément & après le titre :
            new_card_categorie.insertBefore(new_card, new_card_categorie.children[1]);
        } 
        else 
        {
            new_card_categorie.appendChild(nouvelleCarte);
        }
    }
    catch (e)
    {
        afficherMessage(e, 'text-danger');
    }
    
});



//Formater la date & heure : 
function formatDateTime (dateStr)
{
    const date = new Date(dateStr.replace(' ', 'T')); // ISO 8601
    return date.toLocaleDateString('fr-FR', {
        day:    'numeric',
        month:  'long',
        year:   'numeric',
        hour:   '2-digit',
        minute: '2-digit'
    });
}

//Formater la date :
function formatDate(dateStr)
{
    const date = new Date(dateStr.replace(' ', 'T')); // ISO 8601
    return date.toLocaleDateString('fr-FR', {
        day:    'numeric',
        month:  'long',
        year:   'numeric',
    });
}

//Enlever le format appliqué :
function unformatDate(dateStr)
{
    //Enlever '📅 Date de rendue : '
    const date = new Date(dateStr.replace('📅 Date de rendue : ',''));
    return date.toLocaleDateString('fr-FR',{ dateStyle: 'short' });
}

// ---------------------- Code principal : -----------------------------------------------------------

// On récupère le titre de la page pour décider de quelle fonction s'exécute :
const titre_page = document.title;

//Si le JS est appelé depuis index.html :
if (titre_page == 'Liste des notes')
{
    afficherNotes();
    construirePopup();
}

//Si le JS est appelé depuis connexion.php :
if (titre_page == 'Connexion')
{

}
