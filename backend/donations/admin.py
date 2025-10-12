from django.contrib import admin
from .models import Donation


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['organization', 'donor_name', 'amount', 'status', 'created_at', 'completed_at']
    list_filter = ['status', 'organization', 'created_at']
    search_fields = ['donor_name', 'donor_email', 'donor_wallet', 'transaction_hash']
    readonly_fields = ['created_at', 'completed_at']
    date_hierarchy = 'created_at'
