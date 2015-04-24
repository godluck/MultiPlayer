from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'MultiPlayer.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    #url(r'^admin/', include(admin.site.urls)),
    (r'^login$', 'login'),  # post user_id&pwd return token
    (r'^logout', 'logout'),  # token => token over date
    (r'^search', 'search'),  # id&token =>song_name&singer_name&lyric
    (r'save', 'save'),  # token&json =>status
)
