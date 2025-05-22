"""
WebSocket consumer for real-time session notifications for teacher device sessions.

This consumer authenticates users, validates session ownership, manages group membership
for session-specific event broadcasting, and sends notifications such as session termination
to connected clients via WebSocket.

Designed for use with Django Channels and integrates with the Teacher and DeviceSession models.
"""


import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Teacher, DeviceSession


class SessionNotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for notifying a teacher's device session events in real-time.

    Manages connections scoped to a specific device session, ensuring only the authenticated
    teacher associated with the session can connect. Sends notifications such as session termination.
    """

    async def connect(self):
        """
        Handles WebSocket connection attempts.

        Extracts the session ID from the URL, checks if the user is authenticated and
        if the session is valid for the user. If all checks pass, the client is added
        to a session-specific group for receiving session events.

        Closes the connection otherwise.
        """
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
        """
        Handles WebSocket disconnections.

        Removes the client from the session group to stop receiving session notifications.
        """

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    @database_sync_to_async
    def is_valid_session(self):
        """
        Synchronously checks if the session ID corresponds to a valid DeviceSession
        belonging to the authenticated teacher.

        Returns:
            bool: True if the session is valid and belongs to the user, False otherwise.
        """
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
        """
        Receives a 'session_terminated' event from the channel layer group
        and forwards it to the WebSocket client.

        Args:
            event (dict): Event data containing a 'message' key with termination info.
        """
        await self.send(text_data=json.dumps({
            'type': 'session_terminated',
            'message': event['message']
        }))
