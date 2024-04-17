# Documento dei requisiti - EZElectronics attuale

Data:

Versione: V1 - descrizione di EZElectronics nella forma ATTUALE (come ricevuta dagli insegnanti)

| Numero di versione | Modifica |
| :---------------: | :------: |
|                   |          |

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

| Nome dello stakeholder | Descrizione |
| :----------------------------: | :---------: |
|         stakeholder x...         |             |

# Context Diagram e interfacce

## Context Diagram

\<Definire qui il Context Diagram utilizzando il Use Case Diagram UML>

[Context Diagram](#https://git-softeng.polito.it/se-2023-24/group-ita-42/ezelectronics/-/blob/dev/media/context_diagram.png?ref_type=heads)

\<gli attori sono un sottoinsieme dei stakeholders>
Attori:

---

**Francesco**
- Utente -> Cliente / Manager

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

## Interfacce

\<Descrivere qui ogni interfaccia nel Context Diagram>

\<Le GUI saranno descritte graficamente in un documento separato>

|   Attore   | Interfaccia logica | Interfaccia fisica |
| :--------: | :---------------: | :----------------: |
| Attore x...|                   |                    |

# Storie e personas

\<Una Persona è una rappresentazione realistica di un attore. Definire qui alcune persone e descrivere in testo semplice come una persona interagisce con il sistema>

\<Una persona è un'istanza di un attore>

\<Le storie saranno formalizzate successivamente come scenari nei casi d'uso>

# Requisiti funzionali e non funzionali

## Requisiti funzionali

\<Nella forma FAI QUALCOSA, o VERBO SOSTANTIVO, descrivere le capacità di alto livello del sistema>

\<Corrispondono a casi d'uso di alto livello>

| ID  | Descrizione |
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
- Recuperare informazioni sull'utente attualmente loggato
- Recuperare una lista di tutti gli utenti, eventualmente filtrati per ruolo (cliente/manager) - solo test

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

## Requisiti non funzionali

\<Descrivere i vincoli sui requisiti funzionali>

|   ID    | Tipo (efficienza, affidabilità, ..) | Descrizione | Si riferisce a |
| :-----: | :--------------------------------: | :---------: | :-----------: |
|  NFR1   |                                  |             |               |
|  NFR2   |                                  |             |               |
|  NFR3   |                                  |             |               |
| NFRx .. |                                  |             |               |

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

# Use Case Diagram e casi d'uso

## Use Case Diagram

\<Definire qui il Use Case Diagram UML che riassume tutti i casi d'uso e le loro relazioni>

\<Descrivere qui ogni caso d'uso nel Use Case Diagram>

### Caso d'uso 1, UC1

| Attori coinvolti |     |
| :--------------: | :-: |
|  Precondizione   |     |
| Postcondizione   |     |
| Scenario nominale |     |
| Varianti        |     |
| Eccezioni       |     |

##### Scenario 1.1

\<Descrivere qui gli scenari istanze di UC1>

\<Uno scenario è una sequenza di passi che corrisponde a una particolare esecuzione di un caso d'uso>

\<Uno scenario è una descrizione più formale di una storia>

\<Dovrebbero essere descritti solo gli scenari rilevanti>

|  Scenario 1.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondizione  | \<Espressione booleana, deve valutarsi a true prima che lo scenario possa iniziare> |
| Postcondizione |  \<Espressione booleana, deve valutarsi a true dopo che lo scenario è terminato>   |
|     Passo#      |                                Descrizione                                 |
|       1        |                                                                            |
|       2        |                                                                            |
|      ...       |                                                                            |

##### Scenario 1.2

##### Scenario 1.x

### Caso d'uso 2, UC2

| Attori coinvolti |     |
| :--------------: | :-: |
|  Precondizione   |     |
| Postcondizione   |     |
| Scenario nominale |     |
| Varianti        |     |
| Eccezioni       |     |

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

