# -*- coding: utf-8 -*-
from django.core.exceptions import ObjectDoesNotExist
from hashlib import sha1
from uuid import uuid1
from models import User, Lyric
from deal_json import Json


# Create your views here.
def login(request):
    user_name = request.POST.get['user_name']
    pwd = request.POST.get['pwd']
    try:
        user = User.objects.get(user_name=user_name)
    except ObjectDoesNotExist:
        user = User(user_name=user_name, pwd=sha1(pwd))
        user.save()
    if sha1(pwd) == user.pwd:
        token = str(uuid1())
        json = Json({"status": "login success", "token": token})
        json.return_json()
    else:
        json = Json({"status": "password error"})
        json.return_json()


def logout(request):
    user_name = request.GET.get('user_name')
    try:
        user = User.objects.get(user_name=user_name)
        user.token = ''
        user.save()
        json = Json({"status": "logout success"})
        json.return_json()
    except ObjectDoesNotExist:
        json = Json({"status": "user_name error"})
        json.return_json()
