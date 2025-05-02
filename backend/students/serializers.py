from rest_framework import serializers
from .models import Student
from cryptography.fernet import Fernet
from decouple import config
import base64

fernet = Fernet(config("FERNET_KEY").encode())

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        try:
            data['disability_info'] = fernet.decrypt(instance.disability_info.encode()).decode()
        except Exception:
            data['disability_info'] = ""  # In case decryption fails
        return data

    def to_internal_value(self, data):
        internal_data = super().to_internal_value(data)
        if 'disability_info' in data:
            plaintext = data['disability_info']
            encrypted = fernet.encrypt(plaintext.encode()).decode()
            internal_data['disability_info'] = encrypted
        return internal_data