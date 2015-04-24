# -*- coding: utf-8 -*-
from django.http import HttpResponse
import json


class Json():
    def __init__(self, json):
        self.json = json

    def get_json(self):
        return json.loads(self.json)

    def return_json(self):
        data = json.dumps(self.json)
        return HttpResponse(data)

