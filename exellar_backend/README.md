# Exellar Payroll Backend

A comprehensive Django REST API backend for payroll management system.

## Features

- **Employee Management**: Complete employee lifecycle management with detailed profiles
- **Department & Designation Management**: Organize employees by departments and job roles
- **Work Location Management**: Manage multiple office locations
- **Salary Components**: Flexible salary structure with earnings and deductions
- **Payroll Processing**: Complete payroll management with different statuses
- **REST API**: Full-featured REST API with filtering, searching, and pagination
- **Admin Interface**: Django admin for easy data management

## Technology Stack

- **Django 5.2.2**: Web framework
- **Django REST Framework 3.16.0**: API framework
- **PostgreSQL**: Database (recommended)
- **django-cors-headers**: CORS handling for frontend integration
- **django-filter**: Advanced filtering capabilities

## Setup Instructions

### 1. Prerequisites

- Python 3.8+ 
- PostgreSQL (recommended) or SQLite for development
- Virtual environment (recommended)

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd exellar_backend

# Create virtual environment
python -m venv env

# Activate virtual environment
# On macOS/Linux:
source env/bin/activate
# On Windows:
env\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Configuration

#### For PostgreSQL (Recommended):

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE exellar_db;
CREATE USER postgres WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE exellar_db TO postgres;
```

2. Update `exellar_backend/settings.py` with your database credentials:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'exellar_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',  # Update this
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

#### For SQLite (Development only):

Update `settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### 4. Run Migrations

```bash
# Apply migrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser
```

### 5. Start Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api-auth/login/` - Login
- `POST /api-auth/logout/` - Logout

### Employees
- `GET /api/employees/` - List all employees
- `POST /api/employees/` - Create new employee
- `GET /api/employees/{id}/` - Get employee details
- `PUT /api/employees/{id}/` - Update employee
- `DELETE /api/employees/{id}/` - Delete employee
- `GET /api/employees/stats/` - Employee statistics
- `POST /api/employees/bulk_create/` - Bulk create employees
- `GET /api/employees/{id}/salary_components/` - Get employee salary components
- `POST /api/employees/{id}/add_salary_component/` - Add salary component to employee
- `GET /api/employees/{id}/payroll_history/` - Get employee payroll history

### Departments
- `GET /api/departments/` - List all departments
- `POST /api/departments/` - Create new department
- `GET /api/departments/{id}/` - Get department details
- `PUT /api/departments/{id}/` - Update department
- `DELETE /api/departments/{id}/` - Delete department
- `GET /api/departments/stats/` - Department statistics

### Designations
- `GET /api/designations/` - List all designations
- `POST /api/designations/` - Create new designation
- `GET /api/designations/{id}/` - Get designation details
- `PUT /api/designations/{id}/` - Update designation
- `DELETE /api/designations/{id}/` - Delete designation
- `GET /api/designations/stats/` - Designation statistics

### Work Locations
- `GET /api/work-locations/` - List all work locations
- `POST /api/work-locations/` - Create new work location
- `GET /api/work-locations/{id}/` - Get work location details
- `PUT /api/work-locations/{id}/` - Update work location
- `DELETE /api/work-locations/{id}/` - Delete work location
- `GET /api/work-locations/stats/` - Work location statistics

### Salary Components
- `GET /api/salary-components/` - List all salary components
- `POST /api/salary-components/` - Create new salary component
- `GET /api/salary-components/{id}/` - Get salary component details
- `PUT /api/salary-components/{id}/` - Update salary component
- `DELETE /api/salary-components/{id}/` - Delete salary component
- `GET /api/salary-components/stats/` - Salary component statistics

### Payroll
- `GET /api/payroll/` - List all payroll records
- `POST /api/payroll/` - Create new payroll record
- `GET /api/payroll/{id}/` - Get payroll details
- `PUT /api/payroll/{id}/` - Update payroll
- `DELETE /api/payroll/{id}/` - Delete payroll
- `GET /api/payroll/stats/` - Payroll statistics
- `POST /api/payroll/{id}/process/` - Process a payroll
- `POST /api/payroll/{id}/mark_paid/` - Mark payroll as paid

## Query Parameters

### Filtering
Most endpoints support filtering:
- `?department=1` - Filter by department ID
- `?status=ACTIVE` - Filter by status
- `?employment_type=FULL_TIME` - Filter by employment type

### Searching
- `?search=john` - Search across relevant fields

### Ordering
- `?ordering=first_name` - Order by field
- `?ordering=-created_at` - Reverse order (descending)

### Pagination
- `?page=2` - Get specific page
- `?page_size=50` - Set page size (default: 20)

## Admin Interface

Access the Django admin at `http://localhost:8000/admin/` with your superuser credentials.

## Models Overview

### Employee
Main employee model with personal, employment, and salary information.

### Department
Organizational departments with optional head of department.

### Designation
Job titles and positions.

### WorkLocation
Office locations with address details.

### SalaryComponent
Configurable salary components (earnings/deductions).

### EmployeeSalaryComponent
Junction table linking employees to their salary components.

### Payroll
Payroll records with processing status and salary calculations.

## Development

### Running Tests
```bash
python manage.py test
```

### Creating Sample Data
You can create sample data through the Django admin or using the API endpoints.

## Frontend Integration

The backend is configured with CORS to work with frontend applications running on:
- `http://localhost:3000`
- `http://localhost:3001`

## Security Notes

- Change the `SECRET_KEY` in production
- Set `DEBUG = False` in production
- Configure proper database credentials
- Set up proper authentication/authorization for production use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Your License Here] 