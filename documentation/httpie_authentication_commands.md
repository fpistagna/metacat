# Guida ai Test: Flusso di Autenticazione e Pubblicazione

Questa guida descrive i passaggi per testare il flusso completo di creazione di utenti con ruoli diversi, la creazione di un record e la sua successiva pubblicazione tramite `httpie` e `mongosh`.

## Prerequisiti

- `httpie` e `jq` installati.
- Server Node.js in esecuzione su `http://localhost:3000`.
- Connessione a MongoDB attiva.

---

## Passo 1: Creare l'Utente "Autore" (Ruolo 'user')

Questo utente creerà il record come bozza.

```bash
http POST http://localhost:3000/api/v1/auth/register \
  username='author_user' \
  email='author@example.com' \
  password='A-Strong-Password-123!' 
```

## Passo 2:Creare e Promuovere l'Utente "Curatore"

Questo utente avrà i permessi per pubblicare i record.

### Registra l'utente tramite l'API:

```bash
http POST http://localhost:3000/api/v1/auth/register \
  username='curator_user' \
  email='curator@example.com' \
  password='Another-Strong-Password-456!'
```

### Promuovi l'utente a `curator` direttamente nel database:

```bash
mongosh metacat --eval \ 
  'db.users.updateOne({ \ 
    "email": "curator@example.com" }, \
    { $set: { "role": "curator" } })'
```

## Passo 3: L'Autore Crea un Record

L'autore prima si autentica per ottenere un token, poi lo usa per creare un record.

### Login dell'autore e salvataggio del token in una variabile:

```bash
AUTHOR_TOKEN=$(http POST http://localhost:3000/api/v1/auth/login \ 
  email='author@example.com' \ 
  password='A-Strong-Password-123!' | jq -r .token)
```

### Creazione del record e salvataggio del suo ID:

```bash
RECORD_ID=$(http POST http://localhost:3000/api/v1/records @./ \ 
  sample_data/sample.json "Authorization: Bearer $AUTHOR_TOKEN" | jq -r .record.record.id)
```

*Nota: A questo punto, il record esiste nel database con published: false.*

## Passo 4: Il Curatore Pubblica il Record

Il curatore ottiene il proprio token e lo usa per chiamare l'endpoint di pubblicazione.

### Login del curatore:

```bash
CURATOR_TOKEN=$(http POST http://localhost:3000/api/v1/auth/login \ 
  email='curator@example.com' password='Another-Strong-Password-456!' | jq -r .token)
```

### Chiamata all'endpoint di pubblicazione usando l'ID del record:

```bash
http POST http://localhost:3000/api/v1/records/$RECORD_ID/publish \ 
  "Authorization: Bearer $CURATOR_TOKEN"
```

*Risposta attesa: 200 OK con un messaggio di successo.*

## Passo 5: Verifica Finale

Una richiesta non autenticata alla lista dei record ora dovrebbe includere il record appena pubblicato.

```bash
http GET http://localhost:3000/api/v1/records
```

*Verifica che il record con il RECORD_ID creato appaia nella lista.*
