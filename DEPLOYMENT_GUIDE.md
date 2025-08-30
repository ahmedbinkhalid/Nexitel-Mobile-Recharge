# Production Deployment Guide for Nexitel POS System

## VPS Production Environment Setup

### 1. Environment Variables (.env for production)

Create a `.env` file on your VPS with these settings:

```bash
# Production Database (Use your own PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/nexitel_pos"

# Production Settings
NODE_ENV=production
PORT=5000

# Session Security (IMPORTANT!)
SESSION_SECRET="your-super-secure-random-32-character-string"

# Domain Settings
DOMAIN=nexitel.org

# Email (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@nexitel.org
```

### 2. Database Setup on VPS

You need to set up your own PostgreSQL database:

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE nexitel_pos;
CREATE USER nexitel_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nexitel_pos TO nexitel_user;
\q
```

### 3. Required Production Changes

#### A. Update server/index.ts for production:

```javascript
// Session configuration for production
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: true, // HTTPS only in production
    httpOnly: true,
    sameSite: 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.nexitel.org' : undefined
  },
}));
```

#### B. HTTPS Configuration (Required for production)

Set up SSL certificate with Let's Encrypt:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d nexitel.org -d www.nexitel.org
```

### 4. Build and Deploy Steps

```bash
# 1. Build the application
npm run build

# 2. Install PM2 for production process management
npm install -g pm2

# 3. Start the application
pm2 start dist/index.js --name "nexitel-pos"

# 4. Setup PM2 to restart on reboot
pm2 startup
pm2 save
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/nexitel.org`:

```nginx
server {
    listen 80;
    server_name nexitel.org www.nexitel.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nexitel.org www.nexitel.org;

    ssl_certificate /etc/letsencrypt/live/nexitel.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nexitel.org/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Database Migration

Run these commands to set up your database schema:

```bash
# Push schema to your production database
npm run db:push

# Or manually create tables if needed
```

### 7. Common Issues and Solutions

#### Issue: Login not working
**Solution**: 
- Ensure SESSION_SECRET is set in production
- Check that HTTPS is properly configured
- Verify database connection
- Check that session table is created

#### Issue: Database connection errors
**Solution**:
- Update DATABASE_URL to point to your VPS PostgreSQL
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check firewall settings: `sudo ufw allow 5432`

#### Issue: CORS errors
**Solution**: Add proper headers in server/index.ts:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://nexitel.org');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
```

### 8. Default Admin User

Create the default admin user in your production database:

```sql
INSERT INTO users (username, email, password, role, balance, is_active) 
VALUES (
  'admin', 
  'admin@nexitel.org', 
  '$2b$10$hash_of_your_password', 
  'admin', 
  '10000.00', 
  true
);
```

Use bcrypt to hash your password first.

## Quick Fix for Current Issue

The immediate issue is likely that your VPS is using the Replit database URL. Update your VPS `.env` file to use a local PostgreSQL database instead of the Neon database URL shown in the current `.env` file.