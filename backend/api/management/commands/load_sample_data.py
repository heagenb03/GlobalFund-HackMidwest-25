from django.core.management.base import BaseCommand
from organizations.models import Organization, OrganizationImpact, OrganizationUpdate


class Command(BaseCommand):
    help = 'Load sample organizations into the database'

    def handle(self, *args, **kwargs):
        self.stdout.write('Loading sample organizations...')
        
        # Clear existing data
        Organization.objects.all().delete()
        
        # Create organizations
        orgs_data = [
            {
                'name': 'Global Water Initiative',
                'category': 'water',
                'location': 'Kenya',
                'description': 'Providing clean water access to rural communities across East Africa',
                'long_description': 'The Global Water Initiative works tirelessly to bring clean, safe drinking water to rural communities throughout East Africa. Our mission is to end water poverty by building sustainable water systems, training local technicians, and empowering communities to maintain their own water infrastructure. Since 2015, we\'ve helped over 50,000 people gain access to clean water.',
                'wallet_address': '0x1111111111111111111111111111111111111111',
                'goal_amount': 100000,
                'raised_amount': 45000,
                'donor_count': 234,
                'image_emoji': '💧',
                'verified': True,
                'featured': True,
                'founded_year': 2015,
                'impacts': [
                    '50,000+ people served',
                    '120 wells constructed',
                    '45 communities transformed',
                    '98% sustainability rate',
                ],
                'updates': [
                    {'title': 'New Well Completed in Kitui', 'content': 'We just completed our 120th well, bringing clean water to 500 families in Kitui County.'},
                    {'title': 'Training Program Success', 'content': '30 local technicians completed our maintenance training program.'},
                ]
            },
            {
                'name': 'Education for All',
                'category': 'education',
                'location': 'India',
                'description': 'Building schools and providing educational resources in underserved areas',
                'long_description': 'Education for All is committed to providing quality education to children in underserved communities across India. We build schools, train teachers, provide learning materials, and offer scholarships to ensure every child has the opportunity to learn and thrive.',
                'wallet_address': '0x2222222222222222222222222222222222222222',
                'goal_amount': 150000,
                'raised_amount': 78000,
                'donor_count': 456,
                'image_emoji': '📚',
                'verified': True,
                'featured': True,
                'founded_year': 2012,
                'impacts': [
                    '15 schools built',
                    '3,200+ students enrolled',
                    '150 teachers trained',
                    '85% graduation rate',
                ],
                'updates': [
                    {'title': 'New Computer Lab Opened', 'content': 'Students now have access to modern technology and digital learning resources.'},
                ]
            },
            {
                'name': 'Healthcare Without Borders',
                'category': 'healthcare',
                'location': 'Multiple',
                'description': 'Delivering medical aid and supplies to communities in crisis',
                'long_description': 'Healthcare Without Borders provides essential medical care, supplies, and support to communities affected by conflict, natural disasters, and poverty. Our team of volunteer medical professionals delivers emergency care, conducts health screenings, and establishes sustainable healthcare infrastructure.',
                'wallet_address': '0x3333333333333333333333333333333333333333',
                'goal_amount': 200000,
                'raised_amount': 123000,
                'donor_count': 789,
                'image_emoji': '⚕️',
                'verified': True,
                'featured': False,
                'founded_year': 2010,
                'impacts': [
                    '500,000+ patients treated',
                    '50+ mobile clinics',
                    '200+ healthcare workers',
                    '30 countries served',
                ],
                'updates': []
            },
        ]
        
        for org_data in orgs_data:
            impacts = org_data.pop('impacts', [])
            updates = org_data.pop('updates', [])
            
            org = Organization.objects.create(**org_data)
            
            # Add impacts
            for idx, impact_text in enumerate(impacts):
                OrganizationImpact.objects.create(
                    organization=org,
                    metric=impact_text,
                    order=idx
                )
            
            # Add updates
            for update_data in updates:
                OrganizationUpdate.objects.create(
                    organization=org,
                    **update_data
                )
            
            self.stdout.write(self.style.SUCCESS(f'✓ Created: {org.name}'))
        
        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully loaded {len(orgs_data)} organizations!'))
