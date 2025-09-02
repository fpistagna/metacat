# Guida al Flusso di Autenticazione con ORCID

Questa guida descrive i passaggi necessari per autenticare un utente tramite il flusso OAuth2 di ORCID e ottenere un token JWT interno dall'applicazione.

## Prerequisiti

- Il server locale (Node.js) è in esecuzione.
- Il reverse proxy (Nginx o `ngrok`) è attivo e risponde su `https://localhost`.
- Le credenziali ORCID sono configurate correttamente nel file `.env`.

---

## Flusso di Autenticazione Passo-Passo

### Passo 1: Avviare il Flusso di Login

L'intero processo viene avviato dal **client** (in questo caso, noi che usiamo `httpie`) contattando l'endpoint di avvio della nostra API. Questo comando aprirà automaticamente il tuo browser predefinito.

```bash
https --verify false GET https://localhost/api/v1/auth/orcid
```

### Passo 2: Autorizzare l'Applicazione su ORCID

Nel browser, esegui il login con le credenziali del tuo account ORCID di sandbox. Dopo il login, ORCID ti chiederà di autorizzare la tua applicazione ad accedere al tuo profilo. Clicca su "Authorize access".

### Passo 3: Catturare il Codice di Autorizzazione (`code`)

Dopo l'autorizzazione, ORCID reindirizzerà il browser all'URL di callback che abbiamo specificato. La pagina potrebbe apparire come un errore (es. `Cannot GET /api/v1/auth/orcid/callback`), il che è normale.

La cosa importante è nella barra degli indirizzi del browser. Avrà un aspetto simile a questo:

`https://localhost/api/v1/auth/orcid/callback?code=ABCD-1234
`

**Copia il valore del parametro** `code` (in questo esempio, `ABCD-1234`).

### Passo 4: Scambiare il Codice per un Token JWT

Ora, torna al terminale e usa il codice che hai appena copiato per fare una richiesta `POST` al nostro endpoint di callback.

```bash
https --verify false POST https://localhost/api/v1/auth/orcid/callback \
  code='<IL_CODICE_COPIATO_DAL_BROWSER>'
```

*Sostituisci <`IL_CODICE_COPIATO_DAL_BROWSER`> con il codice che hai ottenuto al passo precedente.*

### Passo 5: Ricevere e Usare il Token JWT

Se il codice è valido, il server risponderà con un `200 OK` e un body JSON contenente il token JWT interno della tua applicazione.

Risposta Attesa:

```JSON
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoi..."
}
```

Questo token può ora essere usato per fare richieste agli endpoint protetti della tua API.

