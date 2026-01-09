# Backend Deployment Checklist

## ✅ Completed

- [x] Fixed `requirements.txt` with all actual dependencies (22 packages)
- [x] Created `.env` file with development configuration
- [x] Created `.env.production` template for production deployment
- [x] Created `.env.example` as documentation template
- [x] Generated secure JWT secret key
- [x] Updated `config.py` with:
  - Environment detection (FLASK_ENV)
  - CORS origins configuration from .env
  - Production validation (raises error if deploying with dev secrets)
  - Warning messages for development mode
- [x] Updated `app.py` to use CORS origins from config
- [x] Verified app initializes without errors

## 📋 Required for Production Deployment

### 1. **Database Setup** (REQUIRED)
   - [ ] Set up PostgreSQL database on production server
   - [ ] Update `DATABASE_URL` in `.env.production`
   - [ ] Run database migrations: `flask db upgrade`

### 2. **JWT Secret Key** (CRITICAL)
   - [ ] Generate production JWT secret:
     ```bash
     python3 -c "import secrets; print(secrets.token_urlsafe(32))"
     ```
   - [ ] Add to `.env.production` as `JWT_SECRET_KEY=<your-secret>`

### 3. **CORS Configuration** (REQUIRED)
   - [ ] Update `ALLOWED_ORIGINS` in `.env.production` with actual frontend domain(s)
   - [ ] Example: `https://yourdomain.com,https://www.yourdomain.com`

### 4. **Environment Variables** (REQUIRED)
   - [ ] Copy `.env.production` and set all values
   - [ ] Set `FLASK_ENV=production`
   - [ ] Set `JWT_EXPIRATION_HOURS` (recommend 24)

### 5. **Vercel Deployment** (If using Vercel)
   - [ ] Add environment variables to Vercel project settings
   - [ ] Deploy with: `vercel --prod`
   - [ ] Or push to main branch if auto-deploy enabled

### 6. **Render.com Deployment** (If using Render)
   - [ ] Create PostgreSQL database on Render
   - [ ] Set `DATABASE_URL` to Render database URL
   - [ ] Deploy and set environment variables

### 7. **Testing** (BEFORE going live)
   - [ ] Test API endpoints with production URL
   - [ ] Test authentication (login, token generation)
   - [ ] Test CORS from frontend origin
   - [ ] Test database connectivity

## 📝 Quick Reference - Environment Files

**Development (.env)**: 
- `FLASK_ENV=development`
- `DEBUG=True`
- Database points to localhost
- Uses generated JWT secret key

**Production (.env.production)**:
- `FLASK_ENV=production`
- `DEBUG=False`
- Database points to production database
- MUST have unique JWT secret key
- MUST have correct ALLOWED_ORIGINS

## 🚀 Deployment Commands

```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
flask db upgrade

# Test locally
python3 app.py

# Deploy to Vercel
vercel --prod
```

## ⚠️ Important Notes

- **Never commit `.env` files** to git (use `.env.example` as template)
- **Always change JWT_SECRET_KEY** from development default for production
- **CORS origins** must match your actual frontend domain
- **Database migrations** must run before first deployment
- **JWT secret** cannot be changed after tokens are issued (users will be logged out)

---

**Status**: ✅ Backend ready for deployment (pending production configuration)
