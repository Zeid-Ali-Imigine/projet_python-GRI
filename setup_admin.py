import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

Utilisateur = get_user_model()

def create_admin():
    if not Utilisateur.objects.filter(username='admin').exists():
        admin_user = Utilisateur.objects.create_superuser('admin', 'admin@example.com', 'admin-1234')
        admin_user.role = 'admin'
        admin_user.save()
        print("L'utilisateur 'admin' a été créé avec succès. Mot de passe : 'admin-1234'")
    else:
        print("L'utilisateur 'admin' existe déjà.")

if __name__ == '__main__':
    create_admin()
