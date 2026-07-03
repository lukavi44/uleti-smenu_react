# UletiSmenu — Frontend

React + TypeScript + Vite client for **UletiSmenu** (restaurant shift hiring).

Backend API (separate repo): [uleti-smenu-backend](https://github.com/lukavi44/uleti-smenu-backend)

## Project structure

| Path | Description |
|------|-------------|
| `uleti-smenu/` | Vite app (source, `package.json`, `.env.example`) |

---

## Local development setup

Clone **both** repositories to run the full stack locally:

```powershell
git clone https://github.com/lukavi44/uleti-smenu_react.git
git clone https://github.com/lukavi44/uleti-smenu-backend.git
```

### 1. Prerequisites

| Tool | Version |
|------|---------|
| Git | latest |
| [.NET SDK](https://dotnet.microsoft.com/download) | 8+ |
| [Node.js](https://nodejs.org/) | 20+ (npm included) |
| SQL Server | Express, Developer, or **LocalDB** (included with Visual Studio) |

Optional: [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms)

Trust the local HTTPS development certificate once:

```powershell
dotnet dev-certs https --trust
```

### 2. Set up local SQL Server

You do **not** need to create tables manually. The API applies Entity Framework migrations on startup and creates the database if it does not exist.

You **do** need a running SQL Server instance and a valid connection string in your local backend config.

Example connection strings (pick one that matches your install):

```text
# LocalDB
Server=(localdb)\mssqllocaldb;Database=UletiSmenuDb;Trusted_Connection=True;TrustServerCertificate=True;

# SQL Express
Server=localhost\SQLEXPRESS;Database=UletiSmenuDb;Trusted_Connection=True;TrustServerCertificate=True;

# Default instance
Server=localhost;Database=UletiSmenuDb;Trusted_Connection=True;TrustServerCertificate=True;
```

### 3. Configure and run the backend

```powershell
cd .\uleti-smenu-backend\UletiSmenu\API
```

`appsettings.Development.json` is **gitignored** — create your own copy:

```powershell
Copy-Item appsettings.Development.json.example appsettings.Development.json
```

Edit `appsettings.Development.json`:

1. **`ConnectionStrings:UletiSmenu`** — set to your SQL instance (see examples above).  
   The example file may reference a machine-specific server name; **change it** to yours.

2. **`FileSettings:UploadPath`** — e.g. `D:\uploads` or a folder under the project. The API creates this directory on startup.

3. **`AdminSeed`** (recommended for local dev) — auto-creates an admin account:

```json
"AdminSeed": {
  "Enabled": true,
  "Email": "admin@uletismenu.local",
  "Password": "Admin123!",
  "PhoneNumber": "+381600000001"
}
```

Run the API:

```powershell
dotnet restore
dotnet run --launch-profile https
```

Verify: `https://localhost:7029/swagger`

See the [backend README](https://github.com/lukavi44/uleti-smenu-backend) and `UletiSmenu/docs/` for production config, staging deploy, and billing notes.

### 4. Configure and run the frontend

```powershell
cd .\uleti-smenu_react\uleti-smenu
```

`.env` is **gitignored** — create from the example:

```powershell
Copy-Item .env.example .env
```

`.env` should contain:

```env
VITE_API_BASE_URL=https://localhost:7029
```

```powershell
npm install
npm run dev
```

App: `http://localhost:5173`

### 5. Run both projects

Use two terminals:

```powershell
# Terminal 1 — API
cd .\uleti-smenu-backend\UletiSmenu\API
dotnet run --launch-profile https

# Terminal 2 — frontend
cd .\uleti-smenu_react\uleti-smenu
npm run dev
```

Then open `http://localhost:5173`.

### 6. Log in and smoke-test

| Account | Credentials |
|---------|-------------|
| Admin | `admin@uletismenu.local` / `Admin123!` (if `AdminSeed` is enabled) |
| Employer / candidate | Register at `/registration` |

New employer accounts receive **5 free job-post credits** on registration.

SMTP and Stripe can stay empty locally. Payments are disabled by default (`Stripe:Enabled: false`).

### 7. Troubleshooting

| Problem | What to try |
|---------|-------------|
| SQL connection errors | Start the SQL Server service; fix `ConnectionStrings:UletiSmenu` |
| HTTPS / certificate warnings | `dotnet dev-certs https --trust` |
| CORS errors | Frontend must run on `http://localhost:5173` |
| API won't start | Check SQL Server is running; read API console logs |

---

## Frontend scripts

```powershell
cd uleti-smenu
npm run dev      # development server
npm run build    # production build
npm run lint     # ESLint
```

Env templates: `.env.example` (local), `.env.staging.example` (staging build).
