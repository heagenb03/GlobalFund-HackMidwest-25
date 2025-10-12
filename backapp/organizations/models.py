from django.db import models
from django.utils import timezone


class Organization(models.Model):
    """Model for charitable organizations"""
    CATEGORIES = [
        ('water', 'Water & Sanitation'),
        ('education', 'Education'),
        ('healthcare', 'Healthcare'),
        ('environment', 'Environment'),
        ('poverty', 'Poverty Alleviation'),
        ('disaster', 'Disaster Relief'),
        ('human_rights', 'Human Rights'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORIES)
    location = models.CharField(max_length=255)
    description = models.TextField()
    long_description = models.TextField(blank=True)
    wallet_address = models.CharField(max_length=42, unique=True)
    
    # Fundraising goals
    goal_amount = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    raised_amount = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    
    # Stats
    donor_count = models.IntegerField(default=0)
    
    # Metadata
    image_emoji = models.CharField(max_length=10, default='🌍')
    verified = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    founded_year = models.IntegerField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-featured', '-created_at']
        
    def __str__(self):
        return self.name
    
    def update_stats(self):
        """Update raised amount and donor count from donations"""
        from donations.models import Donation
        donations = Donation.objects.filter(organization=self, status='completed')
        self.raised_amount = sum(d.amount for d in donations)
        self.donor_count = donations.values('donor_wallet').distinct().count()
        self.save()


class OrganizationImpact(models.Model):
    """Impact metrics for an organization"""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='impacts')
    metric = models.CharField(max_length=255)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        
    def __str__(self):
        return f"{self.organization.name} - {self.metric}"


class OrganizationUpdate(models.Model):
    """News updates from organizations"""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.organization.name} - {self.title}"
