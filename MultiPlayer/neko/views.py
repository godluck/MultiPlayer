# -*- coding: utf-8 -*-
from django.core.exceptions import ObjectDoesNotExist
from hashlib import sha1
from uuid import uuid1
from models import User, Lyric
from deal_json import Json
import time


# Create your views here.
def login(request):
    """
    :param request: user_name,pwd
    :return:status token lyrics
    """
    user_name = request.POST.get['user_name']
    pwd = request.POST.get['pwd']
    try:
        user = User.objects.get(user_name=user_name)
    except ObjectDoesNotExist:
        user = User(user_name=user_name, pwd=sha1(pwd))
        user.save()

    if sha1(pwd) == user.pwd:
        token = str(uuid1())
        user.token = token
        user.timestamp = int(time.time())
        user.save()

        lyrics = Lyric.objects.filter(user=user)
        lists = []
        for i in lyrics:
            lists += i.dic()

        json = Json({"status": "login success", "token": token, "lyrics": lists})
    else:
        json = Json({"status": "password error"})
    json.return_json()


def logout(request):
    """

    :param request: user_name
    :return:status
    """
    user_name = request.GET.get('user_name')
    try:
        user = User.objects.get(user_name=user_name)
        user.token = ''
        user.timestamp = 0
        user.save()
        json = Json({"status": "logout success"})
    except ObjectDoesNotExist:
        json = Json({"status": "user_name error"})
    json.return_json()


def time_up(user):
    """
    change timestamp
    :param user:
    :return:
    """
    user.timestamp = int(time.time())
    user.save()


def check(secret, user, timestamp):  # login time 1000
    """
    check the user's token
    :param secret:
    :param user:
    :param timestamp:
    :return:status
    """
    if user is None:
        return False
    now = int(time.time())
    if (now - timestamp < 20)and(timestamp - user.timestamp < 1000):
        token = user.token()
        if secret == sha1(token + str(timestamp)):
            return True
        else:
            return False
    else:
        return False


def search(request):
    """
    search all lyrics that like the song_name
    :param request:
    :return:
    """
    secret = request.GET.get("secret")
    user_name = request.GET.get("user_name")
    timestamp = request.GET.get("timestamp")
    song_name = request.GET.get("song_name")
    user = None
    try:
        user = User.objects.get(user_name=user_name)
    except ObjectDoesNotExist:
        json = Json({"status": "can't find this user"})
    if check(secret, user, timestamp):
        lists = []
        lyrics = Lyric.objects.filter(song_name__contain=song_name)
        for i in lyrics:
            lists += i.dic()
        json = Json({"status": "success", "lyrics": lists})
    else:
        json = Json({"status": "token error"})
    if json.check_json("status", "success"):
        time_up(user)
    json.return_json()
