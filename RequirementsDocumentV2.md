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
| Stakeholder x..  |             |

# Context Diagram and interfaces

## Context Diagram

\<Define here Context diagram using UML use case diagram>

\<actors are a subset of stakeholders>
- Sistema di pagamento (Paypal, Satispay, Visa/Mastercard/Amex separati?)
- Sistema di spedizione (anche qui, ha senso separare DHL/GLS ecc visto che le api di interazione sono possibilmente diverse?)

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

|                                        ID                                        |                                                    Descrizione                                                    |
| :------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------: |
|                                       FR1                                        |                                              Gestione degli accessi                                               |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR1.1                    |                                                       Login                                                       |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR1.2                    |                                                      Logout                                                       |
|                                       FR2                                        |                                               Gestione degli utenti                                               |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.1                    |                                              Creazione nuovo utente                                               |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.2                    |                                            Recupero delle informazioni dell'utente autenticato                                             |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.3                    |                                            Recupero utenti                                            |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.3.1                    |                                            Recupero di tutti gli utenti                                             |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.3.2                    |                                            Recupero utenti, dato un ruolo                                            |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.3.3                    |                                            Recupero utente, dato un username                                             |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.4                    |                                            Eliminazione utenti                                          |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.4.1                    |                                            Eliminazione utente, dato l'username                                             |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.4.2                    |                                            Eliminazione di tutti gli utenti                                             |
|                                       FR3                                        |                                               Gestione dei prodotti                                               |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.1                    |                                             Creazione nuovo prodotto                                              |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.2                    |                        Registrazione arrivo di un insieme di prodotti dello stesso modello                        |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.3                    |                                     Contrassegno di un prodotto come venduto                                      |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4                    |                                                 Recupero prodotti                                                 |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4.1 |                                    Recupero di un prodotto, dato il suo codice                                    |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4.2 |                         Recupero prodotti, eventualmente solo se (non) venduti, dato il modello                         |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4.3 |                        Recupero prodotti, eventualmente solo se (non) venduti, data la categoria                        |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4.4 |                            Recupero di tutti i prodotti, eventualmente solo se (non) venduti                            |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.5                    |                                               Eliminazione prodotti                                               |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.5.1 |                                  Eliminazione di un prodotto, dato il suo codice                                  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.5.2 |                                  Eliminazione di tutti i prodotti                                |
|                                       FR4                                        |                                               Gestione dei carrelli                                               |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.1                    |                                       Recupero carrello del cliente corrente                               |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.2                    |                              Aggiunta di un prodotto al carrello del cliente corrente                           |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.3                    | Pagamento di un carrello, avente per prezzo la somma dei prezzi dei prodotti inseriti e per data la data corrente |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.4                    |                                 Recupero dello storico dei carrelli pagati dal cliente corrente                               |
|                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.5                    |                                               Eliminazione carrelli                                               |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.5.1 |                  Eliminazione di un prodotto dal carrello corrente, dato il codice del prodotto                   |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.5.2 |                              Eliminazione del carrello corrente dell'utente loggato    |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.5.3 |                              Eliminazione di tutti i carrelli                        

**Francesco**

---

**Flaviana**

---

**Michele**

---

**Giuseppe**

---

## Table of rights

| Requisiti | Utente non loggato | Cliente | Manager | Admin |
| :-------: | :----------------: | :-----: | :-----: | :---: |
|   FR1.1   |         x          |         |         |   x   |
|   FR1.2   |                    |    x    |    x    |   x   |
|   FR2.1   |         x          |         |         |   x   |
|   FR2.2   |                    |    x    |    x    |   x   |
|   FR2.3   |                    |         |         |   x   |
|   FR2.4   |                    |         |         |   x   |
|   FR3.1   |                    |         |    x    |   x   |
|   FR3.2   |                    |         |    x    |   x   |
|   FR3.3   |                    |         |    x    |   x   |
|   FR3.4   |         x          |    x    |    x    |   x   |
|   FR3.5   |                    |         |    x    |   x   |
|   FR4.1   |                    |    x    |         |   x   |
|   FR4.2   |                    |    x    |         |   x   |
|   FR4.3   |                    |    x    |         |   x   |
|   FR4.4   |                    |    x    |         |   x   |
|  FR4.5.1  |                    |    x    |         |   x   |
|  FR4.5.2  |                    |    x    |         |   x   |
|  FR4.5.3  |                    |         |         |   x   |

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
| NFR16 |              Mantenibilità               | Risolvere un problema software deve richiedere un effort massimo di 7 person/hours |            |
| NFR17 |              Mantenibilità               | Modificare una funzionalità esistente deve richiedere un effort massimo di 7 person/hours |            |
| NFR18 |              Mantenibilità               | Eliminare una funzionalità esistente deve richiedere un effort massimo di 3 person/hours |            |
| NFR19 |              Mantenibilità               | Aggiungere una nuova funzionalità deve richiedere un effort massimo di 35 person/hours |            |
| NFR20 |              Portabilità               | Podificare il DBMS su cui memorizzare i dati deve richiedere un effort massimo di 35 person/hours |            |
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
