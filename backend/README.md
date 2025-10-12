# Django Backend for StableCoin Project

A Django REST API backend for the GlobalFund stablecoin donation platform.

## Features

- RESTful API for organizations and donations
- Web3 integration for blockchain transactions
- SBC token balance tracking
- Transaction history
- CORS enabled for Next.js frontend

## Setup

### 1. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

### 4. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 6. Load Sample Data (Optional)

```bash
python manage.py loaddata organizations
```

### 7. Run Development Server

```bash
python manage.py runserver 8000
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Organizations

- `GET /api/organizations/` - List all organizations
- `GET /api/organizations/{id}/` - Get organization details
- `POST /api/organizations/` - Create organization
- `PUT /api/organizations/{id}/` - Update organization
- `DELETE /api/organizations/{id}/` - Delete organization

### Donations

- `GET /api/donations/` - List all donations
- `GET /api/donations/{id}/` - Get donation details
- `POST /api/donations/` - Create donation
- `GET /api/donations/organization/{org_id}/` - Get donations for organization

### Transactions

- `GET /api/transactions/` - List transactions
- `GET /api/transactions/{hash}/` - Get transaction by hash
- `POST /api/transactions/verify/` - Verify transaction on blockchain

### Wallets

- `GET /api/wallets/balance/{address}/` - Get SBC token balance
- `GET /api/wallets/transactions/{address}/` - Get transaction history

## Project Structure

```
backapp/
├── manage.py
├── requirements.txt
├── .env.example
├── .env (create this)
├── config/              # Django project settings
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── api/                 # Main API app
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── organizations/       # Organizations app
│   └── ...
├── donations/          # Donations app
│   └── ...
└── blockchain/         # Blockchain utilities
    └── web3_client.py
```

## Integration with Next.js Frontend

Update your Next.js API calls to point to:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
```

## Development

### Running Tests

```bash
python manage.py test
```

### Making Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Configure proper `SECRET_KEY`
3. Set up PostgreSQL database
4. Configure `ALLOWED_HOSTS`
5. Collect static files: `python manage.py collectstatic`
6. Use Gunicorn: `gunicorn config.wsgi:application`

## Tech Stack

- Django 5.0
- Django REST Framework
- Web3.py for blockchain interaction
- SQLite (dev) / PostgreSQL (prod)
- CORS headers for frontend integration
