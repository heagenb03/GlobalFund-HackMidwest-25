from django.db import models
from django.utils import timezone

class Donation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='donations'
    )
    
    donor_name = models.CharField(max_length=255, blank=True)
    donor_email = models.EmailField(blank=True)
    donor_wallet = models.CharField(max_length=42)
    
    amount = models.DecimalField(max_digits=20, decimal_places=18)  # Support token decimals
    amount_usd = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    
    transaction_hash = models.CharField(max_length=66, unique=True, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.donor_name or 'Anonymous'} -> {self.organization.name}: {self.amount}"
    
    def complete(self, transaction_hash):
        self.status = 'completed'
        self.transaction_hash = transaction_hash
        self.completed_at = timezone.now()
        self.save()
        
        # Update organization stats
        self.organization.update_stats()
