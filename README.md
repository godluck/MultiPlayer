静态页面配置及访问说明
===================
##修改过的文件及图片请及时放到MultiPlayer子文件夹下的static文件夹当中。##
##本地服务器运行： 在MultPlayer子文件夹下运行 python manage.py runserver 本地访问本地的url+/static/xx.html即可访问。比如“127.0.0.0：8000/static/UI.html"
后台api
===========
##返回码##

* 0         成功
* 1         请求格式不正确
* 2         密码错误
* 3         用户名称错误
* 4         token 错误
* 5         没有找到指定id歌词

login
------------
**url:**      
  /login

**method:**
  POST

**请求参数:**

* user_name  用户名
* pwd        密码

**返回值(json示例):**

* {"status":"1"}
* {"status":"2"}
* {"status":"0","token":"44444","lyrics":[{"this is the lyric json"}，{"id": self.id,
                 "song_name": self.song_name,
                 "singer_name": self.singer_name,
                 "song_time": self.song_time
            }]}

**(status意义见返回码)**

logout
------------
**url:**      
  /logout

**method:**
  GET

**请求参数:**

* user_name  用户名
* secret  算法为token + timestamp sha1 后的16位字符串
* timestamp 时间戳，缺省值为0

**返回值(json示例):**

* {"status":"0"}
* {"status":"1"}
* {"status":"3"}

**(status意义见返回码)**

search
------------
**url:**      
  /search

**method:**
  GET

**请求参数:**

* song_name 想要查找的歌曲名称

**返回值(json示例):**

* {"status":"1"}
* {"status":"0","lyrics":[{"this is the lyric json lists"}, {"id": self.id,
                 "song_name": self.song_name,
                 "singer_name": self.singer_name,
                 "song_time": self.song_time
            }]}

**(status意义见返回码)**

  
get
------------
**url:**      
  /get

**method:**
  GET

**请求参数:**

* id  歌词id

**返回值(json示例):**

* {"status":"1"}
* {"status":"5"}
* {"status":"0","lyric":{this is the lyric json that you save}}

**(status意义见返回码).lyric返回值只包含歌词json不包含其他关键字**  

save
------------
**url:**      
  /save

**method:**
  POST

**请求参数:**

* user_name  用户名
* secret  算法为token + timestamp sha1 后的16位字符串
* timestamp 时间戳，缺省值为0
* lyric json 歌词
* song_name 歌曲名称
* singer_name 歌手名称
* song_time 歌曲时间

**返回值(json示例):**

* {"status":"1"}
* {"status":"3"}
* {"status":"0"}
* {"status":"4"}

**(status意义见返回码)**  

    
up_time
------------
**url:**      
  /up_time

**method:**
  GET

**请求参数:**

* user_name  用户名
* pwd        密码
* secret  算法为token + timestamp sha1 后的16位字符串
* timestamp 时间戳，缺省值为0

**返回值(json示例):**

* {"status":"1"}
* {"status":"3"}
* {"status":"0"}
* {"status":"4"}

**(status意义见返回码)**
