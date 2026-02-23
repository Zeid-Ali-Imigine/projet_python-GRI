import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from immobilier.models import DemandeLocation
from immobilier.serializers import DemandeLocationSerializer

try:
    demandes = DemandeLocation.objects.all()
    # Force evaluation
    count = demandes.count()
    print(f"Found {count} demandes")
    
    serializer = DemandeLocationSerializer(demandes, many=True)
    data = serializer.data
    print("Serialization successful")
    print(data[:1])
except Exception as e:
    import traceback
    print("ERROR CAUGHT:")
    traceback.print_exc()
