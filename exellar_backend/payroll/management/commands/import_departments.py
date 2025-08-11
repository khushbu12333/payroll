from django.core.management.base import BaseCommand
from payroll.models import Department

class Command(BaseCommand):
    help = 'Import departments from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        import csv
        csv_file = options['csv_file']
        with open(csv_file, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                Department.objects.get_or_create(name=row['name'])
        self.stdout.write(self.style.SUCCESS('Departments imported!')) 