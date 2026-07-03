# 🚀 Deployment Guide - صالون الذهبي

## Production Deployment Checklist

This guide helps you deploy your barber queue app to production.

### ✅ Pre-Deployment

- [ ] Change owner password in `.env.local`
- [ ] Test all pages locally
- [ ] Test login/logout
- [ ] Test dashboard access
- [ ] Verify responsive design on mobile
- [ ] Clear browser cache
- [ ] Test on different browsers

### ⚠️ CRITICAL - Change Owner Password!

**Before deploying, MUST change default password:**

Edit `.env.local`:
```
NEXT_PUBLIC_OWNER_EMAIL=admin@barbershop.com
NEXT_PUBLIC_OWNER_PASSWORD=your-new-secure-password
```

Generate strong password example:
```
- At least 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Not dictionary words
- Example: Barber@Shop2024!
```

---

## 🚢 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Deploy**
```bash
cd barber-queue-pro
vercel deploy
```

**Step 3: Configure Environment Variables**
- Vercel will prompt for `.env.local` values
- Or go to: Settings → Environment Variables
- Add: `NEXT_PUBLIC_OWNER_EMAIL` and `NEXT_PUBLIC_OWNER_PASSWORD`

**Step 4: Verify**
- Visit your deployment URL
- Test login with new credentials
- Test all pages

---

### Option 2: Netlify

**Step 1: Connect GitHub**
- Push your code to GitHub
- Go to https://netlify.com
- Click "New site from Git"
- Select your repository

**Step 2: Configure Build**
- Framework: **Next.js**
- Build command: `npm run build`
- Publish: `.next` (or default)

**Step 3: Set Environment Variables**
- Go to: Site Settings → Build & Deploy → Environment
- Add:
  ```
  NEXT_PUBLIC_OWNER_EMAIL=admin@barbershop.com
  NEXT_PUBLIC_OWNER_PASSWORD=your-new-password
  ```

**Step 4: Deploy**
- Netlify auto-deploys from GitHub
- Takes 2-5 minutes
- Check deployment status in dashboard

---

### Option 3: AWS Amplify

**Step 1: Connect Repository**
- Go to AWS Amplify
- Connect GitHub/GitLab repository
- Select main branch

**Step 2: Configure Build**
- Framework: **Next.js**
- Build: Amplify auto-detects

**Step 3: Set Environment Variables**
- Add in "Environment variables" section:
  ```
  NEXT_PUBLIC_OWNER_EMAIL=admin@barbershop.com
  NEXT_PUBLIC_OWNER_PASSWORD=your-new-password
  ```

**Step 4: Deploy**
- Click "Deploy"
- Wait for build completion
- Get live URL

---

### Option 4: Self-Hosted (AWS EC2, Google Cloud, etc.)

**Step 1: Prepare Server**
```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt-get install -y git
```

**Step 2: Clone & Setup**
```bash
# Clone your repository
git clone https://github.com/your-username/barber-queue-pro.git
cd barber-queue-pro

# Install dependencies
npm install

# Create .env.local with production values
cat > .env.local << EOF
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_OWNER_EMAIL=admin@barbershop.com
NEXT_PUBLIC_OWNER_PASSWORD=your-new-password
EOF
```

**Step 3: Build & Start**
```bash
# Build production bundle
npm run build

# Start production server
npm start
```

**Step 4: Keep Running (Production)**

Option A - Using PM2:
```bash
# Install PM2 globally
npm install -g pm2

# Start app with PM2
pm2 start "npm start" --name "barber-queue"

# Make it start on server reboot
pm2 startup
pm2 save
```

Option B - Using systemd:
```bash
# Create service file
sudo nano /etc/systemd/system/barber-queue.service
```

Add:
```ini
[Unit]
Description=Barber Queue App
After=network.target

[Service]
User=your-username
WorkingDirectory=/path/to/barber-queue-pro
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable barber-queue
sudo systemctl start barber-queue
```

**Step 5: Setup Reverse Proxy (Nginx)**

```bash
# Install Nginx
sudo apt-get install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/barber-queue
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/barber-queue /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Step 6: SSL Certificate (HTTPS)**
```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

---

## 🔐 Security Checklist

- ✅ Changed owner password
- ✅ Enabled HTTPS/SSL
- ✅ Set secure environment variables
- ✅ Disabled debug mode (`NODE_ENV=production`)
- ✅ Configured CORS if needed
- ✅ Set up monitoring/logging
- ✅ Regular backups enabled
- ✅ Security headers configured

---

## 📊 Post-Deployment

### Verify Deployment
1. Visit your live URL
2. Test all pages load
3. Test login works
4. Test queue functionality
5. Test mobile responsiveness
6. Check console for errors

### Monitor Performance
- Set up uptime monitoring
- Monitor errors/exceptions
- Check response times
- Monitor resource usage

### Backup & Recovery
- Regular code backups
- Database backups (if using)
- Disaster recovery plan

---

## 🆘 Deployment Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### App Won't Start
- Check `.env.local` values
- Verify Node.js version (18+)
- Check port availability
- Review server logs

### Login Not Working
- Verify environment variables set
- Check credentials in `.env.local`
- Restart application

### Performance Issues
- Check server resources (CPU, RAM)
- Monitor network requests
- Enable caching headers
- Consider CDN for static files

---

## 📝 Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `NEXT_PUBLIC_APP_URL` | App URL | `https://barbershop.com` |
| `NEXT_PUBLIC_OWNER_EMAIL` | Owner email | `admin@barbershop.com` |
| `NEXT_PUBLIC_OWNER_PASSWORD` | Owner password | `SecurePass123!` |

---

## 🎯 Deployment Complete!

Your app is now live and ready for customers! 🎉

### Next Steps:
1. Monitor for errors
2. Gather customer feedback
3. Plan future enhancements
4. Set up analytics
5. Promote to customers

---

Made with ❤️ for your barber shop
