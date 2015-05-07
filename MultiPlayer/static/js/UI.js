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
var pageData={
	song_list:{
		songs:[],
		addSong:function(){
			var p=document.getElementById('file');
			var _songs=this.songs;
			var template=document.getElementById('hidden').getElementsByClassName('song_box')[0];
			p.onchange=function(){
				newsongs=Array.prototype.reduce.call(this.files,function(pre,cur,index,arr){
					var tempsong={url:g.getObjectURL(cur),name:cur.name};
					pre.push(tempsong);
					_songs.push(tempsong);
					return pre;
				},[]);
				var pnode=document.getElementsByClassName('songs')[0];
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
		var page1=document.getElementById('player');
		var page2=document.getElementById('lyc_editer');
		a.addEventListener('playing',function(e){
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
				var ob=document.getElementById('play_order');
				switch(labels.order){
					case 0:
					g.resume();
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
		document.getElementById('player').getElementsByClassName('title')[0].innerHTML=pageData.song_list.songs[i].name;
		a.play();
		labels.playing=true;
		if(!pageData.player.lycs[i]){
			g.searchlyc(pageData.song_list.songs[i].name,i);
		}else{
			bindlyc(document.getElementById('lyc_box'),pageData.player.lycs[i])
		}
	},
	jumpTo:function(pageName){
		document.getElementById(labels.curPage).style.display='none';
		document.getElementById(pageName).style.display='block';
		labels.curPage=pageName;
	},
	pause:function(){
		labels.player.pause();
		document.getElementById('play_pause').href='javascript:g.resume();g.playlyc();';
		document.getElementById('play_pause').style.backgroundImage='url(css/img/play.png)';
		document.getElementById('pause').href='javascript:g.resume()';
		document.getElementById('pause').innerHTML='播放';
	},
	resume:function(){
		labels.player.play();
		document.getElementById('play_pause').href='javascript:g.pause()';
		document.getElementById('play_pause').style.backgroundImage='url(css/img/stop.png)';
		document.getElementById('pause').href='javascript:g.pause()';
		document.getElementById('pause').innerHTML='暂停';
	},
	changeOrder:function(){
		labels.order+=1;
		labels.order%=3;
	},
	bindlyc:function(targetDom,olyc){
		olyc.playTime=olyc.originalTime.reduce(function(pre,cur,index,arr){
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
		var ts=Date.now();
		g.ajax('/search','get',g.processSearch(index),encodeURI('song_name='+song_name));
	},
	search:function(){
		var song_name=document.getElementById('searchbox').value;
		var index=labels.curIndex;
		var ts=Date.now();
		g.ajax('/search','get',g.processSearch(index),encodeURI('song_name='+song_name));
	},
	processSearch:function(index){
		return function(){
			var data=this.response;
			if(data&&data.status==0&&data.lyrics.length>0){
			pageData.player.lycs_info[index]=data.lyrics
				if(labels.curPage.toLowerCase()=='player'){
					var dataString='id='+data.lyrics[0].id;
					ajax('/get','get',function(){
						var data=this.response;
						if(data&&data.status==0){
							pageData.player.lycs[index]=data.lyric;
							g.bindlyc(document.getElementById('lyc_box'),data.lyric);
						}
					},dataString);
				}else if(labels.curPage.toLowerCase()=='search'){
					var pnode=document.getElementsByClassName('search_results')[0];
					var template=document.getElementById('hidden').getElementsByClassName('song_box')[0];
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
		ajax('/get','get',function(){
			var data=this.response;
			if(data&&data.status==0){
				pageData.player.lycs[labels.curIndex]=data.lyric;
				g.bindlyc(document.getElementById('lyc_box'),data.lyric);
				g.jumpTo('player');
			}
		},'id='+id);
	},
	moveLycBox:function(){
		labels.curPosition+=labels.midLine-this.offsetTop;
		document.getElementById('lyc_box').style.marginTop=labels.curPosition+'px';
		document.getElementById('lyc_edit_box').style.marginTop=labels.curPosition+'px';
	},
	ajax:function(url,method,callback,data){
		var xhr=new XMLHttpRequest();
		xhr.onload=callback;
		if(method.toLowerCase()=='get'){
			xhr.open('get',url+'?'+data,true);
			xhr.responseType='json';
			xhr.send();
		}else if(method.toLowerCase()=='post'){
			xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
			xhr.open('post',url);
			xhr.responseType='json';
			xhr.send(data);
		}
	},
	submitLycContent:function(){
		pageData.lyc_editer.lycFactory={
			songName:document.getElementById('iSongName').value,
			singer:document.getElementById('iSinger').value,
			lycName:document.getElementById('iLycName').value,
			lycContent:document.getElementById('iLycContent').value
		}
		document.getElementById('lyc_edit_box').innerHTML='<span></span>'+pageData.lyc_editer.lycFactory.lycContent.split('\n').map(function(line){
			if(line===""){
				return '<p><span> </span></p>'
			}else{
				return '<p>'+line.split('').map(function(letter){
					return '<span>'+letter+'</span>';
				}).join('')+'</p>';
			}
		}).join('');
		pageData.lyc_editer.words=document.getElementById('lyc_edit_box').getElementsByTagName('span');
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
			var ts=Date.now();
			var dataString='user_name'+labels.userName+
				'secret'+dosha1(labels.token+ts)+
				'timestamp'+ts+
				'song_name'+pageData.lyc_editer.lycFactory.songName+
				'singer_name'+pageData.lyc_editer.lycFactory.singer+
				'song_name'+labels.player.duration+
				'lyric'+JSON.stringify(new_lyc);
			ajax('/save','post',console.log,dataString);
		}else{
			
		}
		pageData.player.lycs[labels.curIndex]=new_lyc;
		g.bindlyc(document.getElementById('lyc_box'),new_lyc);
		g.jumpTo('player');
	},
	showOrder:function(){
		var ol=document.getElementsByClassName('order_list')[0];
		if(ol.style.display=='none'){
			ol.style.display='block';
		}else if(ol.style.display=='block'){
			ol.style.display='none';
		}else{
			ol.style.display='block';
		}
	}
};
var labels={
	curPosition:0,
	midLine:document.body.offsetHeight*.35,
	curIndex:0,
	curPage:'song_list',
	playing:false,
	order:0,
	tout:null,
	currentTime:0,
	curLyc:null,
	userName:'',
	token:0,
	player:document.getElementById('audiobox'),
	timestamp:0,
	lycIndex:0
};
g.init(labels.player);