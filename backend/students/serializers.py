from rest_framework import serializers
from .models import Student
from cryptography.fernet import Fernet
from decouple import config

# Initialize the Fernet encryption key
fernet = Fernet(config("FERNET_KEY").encode())

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

    def to_representation(self, instance):
        """
        Decrypt the relevant fields when serializing the instance.
        """
        data = super().to_representation(instance)
        try:
            # Use the decrypted properties for display
            data['first_name'] = instance.first_name
            data['last_name'] = instance.last_name
            data['disability_info'] = instance.disability_info
        except Exception:
            # In case decryption fails, provide empty strings or handle accordingly
            data['first_name'] = ""
            data['last_name'] = ""
            data['disability_info'] = ""
        return data

    def to_internal_value(self, data):
        """
        Encrypt the relevant fields before saving them.
        """
        internal_data = super().to_internal_value(data)
        
        # Encrypt the fields if they are provided
        if 'first_name' in data:
            plaintext_first_name = data['first_name']
            encrypted_first_name = fernet.encrypt(plaintext_first_name.encode()).decode()
            internal_data['first_name'] = encrypted_first_name

        if 'last_name' in data:
            plaintext_last_name = data['last_name']
            encrypted_last_name = fernet.encrypt(plaintext_last_name.encode()).decode()
            internal_data['last_name'] = encrypted_last_name

        if 'disability_info' in data:
            plaintext_disability_info = data['disability_info']
            encrypted_disability_info = fernet.encrypt(plaintext_disability_info.encode()).decode()
            internal_data['disability_info'] = encrypted_disability_info
        
        return internal_data
