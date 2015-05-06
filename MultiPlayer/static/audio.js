var l=(function(targetDom,audio){
	var lyc={
		originalLYC:"123456\n78901234567890123456789\n012345678901234567890",
		originalTime:[1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000]
	};
	var currentTime=0;
	var tout=null;
	var words=targetDom.getElementsByTagName('span');
	function updateLYC(){
		lyc.playTime=lyc.originalTime.reduce(function(pre,cur,index,arr){
			pre.push((index<1)?cur:pre[index-1]+cur);
			return pre;
		},[]);
		targetDom.innerHTML='<span></span>'+lyc.originalLYC.split('\n').map(function(line){
			if(line===""){
				return '<p><span> </span></p>'
			}else{
				return '<p>'+line.split('').map(function(letter){
					if(letter===' '){
						return '<span class="space"></span>';
					}else{
						return '<span>'+letter+'</span>';
					}
				}).join('')+'</p>';
			}
		}).join('');
		words=targetDom.getElementsByTagName('span');
	}
	function getLYC(data){
		lyc=JSON.parse(data);
		updateLYC();
	}
	function playLYC(){
		pause();
		var oindex=null;
		for(var i=0;i<lyc.playTime.length;i++){
			if(lyc.playTime[i]>currentTime){
				oindex={index:i,time:lyc.playTime[i]-currentTime};
				break;
			}
		}
		console.log(lyc.playTime);
		jumpTo(oindex.index);
		tout=setTimeout(next.bind(this,oindex.index+1),oindex.time);
	}
	function jumpTo(index){
		for(i in words){
			if(i<index){
				words[i].className="read";
			}else if(i==index){
				words[i].className="ontime read";
			}else{
				words[i].className="";
			}
		}
	}
	function next(index){
		if(words[index]){
			words[index-1].className="read";
			words[index].className="read ontime";
			tout=setTimeout(next.bind(this,index+1),lyc.originalTime[index]);
		}
	}
	function pause(){
		currentTime=audio.currentTime*1000;
		clearTimeout(tout);
	}
	return {lyc:lyc,update:updateLYC,get:getLYC,play:playLYC,jump:jumpTo,pause:pause}
})(document.getElementById('lyc'),a);
/*(function(input,control,audio,lyc,lycObject){
	function init(){
		var progressbar=document.getElementById('progressbar');
		audio.addEventListener('timeupdate',function(){
			.style.width=Math.floor(audio.currentTime/audio.duration)+'px';
		},false);
	}
	init();
})(null,document.getElementById('control'),a,null,l);*/