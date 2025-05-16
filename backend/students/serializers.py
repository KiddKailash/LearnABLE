"""
Views for handling NCCD reports and lesson effectiveness records.

Includes endpoints to:
- Retrieve all reports or reports by student
- Retrieve, update, or delete individual reports
- Create reports (with duplicate prevention)
- Ensure reports exist for students in a class based on disability info
- Record lesson effectiveness linked to reports
- Provide effectiveness trends over time for a student

All endpoints require user authentication.
"""

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
        Override default serialization to decrypt sensitive fields.

        Converts the model instance into a dictionary of primitive data types,
        replacing encrypted fields 'first_name', 'last_name', and 'disability_info'
        with their decrypted values for readable API output.

        Args:
            instance (Student): The Student model instance to serialize.

        Returns:
            dict: Serialized data with decrypted fields.
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
        Override default deserialization to encrypt sensitive fields before saving.

        Transforms incoming primitive data into validated data suitable for
        model instance creation or update, encrypting 'first_name', 'last_name',
        and 'disability_info' fields to ensure data security.

        Args:
            data (dict): Incoming data from request.

        Returns:
            dict: Validated and encrypted data ready for model save.
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
