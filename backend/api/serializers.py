from rest_framework import serializers
from organizations.models import Organization, OrganizationImpact, OrganizationUpdate
from donations.models import Donation


class OrganizationImpactSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationImpact
        fields = ['id', 'metric', 'order']


class OrganizationUpdateSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    
    class Meta:
        model = OrganizationUpdate
        fields = ['id', 'title', 'content', 'date', 'created_at']
    
    def get_date(self, obj):
        """Format date as relative time"""
        from django.utils import timezone
        diff = timezone.now() - obj.created_at
        
        if diff.days == 0:
            hours = diff.seconds // 3600
            if hours == 0:
                return "Just now"
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.days == 1:
            return "1 day ago"
        elif diff.days < 7:
            return f"{diff.days} days ago"
        elif diff.days < 30:
            weeks = diff.days // 7
            return f"{weeks} week{'s' if weeks > 1 else ''} ago"
        else:
            return obj.created_at.strftime('%B %d, %Y')


class OrganizationListSerializer(serializers.ModelSerializer):
    """Serializer for organization list view"""
    image = serializers.CharField(source='image_emoji')
    raised = serializers.DecimalField(source='raised_amount', max_digits=20, decimal_places=2)
    goal = serializers.DecimalField(source='goal_amount', max_digits=20, decimal_places=2)
    donors = serializers.IntegerField(source='donor_count')
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'category', 'location', 'description',
            'image', 'verified', 'featured', 'raised', 'goal', 'donors'
        ]


class OrganizationDetailSerializer(serializers.ModelSerializer):
    """Serializer for organization detail view"""
    image = serializers.CharField(source='image_emoji')
    raised = serializers.DecimalField(source='raised_amount', max_digits=20, decimal_places=2)
    goal = serializers.DecimalField(source='goal_amount', max_digits=20, decimal_places=2)
    donors = serializers.IntegerField(source='donor_count')
    founded = serializers.CharField(source='founded_year', allow_null=True)
    longDescription = serializers.CharField(source='long_description')
    impact = OrganizationImpactSerializer(source='impacts', many=True, read_only=True)
    updates = OrganizationUpdateSerializer(many=True, read_only=True)
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'category', 'location', 'description', 'longDescription',
            'image', 'verified', 'featured', 'raised', 'goal', 'donors',
            'founded', 'impact', 'updates', 'wallet_address'
        ]


class DonationSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = Donation
        fields = [
            'id', 'organization', 'organization_name', 'donor_name', 'donor_email',
            'donor_wallet', 'amount', 'amount_usd', 'transaction_hash',
            'status', 'message', 'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'completed_at', 'status']


class DonationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = [
            'organization', 'donor_name', 'donor_email', 'donor_wallet',
            'amount', 'amount_usd', 'message'
        ]
    
    def create(self, validated_data):
        return Donation.objects.create(**validated_data)



