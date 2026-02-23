from rest_framework import serializers
from .models import Utilisateur, BienImmobilier, DemandeLocation, Bail, Paiement, ChargeDepense

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'email', 'role', 'telephone', 'first_name', 'last_name', 'is_active']

class UtilisateurCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = Utilisateur
        fields = ['username', 'email', 'password', 'role', 'telephone', 'first_name', 'last_name']

    def create(self, validated_data):
        user = Utilisateur.objects.create_user(**validated_data)
        return user

class BienImmobilierSerializer(serializers.ModelSerializer):
    nom_proprietaire = serializers.CharField(source='proprietaire.username', read_only=True)
    class Meta:
        model = BienImmobilier
        fields = '__all__'

class DemandeLocationSerializer(serializers.ModelSerializer):
    nom_candidat = serializers.SerializerMethodField()
    adresse_bien = serializers.SerializerMethodField()

    def get_nom_candidat(self, obj):
        try:
            if getattr(obj, 'candidat', None):
                return obj.candidat.username
            prenom = getattr(obj, 'prenom', '') or ''
            nom = getattr(obj, 'nom', '') or ''
            result = f"{prenom} {nom}".strip()
            return result if result else "Anonyme"
        except Exception:
            return "Anonyme"

    def get_adresse_bien(self, obj):
        try:
            return obj.bien.adresse if obj.bien else "Bien inconnu"
        except Exception:
            return "Inconnue"

    class Meta:
        model = DemandeLocation
        fields = ['id', 'candidat', 'bien', 'statut', 'date_demande', 'nom', 'prenom', 'telephone', 'message', 'documents_justificatifs', 'nom_candidat', 'adresse_bien']

class BailSerializer(serializers.ModelSerializer):
    nom_locataire = serializers.CharField(source='locataire.username', read_only=True)
    adresse_bien = serializers.CharField(source='bien.adresse', read_only=True)
    class Meta:
        model = Bail
        fields = '__all__'

class PaiementSerializer(serializers.ModelSerializer):
    nom_locataire = serializers.SerializerMethodField()
    adresse_bien = serializers.SerializerMethodField()

    def get_nom_locataire(self, obj):
        try:
            return obj.bail.locataire.username if obj.bail and obj.bail.locataire else "Locataire inconnu"
        except Exception:
            return "Inconnu"

    def get_adresse_bien(self, obj):
        try:
            return obj.bail.bien.adresse if obj.bail and obj.bail.bien else "Inconnue"
        except Exception:
            return "Inconnue"

    class Meta:
        model = Paiement
        fields = ['id', 'bail', 'montant', 'date_paiement', 'mode_paiement', 'numero_expediteur', 'statut', 'recu_document', 'nom_locataire', 'adresse_bien']

class ChargeDepenseSerializer(serializers.ModelSerializer):
    adresse_bien = serializers.CharField(source='bien.adresse', read_only=True)
    class Meta:
        model = ChargeDepense
        fields = '__all__'
