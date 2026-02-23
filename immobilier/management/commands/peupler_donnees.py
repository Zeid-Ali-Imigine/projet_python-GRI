import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from immobilier.models import BienImmobilier, DemandeLocation, Bail, Paiement, ChargeDepense

Utilisateur = get_user_model()

class Command(BaseCommand):
    help = 'Peuple la base de données avec des données mauritaniennes (MRU)'

    def handle(self, *args, **options):
        self.stdout.write('Nettoyage de la base de données...')
        Paiement.objects.all().delete()
        Bail.objects.all().delete()
        DemandeLocation.objects.all().delete()
        ChargeDepense.objects.all().delete()
        BienImmobilier.objects.all().delete()
        Utilisateur.objects.exclude(username='admin').delete()

        prenoms = ['Mohamed', 'Ahmed', 'Sidi', 'El Hadj', 'Mariem', 'Fatimatou', 'Zeinabou', 'Aminetou', 'Brahim', 'Oumar']
        noms = ['Sy', 'Tall', 'Ba', 'Ould Ahmed', 'Ould Mohamed', 'Ould Sidi', 'Kane', 'Diallo', 'Diop', 'Sow']
        quartiers = ['Tevragh Zeina', 'Ksar', 'Sebkha', 'El Mina', 'Arafat', 'Dar Naim', 'Socogim']

        self.stdout.write('Création des utilisateurs...')
        proprietaires = []
        for i in range(5):
            nom_complet = f"{random.choice(prenoms)} {random.choice(noms)}"
            username = f"prop{i+1}"
            u = Utilisateur.objects.create_user(
                username=username,
                password='password123',
                email=f"{username}@exemple.mr",
                role='owner',
                first_name=nom_complet.split()[0],
                last_name=nom_complet.split()[1]
            )
            proprietaires.append(u)

        locataires = []
        for i in range(10):
            nom_complet = f"{random.choice(prenoms)} {random.choice(noms)}"
            username = f"locat{i+1}"
            u = Utilisateur.objects.create_user(
                username=username,
                password='password123',
                email=f"{username}@exemple.mr",
                role='tenant',
                first_name=nom_complet.split()[0],
                last_name=nom_complet.split()[1]
            )
            locataires.append(u)

        self.stdout.write('Création des biens immobiliers...')
        biens = []
        types = ['appartement', 'maison', 'commercial']
        for i in range(15):
            b = BienImmobilier.objects.create(
                proprietaire=random.choice(proprietaires),
                adresse=f"Villa {random.randint(100, 999)}, Rue {random.randint(1, 50)}, {random.choice(quartiers)}",
                superficie=random.randint(50, 300),
                type_bien=random.choice(types),
                statut='disponible',
                loyer_estime=random.randint(5000, 50000)
            )
            biens.append(b)

        self.stdout.write('Création des demandes et baux...')
        for b in random.sample(biens, 10):
            locataire = random.choice(locataires)
            # Créer une demande acceptée
            DemandeLocation.objects.create(
                candidat=locataire,
                bien=b,
                statut='acceptee'
            )
            b.statut = 'loue'
            b.save()

            # Créer le bail
            debut = date.today() - timedelta(days=random.randint(30, 365))
            fin = debut + timedelta(days=365)
            bail = Bail.objects.create(
                locataire=locataire,
                bien=b,
                date_debut=debut,
                date_fin=fin,
                montant_loyer=b.loyer_estime,
                actif=True
            )

            # Créer des paiements pour ce bail
            for m in range(random.randint(1, 6)):
                Paiement.objects.create(
                    bail=bail,
                    montant=bail.montant_loyer,
                    date_paiement=debut + timedelta(days=30*m),
                    mode_paiement=random.choice(['virement', 'espece', 'carte'])
                )

        self.stdout.write('Création des charges...')
        for b in random.sample(biens, 5):
            ChargeDepense.objects.create(
                bien=b,
                type_charge=random.choice(['recurrente', 'exceptionnelle']),
                montant=random.randint(500, 5000),
                description="Réparation plomberie" if random.random() > 0.5 else "Taxe municipale",
                date_facturation=date.today() - timedelta(days=random.randint(1, 30))
            )

        self.stdout.write(self.style.SUCCESS('Base de données peuplée avec succès (MRU) !'))
