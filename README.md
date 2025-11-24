# 0. Fork the Repository 
Click on the fork option above, which will create a clone of this repository in your github account

Then clone that repository on you loacl machine

# 0.1. Install the nest js
Below will install nestjs locally in you machine
```bash
npm install -g @nestjs/cli
```

# 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Eventra-backend
```


# 2. Install Dependencies
```bash
pnpm install
```

If pnpm is not installed:
```bash
npm install -g pnpm
```

# 3. Create .env File

Create a .env file in the root folder:
```bash
DB_HOST=localhost
DB_PORT=27017
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_NAME=eventra_db
DB_URI=mongodb://eventra_user:your_password@localhost:27017/eventra_db?authSource=admin
```

# 4. Start MongoDB Using Docker
Make the following changes in docker-compose.yml

```bash
MONGO_INITDB_ROOT_USERNAME: root
MONGO_INITDB_ROOT_PASSWORD: DB_PASSWORD
```

Start MongoDB
```bash
docker compose up -d
```

Stop MongoDB
```bash
docker compose down
```

Check containers
```bash
docker ps
```

You should see a container named eventra.

# 5. Start the Backend
Development mode
For now run this command to check
```bash
pnpm run start:dev
```

Normal mode
```bash
pnpm run start
```

Production mode
```bash
pnpm run start:prod
```

