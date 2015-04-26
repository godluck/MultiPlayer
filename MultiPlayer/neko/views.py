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
    if request.method == 'GET':
        json = Json({"status": "1"})
    else:
        user_name = request.POST.get('user_name')
        pwd = request.POST.get('pwd')
        pwd =  sha1(pwd).hexdigest()
        try:
            user = User.objects.get(user_name=user_name)
        except ObjectDoesNotExist:
            user = User(user_name=user_name, pwd=pwd)
            user.save()

        if pwd == user.pwd:
            token = str(uuid1())
            user.token = token
            user.timestamp = int(time.time())
            user.save()

            lyrics = Lyric.objects.filter(user=user)
            lists = []
            for i in lyrics:
                lists.append(i.dic())

            json = Json({"status": "0", "token": token, "lyrics": lists})
        else:
            json = Json({"status": "2"})
    return json.return_json()


def logout(request):
    """

    :param request: user_name
    :return:status
    """
    if request.method == 'POST':
        json = Json({"status": "1"})
        json.return_json()
    else:
        user_name = request.GET.get('user_name')
        try:
            user = User.objects.get(user_name=user_name)
            user.token = ''
            user.timestamp = 0
            user.save()
            json = Json({"status": "0"})
        except ObjectDoesNotExist:
            json = Json({"status": "3"})
    return json.return_json()


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
    timestamp = int(timestamp)
    now = int(time.time())
    if (now - timestamp < 20)and(timestamp - user.timestamp < 1000):
        token = user.token
        if secret == sha1(token + str(timestamp)).hexdigest():
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
    json = None
    if request.method == 'POST':
        json = Json({"status": "request error"})
    else:
        secret = request.GET.get("secret")
        user_name = request.GET.get("user_name")
        timestamp = request.GET.get("timestamp", '0')
        song_name = request.GET.get("song_name", '')
        user = None
        try:
            user = User.objects.get(user_name=user_name)
        except ObjectDoesNotExist:
            json = Json({"status": "3"})
        if json is None:
            if check(secret, user, timestamp):
                lists = []
                lyrics = Lyric.objects.filter(song_name__contains=song_name)
                for i in lyrics:
                    lists.append(i.dic())
                json = Json({"status": "0", "lyrics": lists})
            else:
                json = Json({"status": "4"})
            if json.check_json("status", "0"):
                time_up(user)
    return json.return_json()


def get(request):
    """
    use id to find lyric
    :param request:
    :return:
    """
    if request.method == 'POST':
        json = Json({"status": "1"})
    else:
        secret = request.GET.get("secret")
        user_name = request.GET.get("user_name")
        timestamp = request.GET.get("timestamp", '0')
        id = request.GET.get("id")
        user = None
        try:
            user = User.objects.get(user_name=user_name)
        except ObjectDoesNotExist:
            json = Json({"status": "3"})
        if check(secret, user, timestamp):
            try:
                lyric = Lyric.objects.get(id=id)
                json = Json({"status": "0", "lyric": lyric.lyric})
            except ObjectDoesNotExist:
                json = Json({"status": "5"})
        else:
            json = Json({"status": "4"})
        if json.check_json("status", "0"):
            time_up(user)
    return json.return_json()


def save(request):
    """

    :param request:
    :return:
    """
    if request.method == 'GET':
        json = Json({"status": "1"})
    else:
        user_name = request.POST.get('user_name')
        lyric = request.POST.get('lyric')
        song_name = request.POST.get('song_name')
        singer_name = request.POST.get('singer_name')
        song_time = request.POST.get('song_time')
        secret = request.POST.get("secret")
        timestamp = request.POST.get("timestamp")
        json = None
        user = None
        try:
            user = User.objects.get(user_name=user_name)
        except ObjectDoesNotExist:
            json = Json({"status": "3"})
        if check(secret,user,timestamp):
            if json is None:
                Lyric(user=user,
                      song_name=song_name,
                      singer_name=singer_name,
                      song_time=song_time,
                      lyric=lyric).save()
                json = Json({"status": "0"})
        else:
            json = Json({"status": '4'})
        if json.check_json("status", "0"):
            time_up(user)
    return json.return_json()