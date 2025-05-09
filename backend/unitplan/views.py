from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse
from .models import UnitPlan
from .serializers import UnitPlanSerializer, UnitPlanListSerializer
from classes.models import Classes

class UnitPlanViewSet(viewsets.ModelViewSet):
    queryset = UnitPlan.objects.all()
    serializer_class = UnitPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return UnitPlanListSerializer
        return UnitPlanSerializer

    def get_queryset(self):
        # Filter unit plans by teacher
        teacher = self.request.user.teacher
        if not teacher:
            return UnitPlan.objects.none()
        
        # Get unit plans for classes taught by this teacher
        return UnitPlan.objects.filter(class_instance__teacher=teacher)
    
    def create(self, request, *args, **kwargs):
        # Debugging: Log the received data
        print(f"Unit plan create - received data keys: {list(request.data.keys())}")
        print(f"Unit plan create - received files keys: {list(request.FILES.keys())}")
        if 'document' in request.FILES:
            doc = request.FILES['document']
            print(f"Unit plan create - document info: name={doc.name}, size={doc.size}, content_type={doc.content_type}")
        else:
            print("Unit plan create - WARNING: No document file received!")
        
        # Extra debug info about the request
        print(f"Unit plan create - user: {request.user.username}, teacher: {getattr(request.user, 'teacher', None)}")
        print(f"Unit plan create - request method: {request.method}")
        print(f"Unit plan create - content type: {request.content_type}")

        # Check if document exists
        if 'document' not in request.FILES:
            print("Unit plan create - ERROR: No document file found in request.FILES")
            return Response(
                {"error": "Missing document file in request"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if class exists and belongs to the requesting teacher
        class_id = request.data.get('class_instance')
        
        # Debugging: Check the class_id value
        print(f"Unit plan create - class_id received: {class_id}, type: {type(class_id)}")
        
        # Check for invalid string values
        if class_id in ['undefined', 'null', ''] or class_id is None:
            print(f"Unit plan create - ERROR: Invalid class_id value: '{class_id}'")
            return Response(
                {"error": "Invalid class ID. Please ensure a class is created first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convert to integer if it's a string
        if isinstance(class_id, str):
            try:
                if class_id.isdigit():
                    class_id = int(class_id)
                    print(f"Unit plan create - class_id converted to integer: {class_id}")
                else:
                    print(f"Unit plan create - ERROR: class_id is not a valid integer: '{class_id}'")
                    return Response(
                        {"error": f"Invalid class ID format: {class_id}. Must be an integer."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Exception as e:
                print(f"Unit plan create - ERROR converting class_id: {e}")
                return Response(
                    {"error": f"Error processing class ID: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Validate class_id
        if not class_id:
            print("Unit plan create - ERROR: Missing class_instance")
            return Response(
                {"error": "Class ID (class_instance) is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            class_obj = Classes.objects.get(id=class_id, teacher=request.user.teacher)
            print(f"Unit plan create - Found class: {class_obj.class_name} (ID: {class_obj.id})")
        except Classes.DoesNotExist:
            print(f"Unit plan create - ERROR: Class not found or permission denied for class_id {class_id}")
            return Response(
                {"error": "Class not found or you don't have permission to add a unit plan to this class."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Unit plan create - ERROR: Unexpected error accessing class: {str(e)}")
            return Response(
                {"error": f"An error occurred when accessing the class: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Check if a unit plan already exists for this class
        existing_plan = UnitPlan.objects.filter(class_instance=class_obj).first()
        if existing_plan:
            # If a unit plan exists and this is from the class creation flow, update it instead
            from_creation_flow = request.data.get('from_creation_flow', False)
            print(f"Unit plan create - Existing plan found, from_creation_flow: {from_creation_flow}")
            if from_creation_flow in ('true', True, 'True'):
                return self.update_existing_plan(request, existing_plan, *args, **kwargs)
            else:
                return Response(
                    {"error": "A unit plan already exists for this class. Please update the existing plan."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            # Make sure document file is present
            if 'document' not in request.FILES:
                print("Unit plan create - ERROR: No document file provided")
                return Response(
                    {"error": "No document file provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if title is provided
            if not request.data.get('title'):
                print("Unit plan create - Adding default title")
                request.data._mutable = True
                request.data['title'] = "Unit Plan"
                request.data._mutable = False
            
            print("Unit plan create - Proceeding with create")
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"Unit plan create - ERROR: Unexpected error in create: {str(e)}")
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update_existing_plan(self, request, instance, *args, **kwargs):
        """Update an existing plan instead of creating a new one"""
        print(f"Unit plan update_existing_plan - Instance ID: {instance.id}, Class ID: {instance.class_instance.id if hasattr(instance, 'class_instance') else 'unknown'}")
        print(f"Unit plan update_existing_plan - Files: {request.FILES}")
        print(f"Unit plan update_existing_plan - Data keys: {list(request.data.keys())}")
        
        try:
            # Remove from_creation_flow from request.data if present to avoid serializer validation errors
            if 'from_creation_flow' in request.data:
                print(f"Unit plan update_existing_plan - Removing from_creation_flow: {request.data.get('from_creation_flow')}")
                # Make the request.data mutable if it's QueryDict (from form data)
                if hasattr(request.data, '_mutable'):
                    request.data._mutable = True
                    request.data.pop('from_creation_flow')
                    request.data._mutable = False
                else:
                    # Handle case where request.data is a regular dict
                    request.data.pop('from_creation_flow')
            
            # If there's a new document file, we need to handle it specially
            if 'document' in request.FILES:
                print("Unit plan update_existing_plan - Processing new document file")
                # Store the existing document path to delete it later if needed
                old_document = None
                if instance.document:
                    try:
                        old_document = instance.document.path
                        print(f"Unit plan update_existing_plan - Old document path: {old_document}")
                    except Exception as e:
                        print(f"Unit plan update_existing_plan - Error accessing old document: {e}")
                        # Continue anyway
                    
                # Update with the new document
                try:
                    instance.document = request.FILES['document']
                    print(f"Unit plan update_existing_plan - New document name: {instance.document.name}")
                except Exception as e:
                    print(f"Unit plan update_existing_plan - Error setting new document: {e}")
                    return Response(
                        {"error": f"Error updating document: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                # Update other fields if present
                if 'title' in request.data:
                    instance.title = request.data['title']
                    print(f"Unit plan update_existing_plan - Updated title: {instance.title}")
                if 'description' in request.data:
                    instance.description = request.data['description']
                    print(f"Unit plan update_existing_plan - Updated description")
                    
                try:
                    instance.save()
                    print("Unit plan update_existing_plan - Saved instance with new document")
                except Exception as e:
                    print(f"Unit plan update_existing_plan - Error saving instance: {e}")
                    return Response(
                        {"error": f"Error saving unit plan: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                # Delete old document file if it exists
                if old_document:
                    import os
                    if os.path.exists(old_document):
                        try:
                            os.remove(old_document)
                            print(f"Unit plan update_existing_plan - Deleted old document file")
                        except Exception as e:
                            print(f"Unit plan update_existing_plan - Error deleting old document file: {e}")
                            # Continue anyway
                            
                serializer = self.get_serializer(instance)
                return Response(serializer.data)
            else:
                print("Unit plan update_existing_plan - No new document, standard partial update")
                # If no new document, use standard partial update
                serializer = self.get_serializer(instance, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
                return Response(serializer.data)
        except Exception as e:
            print(f"Unit plan update_existing_plan - ERROR: {str(e)}")
            return Response(
                {"error": f"Error updating unit plan: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Ensure the teacher owns the class
        if instance.class_instance.teacher != request.user.teacher:
            return Response(
                {"error": "You don't have permission to update this unit plan."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Ensure the teacher owns the class
        if instance.class_instance.teacher != request.user.teacher:
            return Response(
                {"error": "You don't have permission to delete this unit plan."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get file path to delete it from storage after the model is deleted
        file_path = None
        if instance.document:
            file_path = instance.document.path
            
        # Delete the model instance
        response = super().destroy(request, *args, **kwargs)
        
        # Delete the file if it exists
        if file_path:
            import os
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    # Log error but don't affect the response
                    print(f"Error deleting file {file_path}: {e}")
                    
        return response
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        unit_plan = self.get_object()
        
        # Check if the teacher has access to this unit plan
        if unit_plan.class_instance.teacher != request.user.teacher:
            return Response(
                {"error": "You don't have permission to download this unit plan."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if not unit_plan.document:
            return Response(
                {"error": "No document attached to this unit plan."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Return file as a response for download
        file_handle = unit_plan.document.open()
        response = FileResponse(file_handle, content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{unit_plan.document.name.split("/")[-1]}"'
        return response
        
    @action(detail=False, methods=['get'])
    def for_class(self, request):
        class_id = request.query_params.get('class_id')
        if not class_id:
            return Response(
                {"error": "class_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Validate the class belongs to the requesting teacher
        try:
            class_obj = Classes.objects.get(id=class_id, teacher=request.user.teacher)
        except Classes.DoesNotExist:
            return Response(
                {"error": "Class not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Check if unit plan exists for this class
        unit_plan = UnitPlan.objects.filter(class_instance=class_obj).first()
        if not unit_plan:
            return Response(
                {"error": "No unit plan found for this class."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        serializer = self.get_serializer(unit_plan)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def replace_document(self, request):
        """Replace just the document of an existing unit plan"""
        class_id = request.data.get('class_instance')
        document = request.data.get('document')
        
        if not class_id or not document:
            return Response(
                {"error": "Class ID and document are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if class exists and belongs to requesting teacher
        try:
            class_obj = Classes.objects.get(id=class_id, teacher=request.user.teacher)
        except Classes.DoesNotExist:
            return Response(
                {"error": "Class not found or you don't have permission to modify this unit plan."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Get the unit plan
        unit_plan = UnitPlan.objects.filter(class_instance=class_obj).first()
        if not unit_plan:
            return Response(
                {"error": "No unit plan found for this class. Please create one first."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Update just the document
        unit_plan.document = document
        unit_plan.save()
        
        serializer = self.get_serializer(unit_plan)
        return Response(serializer.data)
