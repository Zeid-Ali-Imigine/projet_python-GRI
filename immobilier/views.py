from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Utilisateur, BienImmobilier, DemandeLocation, Bail, Paiement, ChargeDepense
from .serializers import (UtilisateurSerializer, UtilisateurCreateSerializer, BienImmobilierSerializer,
                          DemandeLocationSerializer, BailSerializer, PaiementSerializer, ChargeDepenseSerializer)

class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UtilisateurCreateSerializer
        return UtilisateurSerializer

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def bloquer(self, request, pk=None):
        utilisateur = self.get_object()
        utilisateur.is_active = False
        utilisateur.save()
        return Response({'status': 'Utilisateur bloqué'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def debloquer(self, request, pk=None):
        utilisateur = self.get_object()
        utilisateur.is_active = True
        utilisateur.save()
        return Response({'status': 'Utilisateur débloqué'}, status=status.HTTP_200_OK)

class BienImmobilierViewSet(viewsets.ModelViewSet):
    queryset = BienImmobilier.objects.all()
    serializer_class = BienImmobilierSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # L'utilisateur courant doit être assigné comme propriétaire, ou gérer cela depuis le front-end
        serializer.save()

class DemandeLocationViewSet(viewsets.ModelViewSet):
    queryset = DemandeLocation.objects.all()
    serializer_class = DemandeLocationSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return DemandeLocation.objects.none()
        if user.role == 'admin':
            return DemandeLocation.objects.all()
        if user.role == 'owner':
            return DemandeLocation.objects.filter(bien__proprietaire=user)
        return DemandeLocation.objects.filter(candidat=user)

    def perform_create(self, serializer):
        if self.request.user.is_authenticated and self.request.user.role == 'tenant':
            serializer.save(candidat=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def accepter(self, request, pk=None):
        demande = self.get_object()
        demande.statut = 'acceptee'
        demande.save()
        return Response({'status': 'demande acceptée'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def refuser(self, request, pk=None):
        demande = self.get_object()
        demande.statut = 'refusee'
        demande.save()
        return Response({'status': 'demande refusée'}, status=status.HTTP_200_OK)

class BailViewSet(viewsets.ModelViewSet):
    queryset = Bail.objects.all()
    serializer_class = BailSerializer

class PaiementViewSet(viewsets.ModelViewSet):
    queryset = Paiement.objects.all()
    serializer_class = PaiementSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Paiement.objects.none()
        if user.role == 'admin':
            return Paiement.objects.all()
        if user.role == 'owner':
            return Paiement.objects.filter(bail__bien__proprietaire=user)
        return Paiement.objects.filter(bail__locataire=user)

    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        paiement = self.get_object()
        paiement.statut = 'valide'
        paiement.save()
        return Response({'status': 'paiement validé'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def refuser(self, request, pk=None):
        paiement = self.get_object()
        paiement.statut = 'refuse'
        paiement.save()
        return Response({'status': 'paiement refusé'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=401)
        
        # Base querysets
        query_paiements = Paiement.objects.all()
        query_charges = ChargeDepense.objects.all()
        
        if user.role == 'owner':
            query_paiements = query_paiements.filter(bail__bien__proprietaire=user)
            query_charges = query_charges.filter(bien__proprietaire=user)
        elif user.role != 'admin':
            return Response({'error': 'Accès refusé'}, status=403)

        flux_entrants = query_paiements.filter(statut='valide').aggregate(total=models.Sum('montant'))['total'] or 0
        flux_sortants = query_charges.aggregate(total=models.Sum('montant'))['total'] or 0
        paiements_attente = query_paiements.filter(statut='attente').count()
        paiements_refuses = query_paiements.filter(statut='refuse').count()
        
        return Response({
            'flux_entrants': flux_entrants,
            'flux_sortants': flux_sortants,
            'balance': flux_entrants - flux_sortants,
            'attente': paiements_attente,
            'refuses': paiements_refuses
        })

class ChargeDepenseViewSet(viewsets.ModelViewSet):
    queryset = ChargeDepense.objects.all()
    serializer_class = ChargeDepenseSerializer
