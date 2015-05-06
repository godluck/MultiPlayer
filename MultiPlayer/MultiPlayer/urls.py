from django.conf.urls import patterns, include, url

from django.contrib import admin

from neko.views import login, logout, search, save, get, up_time

admin.autodiscover()

urlpatterns = patterns('',
                       # Examples:
                       # url(r'^$', 'MultiPlayer.views.home', name='home'),
                       # url(r'^blog/', include('blog.urls')),

                       # url(r'^admin/', include(admin.site.urls)),
                       (r'^login$', login),  # post user_id&pwd return token
                       (r'^logout$', logout),  # token => token over date
                       (r'^search$', search),  # name&token&user =>song_name&singer_name
                       (r'^save$', save),  # token+tmestamp sha1&json =>status
                       (r'^get$', get),  # id&secret&user => lyric
                       (r'^up_time$', up_time),  # keep login
                       (r'MultiPlayer/static','/MultiPlayer/static' ),
)
