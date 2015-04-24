from django.shortcuts import render
from django.core.exceptions import ObjectDoesNotExist

from hashlib import sha1
from models import User, Lyric
# Create your views here.
def login(request):
    user_name = request.POST.get['user_name']
    pwd = request.POST.get['pwd']
    try:
        user = User.objects.get(user_name=user_name)
    except ObjectDoesNotExist:
