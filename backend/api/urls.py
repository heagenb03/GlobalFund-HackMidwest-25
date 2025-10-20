from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'organizations', views.OrganizationViewSet, basename='organization')
router.register(r'donations', views.DonationViewSet, basename='donation')

urlpatterns = [
    path('', include(router.urls)),
    
    path('validate/wallet/', views.validate_wallet, name='validate-wallet'),
    path('validate/transaction/', views.validate_transaction, name='validate-transaction'),
    
    path('stats/', views.get_donation_stats, name='donation-stats'),
    
    path('health/', views.health_check, name='health-check'),
]
