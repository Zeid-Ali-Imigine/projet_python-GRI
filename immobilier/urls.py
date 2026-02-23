from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (UtilisateurViewSet, BienImmobilierViewSet, DemandeLocationViewSet,
                    BailViewSet, PaiementViewSet, ChargeDepenseViewSet)

router = DefaultRouter()
router.register(r'utilisateurs', UtilisateurViewSet)
router.register(r'biens', BienImmobilierViewSet)
router.register(r'demandes', DemandeLocationViewSet)
router.register(r'baux', BailViewSet)
router.register(r'paiements', PaiementViewSet)
router.register(r'charges', ChargeDepenseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
