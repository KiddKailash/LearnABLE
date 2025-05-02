import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Teacher, DeviceSession

class SessionNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get the session ID from the URL
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.user = self.scope['user']
        
        # Check if the user is authenticated
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Check if the session ID is valid
        if not await self.is_valid_session():
            await self.close()
            return
        
        # Add the client to a session-specific group
        self.group_name = f'session_{self.session_id}'
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Remove the client from the session group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
    
    @database_sync_to_async
    def is_valid_session(self):
        try:
            # Check if the session belongs to the authenticated user
            session = DeviceSession.objects.get(id=self.session_id)
            if hasattr(self.user, 'teacher') and session.teacher_id == self.user.teacher.id:
                return True
            return False
        except (DeviceSession.DoesNotExist, Teacher.DoesNotExist):
            return False
    
    # Receive message from WebSocket
    async def receive(self, text_data):
        # We don't need client-to-server messages for this feature
        pass
    
    # Receive message from session group
    async def session_terminated(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'session_terminated',
            'message': event['message']
        })) 