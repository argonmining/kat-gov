# Kat-Gov

## Prerequisites

Before setting up the application, ensure you have the following installed on your Ubuntu VPS:

- Bun (JavaScript runtime)
- PostgreSQL

## Setup Instructions

### 1. Update and Upgrade the System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Bun

Install Bun by running the following command:

```bash
curl -fsSL https://bun.sh/install | bash
```

After installation, ensure Bun is in your PATH. You may need to restart your terminal or source your profile:

```bash
source ~/.bashrc
```

Verify the installation:

```bash
bun -v
```

### 3. Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
```

### 4. Set Up the Database

Switch to the PostgreSQL user and create a new database and user:

```bash
sudo -i -u postgres
psql
```

In the PostgreSQL shell, run:

```sql
CREATE DATABASE katgov;
CREATE USER katgovuser WITH ENCRYPTED PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE katgov TO katgovuser;
\q
exit
```

### 5. Clone the Repository

Clone the Kat Gov repository to your VPS:

```bash
git clone https://github.com/yourusername/kat-gov.git
cd kat-gov
```


### 6. Set Up Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

```env
DB_USER=katgovuser
DB_PASS=yourpassword
DB_NAME=katgov
DB_HOST=localhost
DB_PORT=5432
PORT=8080
KASPA_API_BASE_URL=https://api.kaspa.org
```

### 7. Install Project Dependencies

Install the necessary packages using Bun:

```bash
bun install
```

### 8. Build the Project

Compile the TypeScript code to JavaScript:

```bash
bun run tsc
```

### 9. Run the Application

You can run the application using PM2 to ensure it stays up:

```bash
bun install -g pm2
pm2 start dist/index.js --name kat-gov
pm2 save
pm2 startup
```


### 10. Verify the Application

Visit `http://your-vps-ip:8080` to verify that the application is running.

## Additional Information

- **CORS Configuration**: The application is configured to allow CORS from any origin.
- **Testing**: Run tests using `bun test`.

For more detailed information about the application architecture and endpoints, refer to the `backendPlans.md` file.
