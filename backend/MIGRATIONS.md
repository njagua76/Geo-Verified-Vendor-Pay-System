# Database Migrations Guide

This project uses **Flask-Migrate** (Alembic) for database schema management. This approach is professional and production-ready.

## Why Alembic Instead of db.create_all()?

### ❌ Problems with `db.create_all()`:
- No version control for schema changes
- Can't rollback changes if something breaks
- Loses data when recreating tables
- No history of what changed and when
- Difficult for team collaboration
- Risky in production environments

### ✅ Benefits of Alembic Migrations:
- **Version Control**: Every schema change is tracked in migration files
- **Reversible**: Can rollback to previous versions with `flask db downgrade`
- **Data Preservation**: Migrations modify existing tables without losing data
- **Team Collaboration**: Teammates can apply your schema changes easily
- **Production Safe**: Test migrations in dev, then apply to production
- **Audit Trail**: Clear history of all database changes

---

## Common Migration Commands

### 1. Initialize Migrations (One-Time Setup)
```bash
flask db init
```
- Creates the `migrations/` folder with Alembic configuration
- Only run once per project
- Already done for this project ✅

### 2. Create a New Migration
```bash
flask db migrate -m "Description of changes"
```
- Auto-detects changes in your models
- Generates a migration file in `migrations/versions/`
- **Always review the generated file** before applying

**Example:**
```bash
flask db migrate -m "Add payment_status column to transactions"
```

### 3. Apply Migrations
```bash
flask db upgrade
```
- Applies all pending migrations to the database
- Creates/modifies tables based on migration files
- Run this after pulling new code from teammates

### 4. Rollback Migrations
```bash
# Rollback one migration
flask db downgrade

# Rollback to a specific migration
flask db downgrade <revision_id>

# Rollback all migrations
flask db downgrade base
```

### 5. View Migration History
```bash
flask db history
```
- Shows all migrations and their status

### 6. Check Current Migration Version
```bash
flask db current
```
- Shows which migration is currently applied

---

## Typical Development Workflow

### Adding a New Model or Field:

1. **Modify your model** in `models/`:
   ```python
   # models/transaction.py
   class Transaction(db.Model):
       id = db.Column(db.Integer, primary_key=True)
       amount = db.Column(db.Float, nullable=False)
       # NEW FIELD:
       payment_status = db.Column(db.String(50), default='pending')
   ```

2. **Generate migration**:
   ```bash
   flask db migrate -m "Add payment_status to Transaction"
   ```

3. **Review the migration file** in `migrations/versions/`:
   - Check the `upgrade()` function (what happens when applied)
   - Check the `downgrade()` function (how to rollback)

4. **Apply the migration**:
   ```bash
   flask db upgrade
   ```

5. **Test your changes**:
   - Verify the new column exists
   - Test your application logic

---

## Migration File Structure

```
migrations/
├── versions/
│   ├── 25bd9bdd734f_initial_migration_with_role_and_user_.py  # Your migrations
│   └── ...
├── alembic.ini       # Alembic configuration
├── env.py            # Migration environment setup
├── script.py.mako    # Template for new migrations
└── README
```

---

## Current Project Migrations

### ✅ Initial Migration (25bd9bdd734f)
- Created `roles` table (id, role_name)
- Created `users` table (id, email, password_hash, role_id)
- Established foreign key relationship between users and roles

---

## Troubleshooting

### Issue: "No changes in schema detected"
**Cause**: Your database already has the tables
**Solution**: 
```bash
# Option 1: Mark current state as baseline
flask db stamp head

# Option 2: Drop tables and recreate with migrations
python -c "from app import create_app; from models import db; app=create_app(); app.app_context().push(); db.drop_all()"
flask db migrate -m "Initial migration"
flask db upgrade
```

### Issue: Migration conflicts
**Cause**: Multiple people created migrations at the same time
**Solution**: Merge migration files or create a new migration to resolve conflicts

### Issue: Need to edit a migration
1. **Before applying**: Just edit the file in `migrations/versions/`
2. **After applying**: Create a new migration to fix the issue (don't edit old ones)

---

## Best Practices

1. ✅ **Always review auto-generated migrations** - Alembic isn't perfect
2. ✅ **Write descriptive migration messages** - Future you will thank you
3. ✅ **Test migrations in development first** - Never apply untested migrations to production
4. ✅ **One logical change per migration** - Easier to rollback if needed
5. ✅ **Commit migration files to Git** - Team members need them
6. ✅ **Never edit applied migrations** - Create new ones instead
7. ✅ **Backup production DB before migrating** - Safety first

---

## Production Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Activate virtual environment
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Backup database (important!)
pg_dump geo_vendor_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 5. Apply migrations
flask db upgrade

# 6. Restart application
systemctl restart geo-vendor-api
```

---

## Summary

Migrations give you:
- 📜 **History**: Track every database change
- 🔄 **Reversibility**: Rollback when things go wrong
- 🤝 **Collaboration**: Share schema changes with team
- 🛡️ **Safety**: Preserve data during schema changes
- 🚀 **Confidence**: Test changes before production

Keep your migrations clean, descriptive, and tested! 🎯
