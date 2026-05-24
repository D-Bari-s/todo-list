
// ---------------------- Récupérer les éléments nécessaires : ---------------------------------------

const formulaire = document.getElementById('form-note');
const message = document.getElementById('message');
const liste_notes = document.getElementById('liste-notes');
const popup = document.getElementById('popup');
const overlay = document.querySelector('#overlay');
const disconnect_btn = document.querySelector('#disconnect-btn');

const priority_select = document.querySelector('#priority-select');
const state_select = document.querySelector('#state-select');
const per_page = document.querySelector('#per-page');
const page_form = document.querySelector('#page-form');
console.log(page_form);
// On récupère le titre de la page pour décider de quelle fonction s'exécute :
const titre_page = document.title;

//Catégories en scope global :
const notes_basses = null;
const notes_moyennes = null;
const notes_hautes = null;

//Page :
var page = 1;
var max_page = 0;
// ---------------------- Définition des fonctions : -------------------------------------------------


//----------------- Afficher les cartes & catégories construites : -----------------
async function afficherNotes(order = null, direction = null)
{
    try
    {
        //On récupère toutes les notes de l'utilisateur pour calculer max page :
        const notes_all = await fetch('api.php');
        const all_json = await notes_all.json();
        max_page = Math.ceil(all_json.response.length / per_page.value);

        //On vide le contenu HTML avant d'insérer :
        liste_notes.innerHTML = '';
        //On récupère les paramètres au besoin, permet d'avoir une seule fonction si les filtres sont appelés :
        let params = [];
        const state = state_select.value;
        const priority = priority_select.value;
        const per_page_value = per_page.value;

        if (state != '')
        {  
            params.push(`state=${state}`);
        }
        //2 if séparés pour prendre en compte les deux filtres :
        if (priority != '')
        {
            params.push(`priority=${priority}`);
        }

        if (page != '') params.push(`page=${page}`);
        if (per_page_value != '') params.push(`per_page=${per_page_value}`);
        if (order != null) params.push(`order=${order}`);
        if (direction != null) params.push(`direction=${direction}`);

        const string_fetch = 'api.php?'+params.join('&');
        
        //On appelle le PHP, GET par défaut :
        const response = await fetch(
            string_fetch, 
            {method: 'GET'}
        );
        const resultat = await response.json();
        const notes = resultat.response;
        if (resultat.status == 'error')
        {
            afficherMessage(resultat.response,'text-danger');
        }
        //Si aucune note, afficher message :
        if (notes.length == 0)
        {
            liste_notes.innerHTML = '<p>Aucune note pour l\'instant, ajoutez votre première note...</p>';
            return;
        }
        //Affichage des pages :
        const button_down = document.querySelector('button[value="down"]');
        const button_up = document.querySelector('button[value="up"]');
        if(per_page_value == '')
        {
            document.querySelector('#page-form').style.opacity = '0';
            button_down.disabled = true;
            button_up.disabled = true;
        }
        if (per_page_value != '')
        {
            button_down.disabled = false;
            button_up.disabled = false;
            document.querySelector('#page-form').style.opacity = '1';
            document.querySelector('#current-page').textContent = 'Page '+page+' / '+max_page;

            if (page == 1)
            {
                button_down.disabled = true;
                button_down.style.opacity = '0.5';
            }
                
            else 
            {
                button_down.disabled = false;
                button_down.style.opacity = '1';
            }

            if (page == max_page)
            {
                button_up.disabled = true;
                button_up.style.opacity = '0.5';
            }
            else 
            {
                button_up.disabled = false;
                button_up.style.opacity = '1';
            }
        }
        

        //Sinon, créer les notes :
        let is_first = true;
        notes.forEach($note =>{
            //Créer la carte :
            const current_note = creerCarte($note);
            //Gérer l'affichage des cards avec Bootstrap :
            if (is_first)
            {
                liste_notes.appendChild(current_note);
                is_first = false;
            }
            else liste_notes.insertBefore(current_note, liste_notes.children[0]);
            last_note = current_note;
        });
        
    }
    catch(erreur)
    {
        console.log(erreur.message);
    }
}

//----------------- Requête vers PHP & création des cartes avec données récupérées : ----------------- 
function creerCarte(note)
{
    try
    {
        //Création de la carte, en reprenant les classes bootstrap (évite de faire 50 lignes de CSS)
        //------------ Carte : ------------
        const note_card = document.createElement('div');
        note_card.className = 'note-card';
        
        //On récupère l'id de la tâche pour la suppression (sans l'afficher) :
        note_card.dataset.id = note.id_task;
        const is_finished = note.state == 'terminée';

        //------------ Header de la note : ------------
            // const note_header = document.createElement('div');
            // note_header.classList.add('card-header');
        //Titre du header :
        const note_title = document.createElement('h5');
        note_title.classList.add('note-title');
        note_title.textContent = note.title;

        //Date de création du header :
        const note_created_at = document.createElement('span');
        note_created_at.classList.add('note-created-at','mb-0','text-muted','badge');
        note_created_at.textContent = `📅 Créée le ${formatDateTime(note.created_at)}`;

        //Description de la note :
        const note_description = document.createElement('p');
        note_description.classList.add('note-description','mb-0');
        note_description.textContent = note.description;
            // note_body.appendChild(note_description);

        //------------ 1er footer de la carte : ------------
        const note_infos = document.createElement('div');
        note_infos.classList.add('infos-card','d-flex','justify-content-between','align-items-center','flex-wrap','gap-2');

        //Priorité de la note :
        const note_priority = document.createElement('span');
        note_priority.id = 'note-priority';
        note_priority.classList.add('badge');
        note_priority.textContent = '🔔 '+note.priority;

        //Statut de la note :
        const note_state = document.createElement('span');
        note_state.classList.add('note-state', 'badge' , 'rounded-pill');
        if (is_finished) note_state.classList.add('badge-success');
        note_state.textContent = '✏️ '+note.state[0].toUpperCase()+note.state.slice(1);
        note_card.style = is_finished ? 'border-left: 8px solid green' : 'border-left: 8px solid rgb(219, 216, 18)';
        
        //Date de rendue :
        const note_target_date = document.createElement('small');
        note_target_date.textContent = `🎯 ${formatDate(note.target_date)}`;
        note_target_date.classList.add('badge', 'rounded-pill','target-date');

        //Si la note est en cours :
        if (!is_finished)
        {
            //Permet de mettre en évidence si la date de rendue est dépassée :
            const is_late = new Date(note.target_date) < Date.now();
            //Si la note est en retard, en évidence :
            if(is_late) note_target_date.classList.add('badge-danger');
            note_card.style = is_late ? 'border-left: 8px solid red' : 'border-left: 8px solid rgb(219, 216, 18)';
        }

        //Append le footer 1 : 
        note_infos.appendChild(note_priority);
        note_infos.appendChild(note_state);
        note_infos.appendChild(note_target_date);

        //Ajout de la date de rendue au dataset pour l'ajouter dans le popup:
        note_card.dataset.target_date = note.target_date;

        //------------ 2eme footer de la carte : ------------
        const note_actions = document.createElement('div');
        note_actions.classList.add('actions-card','d-flex','gap-10');

        //---- Actions sur la carte (CRUD): ----
        //Supprimer la note :
        const delete_note = document.createElement('button');
        delete_note.classList.add('logo-crud','delete-note');
        delete_note.textContent = 'Supprimer';
        //EventListener : au clic du bouton on déclenche la fonction supprimerNote
        //en lui passant l'id de la note & la carte :
        delete_note.addEventListener('click', ()=>supprimerNote(note.id_task, note_card));
        note_actions.appendChild(delete_note);
 
        //On ajoute les boutons à la fin de la card uniquement si la tâche n'est pas terminée :
        if (!is_finished)
        {
            //EventListener : ouvrir un popoup pour modifier la note
            const modify_note = document.createElement('button');
            modify_note.classList.add('logo-crud','modify-note');
            modify_note.textContent = 'Modifier';
            modify_note.addEventListener('click', () => ouvrirPopup(note.id_task));
            note_actions.appendChild(modify_note);

            //Bouton pour marquer la tâche commme terminée :
            //Ce bouton doit désactiver les modifs de la tâche et la rendre verte
            const fulfill_note = document.createElement('button');
            fulfill_note.classList.add('logo-crud','fulfill-note');
            fulfill_note.textContent = 'Terminer';
            fulfill_note.addEventListener('click', () => terminerNote(note.id_task, note_card));
            note_actions.appendChild(fulfill_note);
        }


        //On ajoute le header & le body à la carte :
        const elements = [note_title, note_created_at, note_description, note_infos, note_actions];
        elements.forEach(element => note_card.appendChild(element));
        return note_card;
    }
    catch(erreur)
    {
        afficherMessage(erreur, 'text-danger');
        return null;
    }
    
}

//----------------- Construction du popup & copie du formulaire : -----------------
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
            const card = popup.querySelector('.note-card');
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
            cloned_formulaire.reset();
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
    //On ajoute le popup à l'overlay :
    overlay.appendChild(popup);
}

//----------------- Ouvrir le popup et remplir son contenu : -----------------
function ouvrirPopup(note_id)
{
    //On ajoute la classe open à l'overlay :
    overlay.classList.add('open');

    //On récupère l'élément possédant la classe card et dont l'id correspond à l'id de la note à modifier
    const note_to_modify = liste_notes.querySelector(`.note-card[data-id="${note_id}"]`);
    //On la clone :
    const cloned_note = note_to_modify.cloneNode(true);
    cloned_note.id = 'cloned-note';
    //Enlever les 3 logos :
    cloned_note.querySelector('.logo-crud').remove();
    cloned_note.querySelector('.logo-crud').remove();
    cloned_note.querySelector('.logo-crud').remove();
    //Puis on récupère la div 'popup-actuel' pour lui ajouter :
    const popup_actuel = popup.querySelector('#popup-actuel');
    popup_actuel.appendChild(cloned_note);

    //Modification des champs par defaut, pour que ça match avec ceux de la note :

    //Date & Priorité
    const champ_date = popup.querySelector('#target_date');
    const champ_priority = popup.querySelector('#priority');

    //On récupère le champ du titre
    const champ_title = popup.querySelector('#title');
    //on le modifie avec le titre de la note en cours: 
    champ_title.value = popup.querySelector('.note-title').textContent;

    //On récupère le champ de description: 
    const champ_description = popup.querySelector('#description');
    //on le modifie avec la description de la note en cours :
    champ_description.textContent = popup.querySelector('.note-description').textContent;

    //On récupère la data dans le dataset de la carte & on l'assigne :
    const default_date = cloned_note.dataset.target_date;
    champ_date.value = default_date;
    
    //On récupère la priorité actuelle en la reformattant :
    let selected_priority = cloned_note.querySelector('#note-priority').textContent.replace('🔔 ','');

    //Et pour l'option dont la value correspond, on lui ajoute l'attribut 'selected' :
    champ_priority.querySelector(`option[value=${selected_priority}]`).setAttribute('selected','');
}


//----------------- Fermer le popup & vider son contenu : -----------------
function fermerPopup()
{
    //On enlève la classe open :
    overlay.classList.remove('open');
    popup.classList.remove('open');
    //On retire la note du popup en la retirant du popup :
    popup.querySelector('.note-card').remove();
}

//----------------- Afficher un message dans la div 'message' : -----------------
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

//----------------- Supprimer une note, appelée depuis un bouton : -----------------
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
            afficherNotes();
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

//----------------- Terminer une tâche (SQL & visuellement) : -----------------
async function terminerNote(note_id, note_card)
{
    //Lorsqu'une tâche est terminée, on ne doit plus pouvoir la modifier
    //Elle doit être mise en valeur pour être reconnaissable

    //Confirmation 
    if (!confirm('Terminer cette tâche ? \nIl ne sera plus possible de modifier cette tâche')) return;

    try
    {
        const donnees = new FormData();
        donnees.append('id',note_id);
        donnees.append('action', 'modify-note');
        donnees.append('state','terminée');
        const response = await fetch('api.php',
            {
                method: 'POST',
                body: donnees
            }
        );

        const resultat = await response.json();

        if (resultat.status == 'error')
        {
            afficherMessage(resultat.response, 'text-danger');
            return;
        }

        //Supprimer le bouton modifier & terminer: 
        note_card.querySelector('.fulfill-note').remove();
        note_card.querySelector('.modify-note').remove();

        //Modifier les propriétés visuelles :
        note_card.backgroundColor = 'rgba(44, 147, 65, 0.3)';

        //Affichage: 
        afficherNotes();
        afficherMessage('Note terminée avec succès ! ✅');
    }
    catch (e)
    {
        //Gestion erreur :
        afficherMessage(e,'text-danger');
    }
}

//----------------- EventListener pour la création de notes : -----------------
//Ne peut être chargée que depuis Liste des notes
if (titre_page == 'Liste des notes')
{
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


            if (liste_notes.firstChild && liste_notes.firstChild.tagName !== 'P') 
            {
                //Insérer avant le premier élément :
                liste_notes.insertBefore(new_card, liste_notes.children[0]);
            } 
            else 
            {
                liste_notes.appendChild(new_card);
            }
            afficherNotes();
        }
        catch (e)
        {
            afficherMessage(e, 'text-danger');
        }
        
    });

    //------------ eventListener sur les <select> de filtre ------------

    //On appelle afficherNotes en lui passant les paramètres choisis :
    // const priority_select = document.querySelector('#priority-select');
    priority_select.addEventListener('change', () => afficherNotes());

    //On appelle afficherNotes en lui passant les paramètres choisis :
    // const state_select = document.querySelector('#state-select');
    state_select.addEventListener('change', () => afficherNotes());

    //------------ eventListener sur le formulaire de tri ------------
    const ordre_form = document.querySelector('#ordre-form');
    ordre_form.addEventListener('submit', function(evenement){
        try
        {
            evenement.preventDefault();
            const value = evenement.submitter.value;
            //colonne dans order[0] & ordre dans order[1]
            const order_form = value.split(" ");
            const donnees = new FormData(ordre_form);
            //On ajoute les valeurs à donnees
            donnees.append('order',order_form[0]);
            donnees.append('direction',order_form[1]);
            //On appelle afficherNotes avec les paramètres récupérés
            afficherNotes(order_form[0],order_form[1]);
        }
        catch (ex)
        {
            afficherMessage(ex,'text-danger');
        }
    });

    //Sélection du nombre de notes par page :
    per_page.addEventListener('change', () => afficherNotes());

    //Choix de la page :
    page_form.addEventListener('submit', function(evenement)
    {
        evenement.preventDefault();
        const action = evenement.submitter.value;
        page = action == 'up' ? page+1 : page-1;
        afficherNotes();
    });

}

//----------------- Formater date & heure : -----------------
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

//----------------- Formater la date : -----------------
function formatDate(dateStr)
{
    const date = new Date(dateStr.replace(' ', 'T')); // ISO 8601
    return date.toLocaleDateString('fr-FR', {
        day:    'numeric',
        month:  'long',
        year:   'numeric',
    });
}

//----------------- Déconnexion via bouton : -----------------
disconnect_btn.addEventListener('click',async function(evenement){
    try
    {
        evenement.preventDefault();
        if (!confirm('Confirmer la déconnexion ?')) return;
        donnees = new FormData();
        donnees.append('action','disconnect');
        const response = await fetch('api.php',
            {
                method: 'POST',
                body: donnees
            }
        );
        const resultat = await response.json();
        if (resultat.status == 'error')
        {
            afficherMessage(resultat.response,'text-danger');
            return;
        }
        document.location.href = 'connexion.php';

    }
    catch (e)
    {
        afficherMessage(e,'text-danger');
    }
    
});


//----------------- Vérifier connexion utilisateur : -----------------

//Comme on n'appelle que le JS depuis l'HTML, la sécurité est très limitée, car le JS n'est appelé qu'après le code HTML
//Si on avait voulu une sécurité optimale, on aurait implémenté du PHP pour vérifier la session car exécuté côté serveur
//Et exécuté avant le code HTML
async function verifConnection()
{
    try
    {
        const donnees = new FormData();
        donnees.append('action','verify-connection');
        const response = await fetch('api.php',
        {
            method: 'POST',
            body: donnees
        });
        resultat = await response.json();
        //S'il y a une erreur, ou utilisateur non connecté, rediriger vers connexion.php :
        if (resultat.status == 'error')
        {
            document.location.href='connexion.php';
        }

        document.querySelector('#message-accueil').textContent += ' de '+resultat.response.username;
    }
    catch (e)
    {
        afficherMessage (e,'text-danger');
        return e;
    }
}

// ---------------------- Code principal : -----------------------------------------------------------


//Si le JS est appelé depuis index.html :
if (titre_page == 'Liste des notes')
{
    
    verifConnection();
    afficherNotes();
    construirePopup();
}

//Si le JS est appelé depuis connexion.php :
else if (titre_page == 'Connexion')
{
    const connect_form = document.querySelector('#connect-form');
    //eventListener sur le formulaire:
    connect_form.addEventListener('submit', async function(evenement){
        try
        {
            evenement.preventDefault();
            const donnees = new FormData(connect_form);
            const response = await fetch('api.php',{
                method: 'POST',
                body: donnees
            });
            console.log(response);
            resultat = await response.json();
            if(resultat.status == 'success' && resultat.response == 'Password match')
            {
                document.location.href = 'index.html';
            }
            else
            {
                afficherMessage(resultat.response,'text-danger');
            }
        }
        catch (e)
        {
            afficherMessage(e,'text-danger');
        }
    });
}

else if (titre_page == 'Inscription')
{
    const inscription_form = document.querySelector('#inscription-form');
    //eventListener sur le formulaire:
    inscription_form.addEventListener('submit', async function(evenement){
        try
        {
            evenement.preventDefault();

            const donnees = new FormData(inscription_form);
            const response = await fetch('api.php',{
                method: 'POST',
                body: donnees
            });
            resultat = await response.json();
            if(resultat.status == 'success')
            {
                afficherMessage(resultat.response,'text-success');
            }
            else
            {
                afficherMessage(resultat.response,'text-danger');
            }
            inscription_form.reset();
        }
        catch (e)
        {
            afficherMessage(e,'text-danger');
        }
    });
}