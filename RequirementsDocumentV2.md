# Requirements Document - future EZElectronics

Date:

Version: V1 - description of EZElectronics in FUTURE form (as proposed by the team)

| Version number | Change |
| :------------: | :----: |
|                |        |

# Contents

- [Requirements Document - future EZElectronics](#requirements-document---future-ezelectronics)
- [Contents](#contents)
- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non Functional Requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
    - [Use case 1, UC1](#use-case-1-uc1)
      - [Scenario 1.1](#scenario-11)
      - [Scenario 1.2](#scenario-12)
      - [Scenario 1.x](#scenario-1x)
    - [Use case 2, UC2](#use-case-2-uc2)
    - [Use case x, UCx](#use-case-x-ucx)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description

EZElectronics (read EaSy Electronics) is a software application designed to help managers of electronics stores to manage their products and offer them to customers through a dedicated website. Managers can assess the available products, record new ones, and confirm purchases. Customers can see available products, add them to a cart and see the history of their past purchases.

# Stakeholders

| Stakeholder name | Description |
| :--------------: | :---------: |
| Utente non autenticato |                     Utente non registrato presso la piattaforma, la sua attività principale riguarda registrazione e login                     |
|        Cliente         |              Utente autenticato le cui attività principali sono l'acquisto e la visualizzazione di prodotti attraverso l'applicazione               |
|        Manager         | Utente autenticato la cui attività principale è la gestione dei prodotti, sia in entrata che in uscita dal negozio virtuale |
| Admin | Amministratore del sistema, la sua attività principale è risolvere eventuali problematiche, garantendo il corretto funzionamento del sistema|
|       Produttore       |     Azienda che produce gli oggetti che verranno messi in vendita attraverso la piattaforma     |
|      Distributore      |          Azienda che distribuisce i prodotti, dal produttore al venditore (_Manager_)       |
| Fornitori di pubblicità | Azienda i cui prodotti sono pubblicizzati nei banner presenti all'interno dell'applicazione |
| Servizi di pagamento | Aziende che si occupano di garantire il corretto funzionamento delle transazioni di pagamento |
| Servizio di spedizione | Azienda che si occupa del trasporto dei prodotti dal venditore (_Manager_) al cliente |

# Context Diagram and interfaces

## Context Diagram
![Context diagram](/media/version2/context_diagram.png)

**Attori**:
- Utente non autenticato: può solamente effettuare login oppure registrarsi presso la piattaforma, se ancora non possiede un account;
- Cliente: ha la possibilità di visualizzare ed acquistare i prodotti, tenendo traccia delle proprie transazioni, attraverso la creazione dei carrelli virtuali;
- Manager: ha la possibilità di effettuare operazioni sui prodotti del negozio, tenendo traccia degli arrivi e delle quantità presenti e vendute.
- Admin: ha la possibilità di effettuare ogni operazione su ogni entità presente nel sistema
- Servizio di pagamento: API per effettuare transazioni tra manager e cliente
- Servizio di pubblicità: API per mostrare banner pubblicitari all'interno dell'applicazione
- Servizio di spedizione: API per creare la spedizione ed effettuare il tracking

## Interfacce

|         Attore         | Interfaccia logica | Interfaccia fisica |
| :--------------------: | :----------------: | :----------------: |
| Utente non autenticato |        GUI         |   PC/Smartphone    |
|        Cliente         |        GUI         |   PC/Smartphone    |
|        Manager           |        GUI         |   PC/Smartphone    |
|        Admin           |        GUI         |   PC/Smartphone    |
|Servizio di pagamento   |        API         |   Internet    |
|Servizio di pubblicità  |        API         |   Internet    |
|Servizio di spedizione  |        API         |   Internet    |


# Stories and personas

**Manager**

Persona: Franco, 45 anni, manager di un negozio online

- Franco vuole essere in grado di visionare la merce disponibile nel suo negozio
- Franco vuole monitorare l'arrivo degli ordini effettuati
- Franco vuole poter sapere quante della sua merce è stata venduta
- Franco vuole poter eliminare i prodotti dal proprio catalogo
- Franco vuole essere in grado di inserire più prodotti dello stesso modello nel proprio catalogo in poco tempo
- Franco vuole potersi disconnettere dal proprio account nel caso in cui lo desiderasse
- Franco vuole gestire gli annunci pubblicitari presenti nel suo negozio online
- Franco vuole poter cercare la merce non venduta di uno stessa tipologia
- Franco vuole avere una visione generale di tutte le recensioni lasciate ai prodotti che vende
- Franco vuole trovare velocemente le recensioni di un prodotto 


**Cliente**

Persona: Giulia, 24 anni, cliente del negozio

- Giulia non vuole perdere troppo tempo nella fase di log in al negozio
- Giulia vuole acquistare ciò che più le piace in modo semplice e veloce
- Giulia vuole poter vedere che prodotti sta acquistando in modo intuitivo
- Giulia vuole gestire facilmente gli articoli nel suo carrello
- Giulia vuole tenere traccia dei suoi acquisti passati in modo da poterli visionare quando vuole
- Giulia vuole poter recensire i prodotti che ha acquistato in modo da lasciare la propria opinione
- Giulia vorrebbe nascondere gli annunci pubblicitari
- Giulia vorrebbe avere più indirizzi di consegna salvati in modo da poter farsi spedire gli acquisti dove le sembri più comodo

Persona: Valerio, 36 anni, cliente del negozio

- Valerio vuole poter filtrare facilmente i prodotti in base alla categoria e/o al modello
- Valerio vuole avere una visione chiara dei suoi acquisti precedenti
- Valerio vuole gestire facilmente le proprie credenziali
- Valerio vuole essere in grado di disconnettere il suo account quando non lo usa
- Valerio vuole poter visionare le sue precedenti spedizioni
- Valerio preferirebbe scrivere salvare il suo indirizzo di consegna in modo da non doverlo riscriverlo ogni volta che effettua un acquisto

Persona: Marta, 27 anni, cliente del negozio:

- Marta vuole aggiungere e togliere al proprio carrello tutti i prodotti che desidera
- Marta vuole poter eliminare tutti i prodotti dal proprio carrello con una semplice mossa
- Marta vuole accedere velocemente ai suoi acquisti
- Marta vuole essere in grado di trovare i prodotti tramite il loro codice identificativo
- Marta vuole tenere traccia delle sue spedizioni in corso

Persona: Giancarlo, 30 anni, cliente del negozio:
- Giancarlo vuole poter salvare il suo metodo di pagamento così da averlo pronto in tutte le occasioni
- Giancarlo vuole poter lasciare un voto al prodotto che ha acquistato in modo da essere d'aiuto agli altri utenti
- Giancarlo vuole cercare le recensioni che ha lasciato sui prodotti
- Giancarlo vuole poter essere in grado di modificare o di eliminare una recensione che ha lasciato 
- Giancarlo vuole cercare i prodotti di uno stessa categoria in modo semplice e intuitivo



**Utente non autenticato**

Persona: Fulvio, 65 anni, utente non registrato e pensionato:

- Fulvio vuole acquistare/visionare dei prodotti in modo semplice
- Fulvio vuole potersi registrare velocemente e con procedure semplice
- Fulvio vuole poter cercare i prodotti disponibili in modo agile

# Functional and non functional requirements

## Functional Requirements

|                                        ID                                        |                                                    Descrizione                                                    |
| :------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------: |
|                                       FR1                                        |                                              Gestione degli accessi                                               |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR1.1                    |                                                       Login                                                       |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR1.2                    |                                                      Logout                                                       |
|                                       FR2                                        |                                               Gestione degli utenti                                               |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.1                    |                                              Gestione account                                             |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.1.1                    |                                              Creazione nuovo profilo                                               |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.1.2                    |                               Recupero delle informazioni dell'utente autenticato                                |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.1.3                    |                               Modifica password                               |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.1.4                    |                               Modifica informazioni di contatto                                |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.1.5                    |                               Gestione indirizzo di consegna predefinito                                |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.1.6                    |                               Gestione metodo di pagamento predefinito                                |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.1.7                    |                               Eliminazione account                                |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.2                    |                                              Ricerca utenti                                             |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.2.1                    |                               Recupero di tutti gli utenti                                |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.2.2                    |                               Ricerca utenti, dato un ruolo                                |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.2.3                    |                               Ricerca utente, dato lo username                                |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.3                    |                                              Eliminazione utenti                                             |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.3.1                    |                               Eliminazione utente, dato lo username                                |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.3.2                    |                               Eliminazione di tutti gli utenti                                |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.4                    |                                              Assegnazione ruolo ad un utente registrato                                           |
|                                       FR3                                        |                                               Gestione dei prodotti                                               |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.1                    |                                             Creazione nuovo prodotto                                              |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.2                    |                        Registrazione arrivo di un insieme di prodotti dello stesso modello                        |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.3                    |                                     Contrassegno di un prodotto come venduto                                      |
|  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4    | Ricerca prodotti                                                 |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4.1 |                                    Ricerca di un prodotto, dato il suo codice                                    |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4.2 |                      Ricerca dei prodotti disponibili, eventualmente per modello o categoria                      |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4.3 |                     Ricerca dei prodotti, eventualmente solo se (non) venduti, filtrati per modello o categoria                   |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4.4 |                         Ricerca di tutti i prodotti, eventualmente solo se (non) venduti, senza l'utilizzo di altri filtri                         |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4.5 |                         Recupero dei prodotti acquistati dall'utente corrente, filtrati eventualmente per categoria e/o modello                         |
|  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.5    | Eliminazione prodotti  |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.5.1                    |                                  Eliminazione di un prodotto, dato il suo codice                                  |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.5.2                    |                                 Eliminazione di tutti i prodotti   |
|                                       FR4                                        |                                               Gestione dei carrelli                                               |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.1                    |                                      Visualizzazione carrello del cliente corrente                                       |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.2                    |                             Aggiunta di un prodotto al carrello del cliente corrente, dato il suo modello                              |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.3                    | Pagamento di un carrello |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.4                    |                          Visualizzazione dello storico dei carrelli pagati dal cliente corrente                          |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.5                    |                                               Operazioni di eliminazione                                               |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.5.1 |                    Rimozione di un prodotto dal carrello corrente            |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.5.2 |                            Eliminazione di tutti i prodotti dal carrello corrente                           |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.5.3 |                            Eliminazione di tutti i carrelli                |         
| FR5 | Gestione recensioni |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR5.1  | Inserimento recensione, per il modello di un prodotto acquistato |  
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR5.2  | Modifica di una recensione effettuata |  
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR5.3  | Eliminazione recensioni  | 
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR5.3.1 |  Eliminazione di una recensione effettuata dall'utente corrente |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR5.3.2 |  Eliminazione di una recensione qualsiasi, eventualmente filtrata per modello o categoria del prodotto |  
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR5.3.3 |  Eliminazione di tutte le recensioni, eventualmente filtrate per modello o categoria del prodotto |  
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR5.4  | Ricerca recensioni |  
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR5.4.1 |  Ricerca recensioni effettuate dall'utente corrente, eventualmente filtrate per modello e/o categoria di un prodotto |   
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR5.4.2 |  Ricerca recensioni effettuate da tutti gli utenti, eventualmente filtrate per modello e/o categoria di un prodotto |     
| FR6 | Gestione pubblicità |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR6.1  | Ricezione annuncio pubblicitario da servizio esterno |   
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR6.2  | Gestione possibilità di nascondere gli annunci pubblicitari all'interno della piattaforma |
| FR7 | Gestione pagamento |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR7.1  | Gestione richiesta di pagamento |   
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR7.2  | Invio esito di pagamento al cliente |
| FR8 | Gestione spedizione |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR8.1  | Creazione nuova spedizione |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR8.2  | Ricerca spedizioni | 
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR8.2.1 |  Ricerca spedizioni dell'utente corrente, eventualmente per stato (non iniziate, in corso, concluse) |      
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR8.2.2 |  Ricerca spedizioni di tutti gli utenti, eventualmente per stato (non iniziate, in corso, concluse) |   
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR8.3  | Abilitazione della possibilità di vedere in tempo reale le informazioni relative allo stato della spedizione (_tracking_) |


### Table of rights

| Requisito | Utente non autenticato | Cliente | Manager | Admin |
| :-------: | :----------------: | :-----: | :-----: |:---:|
| FR1.1 | x |  |  |  |
| FR1.2 |  | x | x | x |
| FR2.1.1 | x |  |  |  |
| FR2.1.2 |  | x | x | x |
| FR2.1.3 |  | x | x | x |
| FR2.1.4 |  | x |  | x |
| FR2.1.5 |  | x |  | x |
| FR2.1.6 |  | x |  | x |
| FR2.1.7 |  | x | x | x |
| FR2.2 |  |  |  | x |
| FR2.3 |  |  |  | x |
| FR2.3 |  |  |  | x |
| FR3.1 |  |  | x | x |
| FR3.2 |  |  | x | x |
| FR3.3 |  |  | x | x |
| FR3.4.1 |  |  | x | x |
| FR3.4.2 | x | x | x | x |
| FR3.4.3 |  |  | x | x |
| FR3.4.4 |  |  | x | x |
| FR3.4.5 |  | x |  | x |
| FR3.5 |  |  | x | x |
| FR4.1 |  | x |  | x |
| FR4.2 |  | x |  | x |
| FR4.3 |  | x |  | x |
| FR4.4 |  | x |  | x |
| FR4.5.1 |  | x |  | x |
| FR4.5.2 |  | x |  | x |
| FR4.5.3 |  |  |  | x |
| FR5.1 |  | x |  | x |
| FR5.2 |  | x |  | x |
| FR5.3.1 |  | x |  | x |
| FR5.3.2 |  |  |  | x |
| FR5.3.3 |  |  |  | x |
| FR5.4.1 |  | x |  | x |
| FR5.4.2 |  |  | x | x |
| FR6 |  |  |  | x |
| FR6.1 |  |  |  | x |
| FR6.2 |  |  |  | x |
| FR7 |  |  |  | x |
| FR7.1 |  |  |  | x |
| FR7.2 |  |  |  | x |
| FR8.1 |  |  |  | x |
| FR8.2.1 |  | x |  | x |
| FR8.2.2 |  |  |  | x |
| FR8.3 |  |  |  | x |

## Non Functional Requirements

\<Describe constraints on functional requirements>

|  ID  | Tipo (efficienza, affidabilità, ..) |                                                 Descrizione                                                  |   Si riferisce a   |
| :--: | :---------------------------------: | :----------------------------------------------------------------------------------------------------------: | :----------------: |
| NFR1 |              Usabilità              |      Non deve essere necessario training per essere in grado di utilizzare l'applicazione in autonomia       | FR1, FR2, FR3, FR4 |
| NFR2 |            Disponibilità            |                                 L'uptime del server deve essere pari al 99%                                  | FR1, FR2, FR3, FR4 |
| NFR3 |              Security               | L'autenticazione deve essere gestita mediante librerie che utilizzano pratiche conformi allo stato dell'arte |      FR1, FR2      |
| NFR4 |              Privacy               | Il sistema non deve conservare dati personali e identificativi degli utenti se non sono necessari |            |
| NFR5 |              Privacy               | I dati personali e identificativi degli utenti devono essere gestiti nel rispetto delle normative GDPR |            |
| NFR6 |              Security               | Il software non deve essere vulnerabile ad attacchi XSS e SQL injection |            |
| NFR7 |              Security               | Le dipendenze con vulnerabilità critiche (CVSS rating >= 6) devono essere aggiornate entro 1 settimana |            |
| NFR8 |              Security               | Le dipendenze con vulnerabilità note di qualsiasi tipo devono essere aggiornate entro 2 mesi |            |
| NFR9 |              Security               | Non deve essere possibile utilizzare una password non sicura (una password è considerata sicura se ha >=10 caratteri e contiene simboli, numeri, lettere maiuscole e minuscole) |            |
| NFR10 |              Security               | L'autenticazione deve essere gestita tramite librerie che utilizzano pratiche allo stato dell'arte |            |
| NFR11 |              Security               | Deve essere possibile abilitare la 2FA per utenti che lo desiderano |            |
| NFR12 |              Security               | Il server deve mantenere dei log di tutti i tentativi di accesso per almeno 3 mesi, per poter individuare tentativi di accesso fraudolenti |            |
| NFR13 |              Affidabilità               | Ogni utente non deve segnalare più di 2 bug all'anno |            |
| NFR14 |              Correttezza               | L'applicazione deve essere in grado di gestire un aumento del traffico senza degrado delle prestazioni |            |
| NFR15 |              Efficienza               | Il tempo di risposta deve essere pari o inferiore a 2 secondi |            |
| NFR16 |              Manutenibilità               | Risolvere un problema software deve richiedere un effort massimo di 7 person/hours |            |
| NFR17 |              Manutenibilità               | Modificare una funzionalità esistente deve richiedere un effort massimo di 7 person/hours |            |
| NFR18 |              Manutenibilità               | Eliminare una funzionalità esistente deve richiedere un effort massimo di 3 person/hours |            |
| NFR19 |              Manutenibilità               | Aggiungere una nuova funzionalità deve richiedere un effort massimo di 35 person/hours |            |
| NFR20 |              Portabilità               | Modificare il DBMS su cui memorizzare i dati deve richiedere un effort massimo di 35 person/hours |            |
| NFR21 |              Portabilità               | L'applicazione web deve essere disponibile sui browser Chrome, Firefox, Edge, Safari e Opera |            |
| NFR22 |              Security              | Il numero di accessi malintenzionati deve essere inferiore a 1 all'anno |            |
| NFR23 |              Security              | Il sistema deve effettuare sempre un controllo sui reali privilegi di chi effettua qualunque operazione prima di autorizzare operazioni di lettura/scrittura, esecuzione o cancellazione. |            |

---

**Francesco**

- Privacy:
  - Il sistema non deve conservare dati personali e identificativi degli utenti se non sono necessari
  - I dati personali e identificativi degli utenti devono essere gestiti nel rispetto delle normative GDPR
- Security:
  - Il software non deve essere vulnerabile ad attacchi XSS e SQL injection
  - Le dipendenze con vulnerabilità critiche (CVSS rating >= 6) devono essere aggiornate entro 1 settimana
  - Le dipendenze con vulnerabilità note di qualsiasi tipo devono essere aggiornate entro 2 mesi
  - Non deve essere possibile utilizzare una password non sicura (una password è considerata sicura se ha >=10 caratteri e contiene simboli, numeri, lettere maiuscole e minuscole)
  - L'autenticazione deve essere gestita tramite librerie che utilizzano pratiche allo stato dell'arte
  - Deve essere possibile abilitare la 2FA per utenti che lo desiderano
  - Il server deve mantenere dei log di tutti i tentativi di accesso per almeno 3 mesi, per poter individuare tentativi di accesso fraudolenti

---

**Flaviana**
- Affidabilità: ogni utente non deve segnalare più di 2 bug all'anno
- Correttezza: l'applicazione deve essere in grado di gestire un aumento del traffico senza degrado delle prestazioni
---

**Michele**
- Efficienza:
  - il tempo di risposta deve essere pari o inferiore a 2 secondi
- Correttezza:
  - ??
- Manutenibilità:
  - risolvere un problema software deve richiedere un effort massimo di 7 person/hours
  - modificare una funzionalità esistente deve richiedere un effort massimo di 7 person/hours
  - eliminare una funzionalità esistente deve richiedere un effort massimo di 3 person/hours
  - aggiungere una nuova funzionalità deve richiedere un effort massimo di 35 person/hours
- Portabilità:
  - modificare il DBMS su cui memorizzare i dati deve richiedere un effort massimo di 35 person/hours
  - l'applicazione web deve essere disponibile sui browser Chrome, Firefox, Edge, Safari e Opera
- Safety:
  - il sistema non deve causare danni a persone o ambienti (è SW, quindi non saprei nemmeno se includerlo)
- Security:
  - il numero di accessi malintenzionati deve essere inferiore a 1 all'anno
  - qualcosa su privacy dei dati utente (crittografia, cors?), possibile GDPR-compliance o simili
---

**Giuseppe**
- Security:
  -  Il sistema deve effettuare sempre un controllo sui reali privilegi di chi effettua qualunque operazione prima di autorizzare operazioni di lettura/scrittura, esecuzione o cancellazione.
---

# Use case diagram and use cases

## Use case diagram

\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

\<next describe here each use case in the UCD>

### Use case 1, UC1

| Actors Involved  |                                                                      |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | \<Boolean expression, must evaluate to true before the UC can start> |
|  Post condition  |  \<Boolean expression, must evaluate to true after UC is finished>   |
| Nominal Scenario |         \<Textual description of actions executed by the UC>         |
|     Variants     |                      \<other normal executions>                      |
|    Exceptions    |                        \<exceptions, errors >                        |

#### Scenario 1.1

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

|  Scenario 1.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | \<Boolean expression, must evaluate to true before the scenario can start> |
| Post condition |  \<Boolean expression, must evaluate to true after scenario is finished>   |
|     Step#      |                                Description                                 |
|       1        |                                                                            |
|       2        |                                                                            |
|      ...       |                                                                            |

#### Scenario 1.2

#### Scenario 1.x

### Use case 2, UC2

..

### Use case x, UCx

..

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

\<describe here deployment diagram >
