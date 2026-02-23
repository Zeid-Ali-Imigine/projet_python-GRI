from django.db import models
from django.contrib.auth.models import AbstractUser

class Utilisateur(AbstractUser):
    CHOIX_ROLES = (
        ('admin', 'Administrateur'),
        ('manager', 'Gestionnaire'),
        ('tenant', 'Locataire'),
        ('owner', 'Propriétaire'),
    )
    role = models.CharField(max_length=20, choices=CHOIX_ROLES, default='tenant', verbose_name="Rôle")
    telephone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone")

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"


class BienImmobilier(models.Model):
    TYPE_CHOIX = (
        ('appartement', 'Appartement'),
        ('maison', 'Maison'),
        ('commercial', 'Local Commercial'),
    )
    STATUT_CHOIX = (
        ('disponible', 'Disponible'),
        ('loue', 'Loué'),
        ('maintenance', 'En Maintenance'),
    )
    proprietaire = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='biens', limit_choices_to={'role': 'owner'}, verbose_name="Propriétaire")
    adresse = models.TextField(verbose_name="Adresse")
    superficie = models.DecimalField(max_digits=8, decimal_places=2, verbose_name="Superficie (m²)")
    type_bien = models.CharField(max_length=20, choices=TYPE_CHOIX, verbose_name="Type de Bien")
    statut = models.CharField(max_length=20, choices=STATUT_CHOIX, default='disponible', verbose_name="Statut")
    loyer_estime = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Loyer Estimé")
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Bien Immobilier"
        verbose_name_plural = "Biens Immobiliers"

    def __str__(self):
        return f"{self.get_type_bien_display()} - {self.adresse}"

class DemandeLocation(models.Model):
    STATUT_CHOIX = (
        ('attente', 'En Attente'),
        ('acceptee', 'Acceptée'),
        ('refusee', 'Refusée'),
    )
    candidat = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='demandes_location', limit_choices_to={'role': 'tenant'}, verbose_name="Candidat", blank=True, null=True)
    bien = models.ForeignKey(BienImmobilier, on_delete=models.CASCADE, related_name='demandes', verbose_name="Bien Immobilier")
    statut = models.CharField(max_length=20, choices=STATUT_CHOIX, default='attente', verbose_name="Statut de la Demande")
    date_demande = models.DateTimeField(auto_now_add=True, verbose_name="Date de la Demande")
    
    # Nouveaux champs pour le formulaire de demande
    nom = models.CharField(max_length=100, verbose_name="Nom", blank=True, null=True)
    prenom = models.CharField(max_length=100, verbose_name="Prénom", blank=True, null=True)
    telephone = models.CharField(max_length=20, verbose_name="Téléphone", blank=True, null=True)
    message = models.TextField(verbose_name="Message", blank=True, null=True)
    
    documents_justificatifs = models.FileField(upload_to='documents_demandes/', blank=True, null=True, verbose_name="Documents Justificatifs")

    class Meta:
        verbose_name = "Demande de Location"
        verbose_name_plural = "Demandes de Location"

    def __str__(self):
        return f"Demande de {self.candidat.username} pour {self.bien}"

class Bail(models.Model):
    locataire = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='baux', limit_choices_to={'role': 'tenant'}, verbose_name="Locataire")
    bien = models.ForeignKey(BienImmobilier, on_delete=models.CASCADE, related_name='baux', verbose_name="Bien Immobilier")
    date_debut = models.DateField(verbose_name="Date de Début")
    date_fin = models.DateField(verbose_name="Date de Fin")
    montant_loyer = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Montant du Loyer")
    actif = models.BooleanField(default=True, verbose_name="Contrat Actif")
    contrat_document = models.FileField(upload_to='contrats_baux/', blank=True, null=True, verbose_name="Contrat (Document)")

    class Meta:
        verbose_name = "Bail"
        verbose_name_plural = "Baux"

    def __str__(self):
        return f"Bail: {self.bien} - {self.locataire.username}"

class Paiement(models.Model):
    MODE_CHOIX = (
        ('bankily', 'Bankily'),
        ('masrivi', 'Masrivi'),
        ('sedad', 'Sedad'),
        ('espece', 'Espèce'),
        ('virement', 'Virement Bancaire'),
    )
    STATUT_CHOIX = (
        ('attente', 'En Attente'),
        ('valide', 'Validé'),
        ('refuse', 'Refusé'),
    )
    bail = models.ForeignKey(Bail, on_delete=models.CASCADE, related_name='paiements', verbose_name="Bail Associé")
    montant = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Montant")
    date_paiement = models.DateField(auto_now_add=True, verbose_name="Date de Paiement")
    mode_paiement = models.CharField(max_length=20, choices=MODE_CHOIX, verbose_name="Mode de Paiement")
    numero_expediteur = models.CharField(max_length=20, blank=True, null=True, verbose_name="Numéro Expéditeur")
    statut = models.CharField(max_length=20, choices=STATUT_CHOIX, default='attente', verbose_name="Statut")
    recu_document = models.FileField(upload_to='recus_paiements/', blank=True, null=True, verbose_name="Reçu (Document)")

    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"

    def __str__(self):
        return f"Paiement de {self.montant} le {self.date_paiement}"

class ChargeDepense(models.Model):
    TYPE_CHOIX = (
        ('recurrente', 'Charge Récurrente'),
        ('exceptionnelle', 'Dépense Exceptionnelle (Réparation, etc.)'),
    )
    bien = models.ForeignKey(BienImmobilier, on_delete=models.CASCADE, related_name='charges', verbose_name="Bien Immobilier")
    type_charge = models.CharField(max_length=20, choices=TYPE_CHOIX, verbose_name="Type de Charge")
    montant = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Montant")
    description = models.TextField(verbose_name="Description")
    date_facturation = models.DateField(verbose_name="Date de Facturation")
    document_facture = models.FileField(upload_to='factures_charges/', blank=True, null=True, verbose_name="Facture (Document)")

    class Meta:
        verbose_name = "Charge / Dépense"
        verbose_name_plural = "Charges et Dépenses"

    def __str__(self):
        return f"{self.get_type_charge_display()} - {self.montant} pour {self.bien}"
