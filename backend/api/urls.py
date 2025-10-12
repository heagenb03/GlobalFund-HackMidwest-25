from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'organizations', views.OrganizationViewSet, basename='organization')
router.register(r'donations', views.DonationViewSet, basename='donation')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Validation endpoints
    path('validate/wallet/', views.validate_wallet, name='validate-wallet'),
    path('validate/transaction/', views.validate_transaction, name='validate-transaction'),
    
    # Stats endpoint
    path('stats/', views.get_donation_stats, name='donation-stats'),
    
    # Health check
    path('health/', views.health_check, name='health-check'),
]
