# Requirements Document - current EZElectronics

Date:

Version: V1 - description of EZElectronics in CURRENT form (as received by teachers)

| Version number | Change |
| :------------: | :----: |
|                |        |

# Contents

- [Requirements Document - current EZElectronics](#requirements-document---current-ezelectronics)
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
| Stakeholder x..  |             |

# Context Diagram and interfaces

## Context Diagram

\<Define here Context diagram using UML use case diagram>

[Context diagram](#https://git-softeng.polito.it/se-2023-24/group-ita-42/ezelectronics/-/blob/dev/media/context_diagram.png?ref_type=heads)

\<actors are a subset of stakeholders>  
Actors here:

---

**Francesco**
- Utente -> Cliente / Manager
- Sistema di pagamento (Paypal, Satispay, Visa/Mastercard/Amex vanno separati?)
- Sistema di spedizione (anche qui, ha senso separare DHL/GLS ecc visto che le api di interazione sono possibilmente diverse?)
---

**Flaviana**
- Cliente
- Manager

---

**Michele**

- Cliente
- Manager dello store
- Database direi di **no**: penso che lo svilupperemo come sqlite dato che a web app facciamo quello; essendo di fatto su file interno al progetto, ricordo che il prof disse che non era da includere negli attori, ma stava nel sistema.

---

**Giuseppe**

- Cliente -> ovvero Utente **loggato**
- anche qui si presenta il caso database -> lo metto per completezza



---

## Interfaces

\<describe here each interface in the context diagram>

\<GUIs will be described graphically in a separate document>

|   Actor   | Logical Interface | Physical Interface |
| :-------: | :---------------: | :----------------: |
| Actor x.. |                   |                    |

# Stories and personas

\<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system>

\<Persona is-an-instance-of actor>

\<stories will be formalized later as scenarios in use cases>

# Functional and non functional requirements

## Functional Requirements

\<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

\<they match to high level use cases>

| ID  | Description |
| :-: | :---------: |
| FR1 |             |
| FR2 |             |
| FR3 |             |
| FR3 |             |
| FR4 |             |
| FR5 |             |
| FR6 |             |

---

**Francesco**

- Creare un nuovo utente
- Accedere con un utente esistente
- Disconnettere un utente loggato
- Receuperare informazioni sull'utente attualmente loggato
- Recuperare una lista di tutti gli utenti, eventualmente filtrati per ruolo (cliente/manager) - test only

---

**Flaviana**
- Ritornare un utente dato uno specifico username
- Eliminare un utente dato uno specifico username
- Eliminare tutti gli utenti (solo a scopo di test)
- Creare un nuovo prodotto
- Registrare l'arrivo di un set di prodotti dello stesso modello
- Contrassegnare un prodotto come venduto

---

**Michele**

- FR3.4: Recuperare tutti i prodotti, eventualmente solo quelli venduti
- FR3.5: Recuperare un prodotto, dato il suo codice
- FR3.6: Recuperare tutti i prodotti appartenenti ad una data categoria, eventualmente solo quelli venduti
- FR3.7: Recuperare tutti i prodotti appartenenti ad un dato modello, eventualmente solo quelli venduti
- FR3.8: Eliminare tutti i prodotti (solo test?)
- FR3.9: Eliminare uno prodotto, dato il suo codice

---

**Giuseppe**

- Recuperare il carrello corrente del cliente loggato
- Aggiungere un prodotto al carrello corrente del cliente loggato
- Pagare il carrello corrente del cliente loggato. Impostare il totale del carrello alla somma degli importi dei singoli prodotti presenti all'interno. Impostare la data di pagamento del suddetto carrello a quella del sistema. **Vanno separati?**
- Recuperare lo storico dei carrelli che sono stati pagati dall'utente che è attualmente loggato.
- Eliminare un prodotto dal carrello corrente del cliente loggato
- Eliminare l'intero carrello corrente del cliente loggato
- Eliminare tutti i carrelli esistenti (**solo test e pulizia db**)

---

## Non Functional Requirements

\<Describe constraints on functional requirements>

|   ID    | Type (efficiency, reliability, ..) | Description | Refers to |
| :-----: | :--------------------------------: | :---------: | :-------: |
|  NFR1   |                                    |             |           |
|  NFR2   |                                    |             |           |
|  NFR3   |                                    |             |           |
| NFRx .. |                                    |             |           |

---

**Francesco**

- Security:
  - L'autenticazione deve essere gestita tramite librerie che utilizzano pratiche allo stato dell'arte
  
---

**Flaviana**
- Affidabilità: ogni utente non deve segnalare più di 2 bug all'anno
- Correttezza: l'applicazione deve essere in grado di gestire un aumento del traffico senza degrado delle prestazioni

---

**Michele**

- Usabilità:
  - non deve essere necessario training per utilizzare l'applicazione in autonomia
- Affidabilità/Disponibilità:
  - l'uptime del server deve essere pari al 99%
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
- Security (**_non ne sono troppo sicuro, forse bisogna indagare più a fondo sulla parte di access_**):
  - il numero di accessi malintenzionati deve essere inferiore a 1 all'anno
  - qualcosa su privacy dei dati utente (crittografia, cors?), possibile GDPR-compliance o simili

---

**Giuseppe**

- Affidabilità:
  - Il sistema può essere utilizzato dal Lunedi alla domenica h24 a meno di manutenzioni straordinarie
- Security:
  -  Il
sistema deve effettuare sempre un controllo sui reali privilegi di chi effettua qualunque operazione
prima di autorizzare operazioni di lettura/scrittura, esecuzione o cancellazione.

---

# Use case diagram and use cases

## Use case diagram

\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

\<next describe here each use case in the UCD>

### Use case 1, UC1

| Actors Involved  |     |
| :--------------: | :-: |
|   Precondition   |     |
|  Post condition  |     |
| Nominal Scenario |     |
|     Variants     |     |
|    Exceptions    |     |

##### Scenario 1.1

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

##### Scenario 1.2

##### Scenario 1.x

### Use case 2, UC2

| Actors Involved  |     |
| :--------------: | :-: |
|   Precondition   |     |
|  Post condition  |     |
| Nominal Scenario |     |
|     Variants     |     |
|    Exceptions    |     |

### Use case x, UCx

..

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

  \<concepts must be used consistently all over the document, ex in use cases, requirements etc>

[Class diagram](#https://git-softeng.polito.it/se-2023-24/group-ita-42/ezelectronics/-/blob/dev/media/glossario.png?ref_type=heads)

# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

\<describe here deployment diagram >
