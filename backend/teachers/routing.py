"""
WebSocket URL routing for session-related notifications.

Defines URL patterns for WebSocket connections that handle real-time
notifications related to teacher device sessions, using Channels consumers.

- ws/sessions/<session_id>/ : Connects to SessionNotificationConsumer for session events.
"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/sessions/(?P<session_id>\d+)/$',
            consumers.SessionNotificationConsumer.as_asgi()),
]
