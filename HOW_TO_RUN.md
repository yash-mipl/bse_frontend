# How to Run BSE

| Part | Folder | URL |
|------|--------|-----|
| Backend | `bse_backend` | http://localhost:8000 |
| Frontend | `frontend` | http://localhost:5173 |

Run both at the same time (two terminals).

---

## Backend

```bash
cd bse_backend
npm install
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## Env files

- Backend: `bse_backend/.env` (from `.env.example`)
- Frontend: `frontend/.env.local`

```env
VITE_APP_NAME=BSE
VITE_API_BASE_URL=http://localhost:8000/api
```

Restart frontend after changing `.env.local`.

---

## Chrome extension (optional — PDF maximize)

1. `chrome://extensions` → Developer mode ON  
2. Load unpacked → `frontend/chrome-extension`  
3. Refresh http://localhost:5173  

---

## Stop

`Ctrl + C` in each terminal.
