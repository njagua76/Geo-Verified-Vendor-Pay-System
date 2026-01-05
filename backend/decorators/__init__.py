"""
Decorators package - Custom Flask decorators for authentication and authorization.
"""

# Import the role_required decorator from role_decorator.py
from .role_decorator import role_required

__all__ = ['role_required']
