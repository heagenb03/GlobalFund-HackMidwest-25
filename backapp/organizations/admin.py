from django.contrib import admin
from .models import Organization, OrganizationImpact, OrganizationUpdate


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'location', 'verified', 'featured', 'raised_amount', 'donor_count']
    list_filter = ['category', 'verified', 'featured']
    search_fields = ['name', 'location', 'description']
    readonly_fields = ['raised_amount', 'donor_count', 'created_at', 'updated_at']


@admin.register(OrganizationImpact)
class OrganizationImpactAdmin(admin.ModelAdmin):
    list_display = ['organization', 'metric', 'order']
    list_filter = ['organization']
    ordering = ['organization', 'order']


@admin.register(OrganizationUpdate)
class OrganizationUpdateAdmin(admin.ModelAdmin):
    list_display = ['organization', 'title', 'created_at']
    list_filter = ['organization', 'created_at']
    search_fields = ['title', 'content']
    date_hierarchy = 'created_at'
