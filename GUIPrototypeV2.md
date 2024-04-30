# Graphical User Interface Prototype - FUTURE

Authors:

Date:

Version:

Il prototipo di GUI realizzato per la versione corrente possiede solo il layout browser, essendo un'applicazione web; supponendo il front-end realizzato in modo responsive, tale layout rimane valido sia per un utilizzo desktop, che per un utilizzo da smartphone.

Il [documento completo](/GUIs/version2/version2.pdf) contiene tutti i possibili layout, incluse le eccezioni: per esse è stato talvolta realizzato un unico layout dedicato, il quale raggruppa le caratteristiche comuni di diversi scenari, relativi al medesimo caso d'uso (ad esempio i casi di presenza di input di testo o filtri di ricerca non validi); esso contiene i link funzionanti sui bottoni, consentendo la navigazione tra i diversi layout: tali link sono generalmente (ma non in tutti i casi) riferiti ai casi d'uso di alto livello, pertanto puntano ad una singola versione di un dato layout, tra quelle presenti, il quale può realizzarsi sia nella versione ufficiale, che in quelle alternative.

Nel documento sono presenti note a margine di alcuni layout (sia ufficiali che alternativi), per evidenziare meglio lo svolgimento degli scenari interessati e le diverse funzionalità dei link presenti, che variano a seconda dell'utente (cliente o manager), o, più frequentemente, da dati immessi all'interno dei form oppure dall'esito di operazioni fallibili, come il pagamento o l'aggiunta di un prodotto al carrello.

Di seguito si elencano i prototipi di interfaccia grafica dei casi d'uso principali, nella loro versione nominale:

- Pagina iniziale del negozio virtuale(root dell'applicazione web):
![Homepage](/GUIs/version2/media/index.png)

- Lista prodotti trovati da un utente non autenticato:
![Prodotti](/GUIs/version2/media/products_retrieved_general.png)

- Form di registrazione:
![Sign up](/GUIs/version2/media/sign_up.png)

- Profilo utente:
    - cliente:![Profilo cliente](/GUIs/version2/media/user_info.png)
    - manager:![Profilo manager](/GUIs/version2/media/user_info%20(user_info_manager).png)

- Modifica password:
    - cliente:![Modifica password](/GUIs/version2/media/new_password.png)
    - manager: ![Modifica password](/GUIs/version2/media/new_password%20(manager).png)

- Impostazione di un'informazione del cliente (qui mostrato solo per l'indirizzo di consegna):
![Impostazione indirizzo di consegna](/GUIs/version2/media/add_address.png)

- Homepage di un cliente:
![Home cliente](/GUIs/version2/media/index_customer.png)

- Lista prodotti trovati da un cliente:
![Prodotti lato cliente](GUIs/version2/media/products_retrieved_customer.png)

- Lista acquisti effettuati da un cliente:
![Acquisti cliente](GUIs/version2/media/products_retrieved_customer_already_purchased.png)

- Ricerca recensioni effettuate da un cliente:
![Ricerca recensioni cliente](GUIs/version2/media/reviews_customer.png)

- Lista recensioni effettuate da un cliente:
![Lista recensioni cliente](GUIs/version2/media/reviews_retrieved_customer.png)

- Inserimento nuova recensione:
![Nuova recensione](GUIs/version2/media/insert_review.png)

- Modifica recensione esistente:
![Modifica recensione](GUIs/version2/media/modify_review.png)

- Carrello corrente:
    - possibilità di acquisto:![Carrello](/GUIs/version2/media/cart_products.png)
    - necessario inserimento informazioni:![Carrello](/GUIs/version2/media/cart_products%20(cart_products_no_info).png)

- Storico carrelli:
![Storico](/GUIs/version2/media/cart_history.png)

- Tracking della spedizione di un carrello:
![Tracking](/GUIs/version2/media/cart_tracking.png)

- Homepage di un manager:
![Home manager](GUIs/version2/media/index_manager.png)

- Lista prodotti trovati da un manager:
![Prodotti lato manager](GUIs/version2/media/products_retrieved_manager.png)

- Lista recensioni trovate da un manager:
![Lista recensioni negozio](GUIs/version2/media/reviews_retrieved_manager.png)


