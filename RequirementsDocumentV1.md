# Documento dei requisiti - EZElectronics attuale

Data:

Versione: V1 - descrizione di EZElectronics nella forma ATTUALE (come ricevuta dagli insegnanti)

| Numero di versione | Modifica |
| :----------------: | :------: |
|                    |          |

# Contenuti

- [Documento dei requisiti - EZElectronics attuale](#documento-dei-requisiti---ezelectronics-attuale)
- [Contenuti](#contenuti)
- [Descrizione informale](#descrizione-informale)
- [Stakeholders](#portatori-di-interesse)
- [Context Diagram e interfacce](#diagramma-di-contesto-e-interfacce)
  - [Context Diagram](#diagramma-di-contesto)
  - [Interfacce](#interfacce)
- [Storie e personas](#storie-e-personas)
- [Requisiti funzionali e non funzionali](#requisiti-funzionali-e-non-funzionali)
  - [Requisiti funzionali](#requisiti-funzionali)
  - [Requisiti non funzionali](#requisiti-non-funzionali)
- [Use Case Diagram e casi d'uso](#diagramma-dei-casi-duso-e-casi-duso)
  - [Use Case Diagram](#diagramma-dei-casi-duso)
    - [Caso d'uso 1, UC1](#caso-duso-1-uc1)
      - [Scenario 1.1](#scenario-11)
      - [Scenario 1.2](#scenario-12)
      - [Scenario 1.x](#scenario-1x)
    - [Caso d'uso 2, UC2](#caso-duso-2-uc2)
    - [Caso d'uso x, UCx](#caso-duso-x-ucx)
- [Glossario](#glossario)
- [System Design](#progettazione-del-sistema)
- [Deployment Diagram](#diagramma-di-distribuzione)

# Descrizione informale

EZElectronics (pronunciato EaSy Electronics) è un'applicazione software progettata per aiutare i gestori dei negozi di elettronica a gestire i loro prodotti e offrirli ai clienti attraverso un sito web dedicato. I gestori possono valutare i prodotti disponibili, registrarne di nuovi e confermare gli acquisti. I clienti possono visualizzare i prodotti disponibili, aggiungerli al carrello e visualizzare la cronologia dei loro acquisti passati.

# Stakeholders

| Nome dello stakeholder |                                                                   Descrizione                                                                    |
| :--------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------: |
|         Utente         |                       Utilizzatore generico dell'applicazione, la sua attività principale varia a seconda della tipologia                        |
|     Utente loggato     |       Utente che è registrato presso l'applicazione: la sua attività principale riguarda la gestione di prodotti o l'acquisto degli stessi       |
|   Utente non loggato   | Utente non registrato presso l'applicazione, la sua attività principale riguarda soltanto la ricerca e la navigazione tra i prodotti disponibili |
|        Cliente         |                           Utente loggato la cui attività principale è l'acquisto di prodotti attraverso l'applicazione                           |
|        Manager         |             Utente loggato la cui attività principale è la gestione dei prodotti, sia in entrata che in uscita dal negozio virtuale              |
|       Produttore       |               Individuo, organizzazione o azienda che produce gli oggetti che verranno messi in vendita attraverso la piattaforma                |
|      Distributore      |                   Individuo, organizzazione o azienda che distribuisce i prodotti, dal produttore al venditore (qui _Manager_)                   |

# Context Diagram e interfacce

## Context Diagram

[Context Diagram](#https://git-softeng.polito.it/se-2023-24/group-ita-42/ezelectronics/-/blob/dev/media/context_diagram.png?ref_type=heads)

**Attori**:

- Utente: svolge attività generiche, indipendentemente dal fatto di essere registrato, come la navigazione e la ricerca dei prodotti presenti; può essere:
  - Utente loggato: può agire sui prodotti, con modalità e privilegi dipendenti dal ruolo; può essere a sua volta:
    - Cliente: ha la possibilità di acquistare i prodotti, tenendo traccia delle proprie transazioni, attraverso la creazione dei carrelli virtuali;
    - Manager: ha la possibilità di effettuare operazioni sui prodotti del negozio, tenendo traccia degli arrivi e delle quantità presenti e vendute;
  - Utente non loggato: oltre alle attività comuni a tutti gli utenti, può registrarsi presso il negozio virtuale, con un'interfaccia dedicata.

## Interfacce

\<Descrivere qui ogni interfaccia nel Context Diagram>

\<Le GUI saranno descritte graficamente in un documento separato>

|       Attore       | Interfaccia logica | Interfaccia fisica |
| :----------------: | :----------------: | :----------------: |
|       Utente       |        GUI         |   PC/Smartphone    |
|   Utente loggato   |        GUI         |   PC/Smartphone    |
| Utente non loggato |        GUI         |   PC/Smartphone    |
|      Cliente       |        GUI         |   PC/Smartphone    |
|      Manager       |        GUI         |   PC/Smartphone    |

# Storie e personas

\<Una Persona è una rappresentazione realistica di un attore. Definire qui alcune persone e descrivere in testo semplice come una persona interagisce con il sistema>

\<Una persona è un'istanza di un attore>

\<Le storie saranno formalizzate successivamente come scenari nei casi d'uso>

# Requisiti funzionali e non funzionali

## Requisiti funzionali

| ID  | Descrizione |
| :-: | :---------: |
| FR1 | Gestione degli accessi            |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR1.1 | Login            |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR1.2 | Logout           |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR1.3 | Recupero informazioni sul profilo utente |
| FR2 | Gestione degli utenti            |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.1 | Creazione nuovo utente            |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.2 | Recupero utenti (test)          |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.2.1 | Recupero di tutti gli utenti          |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.2.2 | Recupero utenti, dato un ruolo       |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.2.3 | Recupero utente, dato lo username          |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.3 | Eliminazione utenti (test) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.3.1 | Eliminazione utente, dato lo username       |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR2.3.2 | Eliminazione di tutti gli utenti |
| FR3 | Gestione dei prodotti            |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.1 | Creazione nuovo prodotto   |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.2 | Registrazione arrivo di un insieme di prodotti dello stesso modello  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.3 | Contrassegno di un prodotto come venduto  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4 | Recupero prodotti  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4.1 | Recupero di un prodotto, dato il suo codice          |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4.2 | Recupero prodotti, eventualmente solo se venduti, dato il modello      |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4.3 | Recupero prodotti, eventualmente solo se venduti, data la categoria          |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.4.4 | Recupero di tutti i prodotti, eventualmente solo se venduti         |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.5 | Eliminazione prodotti  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.5.1 | Eliminazione di un prodotto, dato il suo codice         |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR3.5.2 | Eliminazione di tutti i prodotti (test)        |
| FR4 | Gestione dei carrelli           |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.1 | Recupero carrello dell'utente loggato   |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.2 | Aggiunta di un prodotto al carrello dell'utente loggato  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.3 | Pagamento di un carrello, avente per prezzo la somma dei prezzi dei prodotti inseriti e per data la data corrente |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.4 | Recupero storico dei carrelli pagati dall'utente  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.5 | Eliminazione carrelli  |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.5.1 | Eliminazione di un prodotto dal carrello corrente, dato il codice del prodotto        |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.5.2 | Eliminazione del carrello corrente dell'utente loggato       |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FR4.5.3 | Eliminazione di tutti i carrelli (test)     |

## Requisiti non funzionali

\<Descrivere i vincoli sui requisiti funzionali>

|  ID  | Tipo (efficienza, affidabilità, ..) |                                                 Descrizione                                                  |   Si riferisce a   |
| :--: | :---------------------------------: | :----------------------------------------------------------------------------------------------------------: | :----------------: |
| NFR1 |              Usabilità              |      Non deve essere necessario training per essere in grado di utilizzare l'applicazione in autonomia       | FR1, FR2, FR3, FR4 |
| NFR2 |            Disponibilità            |                                 L'uptime del server deve essere pari al 99%                                  | FR1, FR2, FR3, FR4 |
| NFR3 |              Security               | L'autenticazione deve essere gestita mediante librerie che utilizzano pratiche conformi allo stato dell'arte |      FR1, FR2      |

# Use Case Diagram e casi d'uso

## Use Case Diagram

![Use case Diagram](media/use_case_diagram.png)
\<Definire qui il Use Case Diagram UML che riassume tutti i casi d'uso e le loro relazioni>

\<Descrivere qui ogni caso d'uso nel Use Case Diagram>

### Caso d'uso 1, UC1

| Attori coinvolti  |     |
| :---------------: | :-: |
|   Precondizione   |     |
|  Postcondizione   |     |
| Scenario nominale |     |
|     Varianti      |     |
|     Eccezioni     |     |

##### Scenario 1.1

\<Descrivere qui gli scenari istanze di UC1>

\<Uno scenario è una sequenza di passi che corrisponde a una particolare esecuzione di un caso d'uso>

\<Uno scenario è una descrizione più formale di una storia>

\<Dovrebbero essere descritti solo gli scenari rilevanti>

|  Scenario 1.1  |                                                                                     |
| :------------: | :---------------------------------------------------------------------------------: |
| Precondizione  | \<Espressione booleana, deve valutarsi a true prima che lo scenario possa iniziare> |
| Postcondizione |   \<Espressione booleana, deve valutarsi a true dopo che lo scenario è terminato>   |
|     Passo#     |                                     Descrizione                                     |
|       1        |                                                                                     |
|       2        |                                                                                     |
|      ...       |                                                                                     |

##### Scenario 1.2

##### Scenario 1.x

### Caso d'uso 2, UC2

| Attori coinvolti  |     |
| :---------------: | :-: |
|   Precondizione   |     |
|  Postcondizione   |     |
| Scenario nominale |     |
|     Varianti      |     |
|     Eccezioni     |     |

### Caso d'uso x, UCx

..

# Glossario

\<Utilizzare il diagramma delle classi UML per definire termini o concetti importanti nel dominio dell'applicazione e le loro relazioni>

\<I concetti devono essere utilizzati in modo coerente in tutto il documento, ad esempio nei casi d'uso, nei requisiti, ecc.>

[Class Diagram](#https://git-softeng.polito.it/se-2023-24/group-ita-42/ezelectronics/-/blob/dev/media/glossario.png?ref_type=heads)

# System Design

\<Descrivere qui la System Design>

\<Deve essere coerente con il Context Diagram>

# Deployment Diagram

\<Descrivere qui il Deployment Diagram>
