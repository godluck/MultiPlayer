from django.db import models


# Create your models here.
class User(models.Model):
    user_name = models.CharField(max_length=50, null=False, blank=False)
    pwd = models.CharField(max_length=50, null=False, blank=False)  # sha1


class Lyric(models.Model):
    user = models.ForeignKey(User, null=False, blank=False)
    song_name = models.CharField(max_length=50, null=False, blank=False)
    singer_name = models.CharField(max_length=50, null=False, blank=False)
    song_time = models.FloatField()
    lyric = models.TextField()  # lyric json