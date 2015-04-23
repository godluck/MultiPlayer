from django.db import models


# Create your models here.
class User(models.Model):
    user_name = models.CharField(max_length=50, null=False, blank=False)
    pwd = models.CharField(max_length=50, null=False, blank=False)  # sha1


class Lyric(models.Model):
    user = models.ForeignKey(verbose_name=User, null=False, blank=False)
