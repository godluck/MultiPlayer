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
					temp.getElementsByClassName('to_play')[0].href='javascript:g.play('+_songs.indexOf(newsong)+')';
					pnode.appendChild(temp);
				});
			}
			p.click();
		}
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
	init:function(a,pageName){
		a.addEventListener('playing',function(){
			document.getElementById(pageName).getElementsByClassName('duration')[0].innerHTML=Math.floor(a.duration/60)+':'+Math.floor(a.duration % 60);
		});
		a.addEventListener('timeupdate',function(){
			var page=document.getElementById(pageName);
			page.getElementsByClassName('currentTime')[0].innerHTML=Math.floor(a.currentTime/60)+':'+Math.floor(a.currentTime%60);
			var ratio=a.currentTime/a.duration;
			page.getElementsByClassName('progressbar')[0].style.width=ratio*100+'%';
		});
		a.addEventListener('ended',function(){
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
		});
		document.getElementById(pageName).getElementsByClassName('progress_box')[0].addEventListener('click',function(e){
			if(e.target=this){
				console.log(e);
				a.currentTime=(e.offsetX||e.layerX)/this.offsetWidth*a.duration;
			}
		},false);
	},
	play:function(i){
		i=(i+pageData.song_list.songs.length)%pageData.song_list.songs.length;
		labels.curIndex=i;
		g.jumpTo('player');
		var a=document.getElementById('audiobox');
		a.src=pageData.song_list.songs[i].url;
		document.getElementById('player').getElementsByClassName('title')[0].innerHTML=pageData.song_list.songs[i].name;
		a.play();
	},
	jumpTo:function(pageName){
		document.getElementById(labels.curPage).style.display='none';
		document.getElementById(pageName).style.display='block';
		labels.curPage=pageName;
	},
	pause:function(){
		document.getElementById('audiobox').pause();
		document.getElementById('play_pause').href='javascript:g.resume()';
	},
	resume:function(){
		document.getElementById('audiobox').play();
		document.getElementById('play_pause').href='javascript:g.pause()';
	},
	changeOrder:function(){
		labels.order+=1;
		labels.order%=3;
	}
};
var labels={
	curIndex:0,
	curPage:'song_list',
	playing:false,
	order:0
};
g.init(document.getElementById('audiobox'),'player');
g.init(document.getElementById('audiobox'),'lyc_editer');