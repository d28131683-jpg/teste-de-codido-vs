# Odds Premium Frontend

Interface visual construída para consumir o backend em `odds-premium-python`.

## Como rodar

1. Abra um terminal em `odds-premium-python` e execute o backend:

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Abra outro terminal em `frontend` e instale dependências:

```bash
npm install
npm run dev
```

3. Acesse `http://localhost:3000`.

## Observação

O frontend usa proxy em `next.config.mjs` para enviar requisições para `http://localhost:8000`.
