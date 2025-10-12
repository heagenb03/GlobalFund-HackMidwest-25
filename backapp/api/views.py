from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404

from organizations.models import Organization
from donations.models import Donation
from blockchain.web3_client import blockchain_utils

from .serializers import (
    OrganizationListSerializer,
    OrganizationDetailSerializer,
    DonationSerializer,
    DonationCreateSerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class OrganizationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Organization model
    """
    queryset = Organization.objects.all()
    pagination_class = StandardPagination
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OrganizationListSerializer
        return OrganizationDetailSerializer
    
    def get_queryset(self):
        queryset = Organization.objects.all()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by featured
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            queryset = queryset.filter(featured=featured.lower() == 'true')
        
        # Filter by verified
        verified = self.request.query_params.get('verified', None)
        if verified is not None:
            queryset = queryset.filter(verified=verified.lower() == 'true')
        
        # Search by name or description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                description__icontains=search
            )
        
        return queryset


class DonationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Donation model
    """
    queryset = Donation.objects.all()
    pagination_class = StandardPagination
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DonationCreateSerializer
        return DonationSerializer
    
    def get_queryset(self):
        queryset = Donation.objects.all()
        
        # Filter by organization
        org_id = self.request.query_params.get('organization', None)
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        # Filter by donor wallet
        donor_wallet = self.request.query_params.get('donor_wallet', None)
        if donor_wallet:
            queryset = queryset.filter(donor_wallet__iexact=donor_wallet)
        
        # Filter by status
        donation_status = self.request.query_params.get('status', None)
        if donation_status:
            queryset = queryset.filter(status=donation_status)
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def complete(self, request):
        """Mark a donation as completed with transaction hash"""
        donation_id = request.data.get('donation_id')
        tx_hash = request.data.get('transaction_hash')
        
        if not donation_id or not tx_hash:
            return Response(
                {'error': 'donation_id and transaction_hash are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            donation = Donation.objects.get(id=donation_id)
            donation.complete(tx_hash)
            
            serializer = DonationSerializer(donation)
            return Response(serializer.data)
        except Donation.DoesNotExist:
            return Response(
                {'error': 'Donation not found'},
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(['POST'])
def validate_wallet(request):
    """Validate a wallet address format"""
    address = request.data.get('address')
    
    if not address:
        return Response(
            {'error': 'address is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    is_valid = blockchain_utils.validate_eth_address(address)
    formatted = blockchain_utils.format_address(address) if is_valid else None
    
    return Response({
        'valid': is_valid,
        'address': address,
        'formatted': formatted
    })


@api_view(['POST'])
def validate_transaction(request):
    """Validate a transaction hash format"""
    tx_hash = request.data.get('transaction_hash')
    
    if not tx_hash:
        return Response(
            {'error': 'transaction_hash is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    is_valid = blockchain_utils.validate_tx_hash(tx_hash)
    formatted = blockchain_utils.format_tx_hash(tx_hash) if is_valid else None
    
    return Response({
        'valid': is_valid,
        'transaction_hash': tx_hash,
        'formatted': formatted
    })


@api_view(['GET'])
def get_donation_stats(request):
    """Get overall donation statistics"""
    from django.db.models import Sum, Count
    
    completed_donations = Donation.objects.filter(status='completed')
    
    total_amount = completed_donations.aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    total_usd = completed_donations.aggregate(
        total=Sum('amount_usd')
    )['total'] or 0
    
    unique_donors = completed_donations.values('donor_wallet').distinct().count()
    total_donations = completed_donations.count()
    
    return Response({
        'total_amount_sbc': float(total_amount),
        'total_amount_usd': float(total_usd),
        'total_donations': total_donations,
        'unique_donors': unique_donors,
        'organizations_count': Organization.objects.count()
    })


@api_view(['GET'])
def health_check(request):
    """Health check endpoint"""
    from django.db import connection
    
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_connected = True
    except Exception:
        db_connected = False
    
    return Response({
        'status': 'healthy' if db_connected else 'unhealthy',
        'database_connected': db_connected,
        'version': '1.0.0'
    })
