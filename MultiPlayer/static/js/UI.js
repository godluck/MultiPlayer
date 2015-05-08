window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();
var _$=document.getElementById.bind(document);
var __$=document.getElementsByClassName.bind(document);
var pageData={
	song_list:{
		songs:[],
		addSong:function(){
			var p=_$('file');
			var _songs=this.songs;
			var template=_$('hidden').getElementsByClassName('song_box')[0];
			p.onchange=function(){
				var newsongs=Array.prototype.reduce.call(this.files,function(pre,cur){
					var tempsong={url:g.getObjectURL(cur),name:cur.name.substr(0,cur.name.lastIndexOf('.'))};
					pre.push(tempsong);
					_songs.push(tempsong);
					return pre;
				},[]);
				var pnode=__$('songs')[0];
				newsongs.forEach(function(newsong){
					var temp=template.cloneNode(true);
					temp.getElementsByClassName('song_name')[0].innerHTML=newsong.name;
					temp.getElementsByClassName('singer')[0].innerHTML=newsong.singer||'未知歌手';
					temp.getElementsByClassName('to_play')[0].href='javascript:g.jumpTo(\'player\');g.play('+_songs.indexOf(newsong)+')';
					pnode.appendChild(temp);
				});
			}
			p.click();
		}
	},
	player:{
		lycs:[],
		lycs_info:[],
		words:null
	},
	lyc_editer:{
		lycTime:[],
		lycPlayTime:[],
		words:null,
		lycFactory:null
	}
}
var g={
	getObjectURL:function (file) {
		var url = null;
		if (window.createObjectURL != undefined) { // basic
			url = window.createObjectURL(file);
		} else if (window.URL != undefined) { // mozilla(firefox)
			url = window.URL.createObjectURL(file);
		} else if (window.webkitURL != undefined) { // webkit or chrome
			url = window.webkitURL.createObjectURL(file);
		}
		return url;
	},
	init:function(a){
		var page1=_$('player');
		var page2=_$('lyc_editer');
		a.addEventListener('playing',function(){
			page1.getElementsByClassName('duration')[0].innerHTML=Math.floor(a.duration/60)+':'+Math.floor(a.duration % 60);
			page2.getElementsByClassName('duration')[0].innerHTML=Math.floor(a.duration/60)+':'+Math.floor(a.duration % 60);
		});
		a.addEventListener('timeupdate',function(){
			page1.getElementsByClassName('currentTime')[0].innerHTML=Math.floor(a.currentTime/60)+':'+Math.floor(a.currentTime%60);
			page2.getElementsByClassName('currentTime')[0].innerHTML=Math.floor(a.currentTime/60)+':'+Math.floor(a.currentTime%60);
			var ratio=a.currentTime/a.duration;
			page1.getElementsByClassName('progressbar')[0].style.width=ratio*100+'%';
			page2.getElementsByClassName('progressbar')[0].style.width=ratio*100+'%';
		});
		a.addEventListener('pause',function(){
			g.pauselyc();
		})
		a.addEventListener('ended',function(){
			if(labels.playing){
				switch(labels.order){
					case 0:
					g.play(labels.curIndex);
					break;
					case 1:
					g.play(labels.curIndex+1);
					break;
					case 2:
					g.play(Math.floor(Math.random()*pageData.song_list.songs.length));
					break;
				}
			}
		});
		page1.getElementsByClassName('progress_box')[0].addEventListener('click',function(e){
			if(e.target=this){
				a.currentTime=(e.offsetX||e.layerX)/this.offsetWidth*a.duration;
			}
			g.playlyc();
		},false);
		page2.getElementsByClassName('progress_box')[0].addEventListener('click',function(e){
			if(e.target=this){
				a.currentTime=(e.offsetX||e.layerX)/this.offsetWidth*a.duration;
			}
			g.traceBackLyc();
		},false);
	},
	play:function(i){
		i=(i+pageData.song_list.songs.length)%pageData.song_list.songs.length;
		labels.curIndex=i;
		var a=labels.player;
		if(a.paused){
			g.resume();
		}
		a.src=pageData.song_list.songs[i].url;
		_$('player').getElementsByClassName('title')[0].innerHTML=pageData.song_list.songs[i].name;
		_$('lyc_box').innerHTML='<p>正在加载歌词...</p>';
		a.play();
		labels.playing=true;
		if(!pageData.player.lycs[i]){
			g.searchlyc(pageData.song_list.songs[i].name,i);
		}else{
			g.bindlyc(_$('lyc_box'),pageData.player.lycs[i]);
		}
		_$('searchbox').value=pageData.song_list.songs[i].name;
		_$('iSongName').value=pageData.song_list.songs[i].name;
	},
	jumpTo:function(pageName){
		_$(labels.curPage).style.display='none';
		_$(pageName).style.display='block';
		labels.curPage=pageName;
	},
	pause:function(){
		labels.player.pause();
		_$('play_pause').href='javascript:g.resume();g.playlyc();';
		_$('play_pause').style.backgroundImage='url(css/img/play.png)';
		_$('pause').href='javascript:g.resume()';
		_$('pause').innerHTML='播放';
	},
	resume:function(){
		labels.player.play();
		_$('play_pause').href='javascript:g.pause()';
		_$('play_pause').style.backgroundImage='url(css/img/stop.png)';
		_$('pause').href='javascript:g.pause()';
		_$('pause').innerHTML='暂停';
	},
	changeOrder:function(){
		labels.order+=1;
		labels.order%=3;
		switch(labels.order){
			case 0:
			document.querySelector('#play_order').style.backgroundImage='url(css/img/single.png)';
			break;
			case 1:
			document.querySelector('#play_order').style.backgroundImage='url(css/img/inorder.png)';
			break;
			case 2:
			document.querySelector('#play_order').style.backgroundImage='url(css/img/random.png)';
			break;
		}
	},
	bindlyc:function(targetDom,olyc){
		olyc.playTime=olyc.originalTime.reduce(function(pre,cur,index){
			pre.push((index<1)?cur:pre[index-1]+cur);
			return pre;
		},[]);
		labels.curLyc=olyc;
		targetDom.innerHTML='<span></span>'+olyc.originalLYC.split('\n').map(function(line){
			if(line===""){
				return '<p><span> </span></p>'
			}else{
				return '<p>'+line.split('').map(function(letter){
					return '<span>'+letter+'</span>';
				}).join('')+'</p>';
			}
		}).join('');
		pageData.player.words=targetDom.getElementsByTagName('span');
		window.requestAnimFrame(g.moveLycBox.bind(pageData.player.words[0]));
		g.playlyc();
	},
	playlyc:function(){
		g.pauselyc();
		var oindex=null;
		if(labels.curLyc!=null){
			for(var i in labels.curLyc.playTime){
				if(labels.curLyc.playTime[i]>labels.currentTime){
					oindex={index:i,time:labels.curLyc.playTime[i]-labels.currentTime};
					break;
				}
			}
			if(oindex){
				g.jumpTolyc(oindex.index);
				if(!labels.player.paused){
					labels.tout=setTimeout(g.next.bind(this,parseInt(oindex.index)+1),oindex.time);
				}
			}else{
				g.jumpTolyc(labels.curLyc.playTime.length);
			}
		}
	},
	jumpTolyc:function(index){
		for(var i in pageData.player.words){
			if(parseInt(i)<parseInt(index)){
				pageData.player.words[i].className="read";
			}else if(i==index){
				pageData.player.words[i].className="ontime read";
				window.requestAnimFrame(g.moveLycBox.bind(pageData.player.words[i]));
			}else{
				pageData.player.words[i].className="";
			}
		}
	},
	next:function(index){
		if(pageData.player.words[index]){
			pageData.player.words[index-1].className="read";
			pageData.player.words[index].className="read ontime";
			window.requestAnimFrame(g.moveLycBox.bind(pageData.player.words[index]));
			labels.tout=setTimeout(g.next.bind(this,parseInt(index)+1),labels.curLyc.originalTime[index]);
		}
	},
	pauselyc:function(){
		labels.currentTime=labels.player.currentTime*1000;
		clearTimeout(labels.tout);
	},
	searchlyc:function(song_name,index){
		g.ajax('/search','get',g.processSearch(index),('song_name='+song_name));
	},
	search:function(){
		var song_name=_$('searchbox').value;
		var index=labels.curIndex;
		g.ajax('/search','get',g.processSearch(index),('song_name='+song_name));
	},
	processSearch:function(index){
		return function(){
			var data=this.response;
			if(data&&data.status==0){
			pageData.player.lycs_info[index]=data.lyrics
				if(data.lyrics.length>0&&labels.curPage.toLowerCase()=='player'){
					var dataString='id='+data.lyrics[0].id;
					g.ajax('/get','get',function(){
						var data=this.response;
						if(data&&data.status==0){
							pageData.player.lycs[index]=JSON.parse(data.lyric);
							g.bindlyc(_$('lyc_box'),JSON.parse(data.lyric));
						}
					},dataString);
				}else if(data.lyrics.length==0&&labels.curPage.toLowerCase()=='player'){
					_$('lyc_box').innerHTML='<p id="no_lyc">无法找到歌词</p>'
					window.requestAnimFrame(g.moveLycBox.bind(_$('no_lyc')));
				}else if(labels.curPage.toLowerCase()=='search'){
					var pnode=__$('search_results')[0];
					Array.prototype.forEach.call(pnode.getElementsByClassName('song_box'),function(sb){
						sb.parentNode.removeChild(sb);
					});
					var template=_$('hidden').getElementsByClassName('song_box')[0];
					data.lyrics.forEach(function(newsong){
						var temp=template.cloneNode(true);
						temp.getElementsByClassName('song_name')[0].innerHTML=newsong.song_name;
						temp.getElementsByClassName('singer')[0].innerHTML=newsong.singer_name||'未知歌手';
						temp.getElementsByClassName('to_play')[0].href='javascript:g.chooseLyc('+newsong.id+')';
						pnode.appendChild(temp);
					});
					
				}
			}
		}
	},
	chooseLyc:function(id){
		g.ajax('/get','get',function(){
			var data=this.response;
			if(data&&data.status==0){
				pageData.player.lycs[labels.curIndex]=JSON.parse(data.lyric);
				g.bindlyc(_$('lyc_box'),JSON.parse(data.lyric));
				g.jumpTo('player');
			}
		},'id='+id);
	},
	moveLycBox:function(){
		labels.curPosition+=labels.midLine-this.offsetTop;
		_$('lyc_box').style.marginTop=labels.curPosition+'px';
		_$('lyc_edit_box').style.marginTop=labels.curPosition+'px';
	},
	ajax:function(url,method,callback,data){
		var xhr=new XMLHttpRequest();
		xhr.onload=callback;
		if(method.toLowerCase()=='get'){
			xhr.open('get',url+'?'+data,true);
			xhr.responseType='json';
			xhr.send();
		}else if(method.toLowerCase()=='post'){
			xhr.open('post',url);
			xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
			xhr.responseType='json';
			xhr.send(data);
		}
	},
	submitLycContent:function(){
		pageData.lyc_editer.lycFactory={
			songName:_$('iSongName').value,
			singer:_$('iSinger').value,
			lycName:_$('iLycName').value,
			lycContent:_$('iLycContent').value
		}
		pageData.lyc_editer.lycTime=[];
		pageData.lyc_editer.lycPlayTime=[];
		labels.lycIndex=0;
		_$('lyc_edit_box').innerHTML='<span></span>'+pageData.lyc_editer.lycFactory.lycContent.split('\n').map(function(line){
			if(line===""){
				return '<p><span> </span></p>'
			}else{
				return '<p>'+line.split('').map(function(letter){
					return '<span>'+letter+'</span>';
				}).join('')+'</p>';
			}
		}).join('');
		pageData.lyc_editer.words=_$('lyc_edit_box').getElementsByTagName('span');
		g.jumpTo('lyc_editer');
		labels.player.currentTime=0;
		labels.player.pause();
		labels.playing=false;
		window.requestAnimFrame(g.moveLycBox.bind(pageData.lyc_editer.words[0]));
		setTimeout(function(){g.resume();labels.timestamp=labels.player.currentTime;},2000);
	},
	processLyc:function(i){
		pageData.lyc_editer.lycTime[i]=Math.floor(labels.player.currentTime*1000)-labels.timestamp;
		pageData.lyc_editer.lycPlayTime[i]=Math.floor(labels.player.currentTime*1000);
		labels.timestamp=Math.floor(labels.player.currentTime*1000);
	},
	nextLetter:function(){
		g.processLyc(labels.lycIndex);
		pageData.lyc_editer.words[labels.lycIndex].className='read';
		labels.lycIndex+=1;
		pageData.lyc_editer.words[labels.lycIndex].className='read ontime';
		window.requestAnimFrame(g.moveLycBox.bind(pageData.lyc_editer.words[labels.lycIndex]));
	},
	traceBackLyc:function(){
		var ct=Math.floor(labels.player.currentTime*1000);
		var oindex=null;
		for(var i in pageData.lyc_editer.lycPlayTime){
			if(pageData.lyc_editer.lycPlayTime[i]>ct){
				oindex=i;
				break;
			}
		}

		if(oindex!==null){
			oindex=parseInt(oindex);
			pageData.lyc_editer.lycTime=pageData.lyc_editer.lycTime.slice(0,oindex+4);
			labels.lycIndex=oindex+4;
			labels.timestamp=pageData.lyc_editer.lycPlayTime[labels.lycIndex];
			pageData.lyc_editer.lycPlayTime=pageData.lyc_editer.lycPlayTime.slice(0,oindex+4);
			for(var i in pageData.lyc_editer.words){
				if(parseInt(i)<parseInt(labels.lycIndex)){
					pageData.lyc_editer.words[i].className="read";
				}else if(i==labels.lycIndex){
					pageData.lyc_editer.words[i].className="ontime read";
					window.requestAnimFrame(g.moveLycBox.bind(pageData.lyc_editer.words[i]));
				}else{
					pageData.lyc_editer.words[i].className="";
				}
			}
			console.log(oindex);
		}

	},
	saveLyc:function(){
		var new_lyc={
			originalLYC:pageData.lyc_editer.lycFactory.lycContent,
			originalTime:pageData.lyc_editer.lycTime
		}		
		if(labels.userName!=''){
			var ts=(Date.now()+'').slice(0,-3);
			var dataString='user_name='+labels.userName+
				'&secret='+dosha1(labels.token+ts)+
				'&timestamp='+ts+
				'&song_name='+pageData.lyc_editer.lycFactory.songName+
				'&singer_name='+pageData.lyc_editer.lycFactory.singer+
				'&song_time='+labels.player.duration+
				'&lyric='+JSON.stringify(new_lyc);
			g.ajax('/save','post',function(){console.log(this.response)},dataString);
			
		}
		pageData.player.lycs[labels.curIndex]=new_lyc;
		g.play(labels.curIndex);
		g.jumpTo('player');
	},
	showOrder:function(){
		var ol=__$('order_list')[0];
		if(ol.style.display=='none'){
			ol.style.display='block';
		}else if(ol.style.display=='block'){
			ol.style.display='none';
		}else{
			ol.style.display='block';
		}
	},
	tologin:function(){
		labels.loginPage=labels.curPage;
		if(labels.userName==''){
			_$('login').style.display='block';
		}else{
			if(labels.loginPage=='song_list'){
				g.jumpTo('my_lyc');
			}else if(labels.loginPage=='lyc_editer'){
				g.saveLyc();
			}
		}
	},
	cancellogin:function(){
		if(labels.loginPage=='song_list'){
			g.jumpTo('song_list');
		}else if(labels.loginPage=='lyc_editer'){
			g.saveLyc();
		}
	},
	login:function(){
		var psw=_$('iPassword').value;
		var user=_$('iUserName').value;
		var err=_$('err');
		if(user==''){
			err.innerHTML='用户名不能为空';
			err.style.display='block';
			return;
		}else if(user.split(' ').length>1){
			err.innerHTML='用户名不能包含空格';
			err.style.display='block';
			return;
		}else{
			err.style.display='none';
		}
		if(psw==''){
			err.innerHTML='密码不能为空';
			err.style.display='block';
			return;
		}else{
			err.style.display='none';
		}
		labels.iun=user;
		g.ajax('/login','post',g.processlogin,'user_name='+user+'&pwd='+psw);
	},
	processlogin:function(){
		if(this.response&&this.response.status==0){
			labels.userName=labels.iun;
			labels.token=this.response.token;
			var pnode=__$('my_lycs')[0];
			var template=_$('hidden').getElementsByClassName('song_box')[0];
			this.response.lyrics.forEach(function(newsong){
				var temp=template.cloneNode(true);
				temp.getElementsByClassName('song_name')[0].innerHTML=newsong.song_name;
				temp.getElementsByClassName('singer')[0].innerHTML=newsong.singer_name||'未知歌手';
				temp.getElementsByClassName('to_play')[0].href='javascript:g.chooseLyc('+newsong.id+')';
				pnode.appendChild(temp);
			});
			if(labels.loginPage=='lyc_editer'){
				g.saveLyc();
			}else if(labels.loginPage=='song_list'){
				g.jumpTo('my_lyc');
			}
			_$('login').style.display='none';
		}else{
			_$('err').innerHTML='登录失败';
			_$('err').style.display='none';
		}
	},
	keepon:function(){
		if(labels.userName!=''){

		}
	}
};
var labels={
	loginPage:'',
	curPosition:0,
	midLine:document.body.offsetHeight*.35,
	curIndex:0,
	curPage:'song_list',
	playing:false,
	order:0,
	tout:null,
	currentTime:0,
	curLyc:null,
	iun:'',
	userName:'',
	token:0,
	player:_$('audiobox'),
	timestamp:0,
	lycIndex:0
};
g.init(labels.player);