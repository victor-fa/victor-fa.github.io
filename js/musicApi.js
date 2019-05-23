(function($) {
	'use strict';
	
	var curLyricArr = '';	// 歌词数组
	var songMidArr = [];	// 获取所有mid
	var songMidArrAll = [];	// 获取所有mid
	var $curProgress = $('.current-progress');
	var $progress = $('.progress');
	var timer = null;	// 定时器
	var playSort = 'list';	// 播放顺序 三种
	var isMusicVip = false;	// 超级mvp下，一首歌都不能播
	
	loadData();
	
	// 初始化开始播放
	function btnPlayClick() {
		setTimeout(() => {
			player.play(songMidArr, { target: 'auto', filter: true, loop: true });
			let imageUrl = '';
			if (player.data.song.album.mid !== '') {
				imageUrl = 'https://y.gtimg.cn/music/photo_new/T002R300x300M000' + player.data.song.album.mid+ '.jpg?max_age=2592000';
			} else {
				imageUrl = 'https://y.gtimg.cn/mediastyle/yqq/extra/player_cover.png?max_age=31536000';
			}
			$('.music-name span').text(player.data.song.title);	// 标题
			let tempSingerList = '';
			for (let i = 0; i < Object.keys(player.data.song.singer).length; i++) {
				tempSingerList += player.data.song.singer[Object.keys(player.data.song.singer)[i]].name + ' ';
			}
			$('.music-author span').text(tempSingerList);
			$('.img-author').attr('src', imageUrl);	// 图片
			$('.bacImg').css('background-image', 'url(' + imageUrl + ')');	// 背景图
			$(document).attr('title', player.data.song.title);
		})
		// 初始化所有当前时间、总时间、进度条的变化设置
		let allTime, currentTime, allProgressWidth;
		timer = setInterval(() => {
			allTime = player.__.data.duration;	// 音乐总时间
			currentTime = player.__.data.currentTime;
			allProgressWidth = $('.progress').width();
			setMusicTime($('.current-time'), currentTime);
			setMusicTime($('.all-time'), allTime);
			$curProgress.width(currentTime / allTime * allProgressWidth);
		}, 1000);
		timer = setInterval(() => {	// 针对歌曲变换而改变需要更换的信息
			let imageUrl = '';
			if (player.__.data.song.album.mid !== '') {
				imageUrl = 'https://y.gtimg.cn/music/photo_new/T002R300x300M000' + player.__.data.song.album.mid + '.jpg?max_age=2592000';
			} else {
				imageUrl = 'https://y.gtimg.cn/mediastyle/yqq/extra/player_cover.png?max_age=31536000';
			}
			$('.music-name span').text(player.__.data.song.title);
			let tempSingerList = '';
			for (let i = 0; i < Object.keys(player.data.song.singer).length; i++) {
				tempSingerList += player.data.song.singer[Object.keys(player.data.song.singer)[i]].name + ' ';
			}
			$('.music-author span').text(tempSingerList);
			$('.img-author').attr('src', imageUrl);
			$('.bacImg').css('background-image', 'url(' + imageUrl + ')');	// 背景图
			$(document).attr('title', player.__.data.song.title);
			if (player.__.data.state === 'playing') {	// 播放切换暂停样式
				$('#btnPlay').addClass('ctl-pause');
				$('.img-author').addClass('imgRotate');
			} else if (player.__.data.state === 'pause') {	// 暂停切换播放样式
				$('#btnPlay').removeClass('ctl-pause');
				$('.img-author').removeClass('imgRotate');
			}
		}, 1500);
		if (player.data.state === 'playing') {	// 播放切换暂停样式
			$('#btnPlay').removeClass('ctl-pause');
			$('.img-author').removeClass('imgRotate');
			setMusicProgress('playing');
		} else if (player.data.state === 'pause') {	// 暂停切换播放样式
			$('#btnPlay').addClass('ctl-pause');
			$('.img-author').addClass('imgRotate');
			setMusicProgress('pause');
		} else if (player.data.state === 'ready') {	// 准备切换播放样式
			$('#btnPlay').removeClass('ctl-pause');
			$('.img-author').removeClass('imgRotate');
			setMusicProgress('playing');
		}
	}
	
	var list = [];
	var songNameArr = [];
	var songAuthorArr = [];
	var songAlbumArr = [];
	function loadData() {
		player.playReady();
		let url = '';
		if (getQueryString('singer') === '') {
			url = 'https://victor-fa.github.io/music/music-list.json';
		} else if (getQueryString('singer') === 'lijun') {
			url = 'https://victor-fa.github.io/music/music-list-lijun.json';
		}
		$.ajax({
			url: url,
			type: 'get',
			scriptCharset: 'GBK', //解决中文乱码
			success: function(data) {
				//获取搜索数据
				var tempSongs = data.data.song.list;
				var songs = [];
				// var songs = data.data.song.list;
				songs = getRandomArrayElements(tempSongs, 20)	// 随机获取100个数组中的20个
				for (let i = 0; i < songs.length; i++) {
					// console.log(songs[i].pay);
					if (songs[i].pay.pay_play !== undefined && songs[i].pay.pay_play === 0) {	// 过滤付费音乐
						if (songs[i].action.msg !== 3) {
							console.log(JSON.stringify(songs[i]));
							songMidArr.push(songs[i].mid)	// mid
							songMidArrAll.push(songs[i].mid)	// mid
							songNameArr.push(songs[i].title)	// 歌曲名
							songAlbumArr.push(songs[i].album.mid)	// 专辑名
							let tempSingerList = '';
							for (let j = 0; j < songs[i].singer.length; j++) {
								tempSingerList += songs[i].singer[j].name + ' ';
							}
							songAuthorArr.push(tempSingerList)	// 作者名
						}
					} else {
						// console.log(songs[i].singer[0].name + ' ———— 付费的');
					}
				}
				setTimeout(function() { btnPlayClick(); })
				
				$('#music-list-ul').html('');	// 清空
				songNameArr.forEach((music, index) => {
					$('<li class="list-item" data-index="' + index + '">' +
						' <p class="singer listSong' + index + '">' +
						'   <span>' + music + '</span><span class="singer-name"> - ' + songAuthorArr[index] + '</span>' +
						' </p>' +
						'</li>').appendTo('#music-list-ul');
				});
			},
			error: function(e) {
				console.log('error');
			}
		});
		$('.lyric').css('height', $('.music').height() - 380);	// 设置歌词高度
		$('#btnPlay').removeClass('ctl-pause');	// 开始处于不可播放状态，默认为待播放状态
		$('.img-author').removeClass('imgRotate');	// 开始处于不可播放状态，默认为待播放状态
	}
	
	// 随机获取数组的某几个元素
	function getRandomArrayElements(arr, count) {
		var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
		while (i-- > min) {
			index = Math.floor((i + 1) * Math.random());
			temp = shuffled[index];
			shuffled[index] = shuffled[i];
			shuffled[i] = temp;
		}
		return shuffled.slice(min);
	}

	// 设置音乐播放进度
	function setMusicProgress(playStatus) {
		let allTime, currentTime, allProgressWidth;
		if (playStatus === 'playing') {
			timer = setInterval(() => {	// 设定定时器，根据播放时间调整播放进度
				allTime = player.__.data.duration;	// 音乐总时间
				currentTime = player.__.data.currentTime;
				allProgressWidth = $('.progress').width();
				setMusicTime($('.current-time'), currentTime);
				setMusicTime($('.all-time'), allTime);
				$curProgress.width(currentTime / allTime * allProgressWidth);
			}, 1000);
		} else if (playStatus === 'pause') { clearInterval(timer); }
	}
	
	// 设置音乐跳转给定时间
	function setMusicTime(element, time) {
		let minutes = parseInt(time / 60);
		let seconds = parseInt(time % 60);
		element.text((minutes < 10 ? ('0' + minutes) : minutes) + ':' + (seconds < 10 ? ('0' + seconds) : seconds));
	}
	
	// 调整音乐播放进度
	$('.progress').click(function(e) {
		let newPosition = e.pageX - parseInt($('.music').css('marginLeft')); // 当前鼠标点击位置 - 播放器左边的外间距
		changeMusicProgress($(this), newPosition);
	})

	// 手动改变音乐播放进度
	function changeMusicProgress($musicProgress, newPosition) {
		let beginProgress = $musicProgress.position().left; // 播放进度起始位置
		let allProgress = $('.progress').width();
		let allTime = player.__.data.duration;
		let currentTime;
		if (newPosition <= beginProgress) {
				currentTime = 0;
		} else if (newPosition >= (beginProgress + allProgress)) {
				currentTime = allTime;
		} else {
				currentTime = allTime * (newPosition - beginProgress) / allProgress;
		}
		player.currentTime = currentTime;
		setMusicTime($('.current-time'), currentTime);
		$curProgress.width(currentTime / allTime * allProgress);
	}

	// 工具
	var utils = {
		touch: 'ontouchend' in document ? true : false,
		ontap: function(elem, callback) {
			if (typeof elem == 'string') { elem = document.querySelector(elem); }
			if (elem) {
				if (utils.touch) {
					var x1 = null, y1 = null, x2 = null, y2 = null;
					elem.addEventListener('touchstart', function(e) {
						if (e.touches.length == 1) { x1 = x2 = e.touches[0].pageX; y1 = y2 = e.touches[0].pageY; }
					});
					elem.addEventListener('touchmove', function(e) {
						if (x1 != null) { x2 = e.touches[0].pageX; y2 = e.touches[0].pageY; }
					});
					elem.addEventListener('touchend', function() {
						if (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) < 400) { callback.call(elem); }
						x1 = null;
					});
				} else {
					elem.addEventListener('click', callback);
				}
			}
			return this;
		}
	}
	
	utils
    .ontap('#btnPlay', function (e) { btnPlayClick(); })	// 播放音乐
    .ontap('.ctl-prev', function (e) {	// 上一首
			if (playSort === 'single') {	// 单曲时候切换上一首需要播放上一首
				let currentmid = 0;
				songMidArrAll.forEach((item, i) => {
					if (item === player.__.data.song.mid) {
						currentmid = (i - 1 === -1 ? songMidArrAll.length - 1 : i - 1)	// 上一个mid
						// currentmid = songMidArrAll[(i - 1 === -1) ? songMidArrAll.length - 1 : i - 1]	// 上一个mid
					}
				})
				player.play(currentmid, { target: 'auto', filter: true, loop: true, index: currentmid });
			} else {
				player.playPrev();
			}
			let imageUrl = '';
			if (player.data.song.album.mid !== '') {
				imageUrl = 'https://y.gtimg.cn/music/photo_new/T002R300x300M000' + player.data.song.album.mid+ '.jpg?max_age=2592000';
			} else {
				imageUrl = 'https://y.gtimg.cn/mediastyle/yqq/extra/player_cover.png?max_age=31536000';
			}
			$('.music-name span').text(player.data.song.title);
			let tempSingerList = '';
			for (let i = 0; i < Object.keys(player.data.song.singer).length; i++) {
				tempSingerList += player.data.song.singer[Object.keys(player.data.song.singer)[i]].name + ' ';
			}
			$('.music-author span').text(tempSingerList);
			$('.img-author').attr('src', imageUrl);
			$('.bacImg').css('background-image', 'url(' + imageUrl + ')');	// 背景图
			$(document).attr('title', player.data.song.title);
    })
    .ontap('.ctl-next', function (e) {	// 下一首
			console.log(playSort);
			if (playSort === 'single') {	// 单曲时候切换下一首需要播放下一首
				let currentmid = 0;
				songMidArrAll.forEach((item, i) => {
					if (item === player.__.data.song.mid) {
						// currentmid = songMidArrAll[(i+1 === songMidArrAll.length) ? 0 : i+1]	// 下一个mid
						currentmid = (i+1 === songMidArrAll.length ? 0 : i+1)	// 下一个mid
					}
				})
				player.play(songMidArrAll, { target: 'auto', filter: true, loop: true, index: currentmid });
			} else {
				player.playNext();
			}
			let imageUrl = '';
			if (player.data.song.album.mid !== '') {
				imageUrl = 'https://y.gtimg.cn/music/photo_new/T002R300x300M000' + player.data.song.album.mid+ '.jpg?max_age=2592000';
			} else {
				imageUrl = 'https://y.gtimg.cn/mediastyle/yqq/extra/player_cover.png?max_age=31536000';
			}
			$('.music-name span').text(player.data.song.title);
			let tempSingerList = '';
			for (let i = 0; i < Object.keys(player.data.song.singer).length; i++) {
				tempSingerList += player.data.song.singer[Object.keys(player.data.song.singer)[i]].name + ' ';
			}
			$('.music-author span').text(tempSingerList);
			$('.img-author').attr('src', imageUrl);
			$('.bacImg').css('background-image', 'url(' + imageUrl + ')');	// 背景图
			$(document).attr('title', player.data.song.title);
    })
    .ontap('.ctl-list', function (e) { $('.music-list').css('height', '50%').css('width', '100%'); })	// 获取列表
    .ontap('.mask', function (e) { $('.music-list').css('height', '0'); })
    .ontap('.music-name', function (e) { $('.music-list').css('height', '0'); })	// 点击歌曲名
    .ontap('.music-author', function (e) { $('.music-list').css('height', '0'); })	// 点击作者名
    .ontap('.music-img', function (e) { $('.music-list').css('height', '0'); })
    .ontap('.ctl-mode-list', function (e) { // 随机、单曲、循环
			if (playSort === 'list') {
				$('#btnMode').removeClass('ctl-mode-list ctl-mode-random').addClass('ctl-mode-single');
				playSort = 'single'
			} else if (playSort === 'single') {
				$('#btnMode').removeClass('ctl-mode-single ctl-mode-list').addClass('ctl-mode-random');
				playSort = 'random'
			} else if (playSort === 'random') {
				$('#btnMode').removeClass('ctl-mode-single ctl-mode-random').addClass('ctl-mode-list');
				playSort = 'list'
			}
    })
    .ontap('.music-img', function (e) {
			if ($('.music-list').height() < 10) {	// 解决列表弹出时会隐藏图片情况
				$('.music-img').css('display', 'none');
				$('.music-lyric').css('display', 'block');
			}
		})
    .ontap('.music-lyric', function (e) {
			$('.music-img').css('display', 'block');
			$('.music-lyric').css('display', 'none');
		})
		
	// 点击列表切换音乐，因为无法点击到动态元素，所以通过on获取动态子元素
	$('#music-list-ul')
		.on('click', '.listSong0', function() { clickList(0); })
		.on('click', '.listSong1', function() { clickList(1); })
		.on('click', '.listSong2', function() { clickList(2); })
		.on('click', '.listSong3', function() { clickList(3); })
		.on('click', '.listSong4', function() { clickList(4); })
		.on('click', '.listSong5', function() { clickList(5); })
		.on('click', '.listSong6', function() { clickList(6); })
		.on('click', '.listSong7', function() { clickList(7); })
		.on('click', '.listSong8', function() { clickList(8); })
		.on('click', '.listSong9', function() { clickList(9); })
		.on('click', '.listSong10', function() { clickList(10); })
		.on('click', '.listSong11', function() { clickList(11); })
		.on('click', '.listSong12', function() { clickList(12); })
		.on('click', '.listSong13', function() { clickList(13); })
		.on('click', '.listSong14', function() { clickList(14); })
		.on('click', '.listSong15', function() { clickList(15); })
		.on('click', '.listSong16', function() { clickList(16); })
		.on('click', '.listSong17', function() { clickList(17); })
		.on('click', '.listSong18', function() { clickList(18); })
		.on('click', '.listSong19', function() { clickList(19); });
	
	function clickList(index) { player.play(songMidArrAll, { target: 'auto', filter: true, loop: true, index: index }); console.log(index); $('.music-list').css('height', '0'); }	// 抽取公用方法
	
	player.on("ended", function () {
		player.pause();
		if (playSort === 'list') {
			let index = 0;
			for (let i = 0; i < songMidArrAll.length; i++) {
				if (player.data.song.mid === songMidArrAll[i]) {
					index = i + 1;	// 得到下一个mid
				}
			}
			player.play(songMidArrAll, { target: 'auto', filter: true, loop: true, index: index - 1 });
		} else if (playSort === 'single') {
			const tempArr = [];
			tempArr.splice(0, tempArr.length);
			tempArr.push(player.data.song.mid);
			tempArr.push('xxx');
			player.play(tempArr, { target: 'auto', filter: true, loop: true, index: 0 });
			if (player.__.data.state === 'playing') {
				player.pause();
				player.play(tempArr, { target: 'auto', filter: true, loop: true, index: 1 });
			}
		} else if (playSort === 'random') {
			const tempArr = songMidArr;
			player.play(shuffle(tempArr), { target: 'auto', filter: true, loop: true });
		}
	})
	
	// 打乱顺序
	function shuffle(arr) {
    var len = arr.length;
    for (var i = 0; i < len - 1; i++) {
			var index = parseInt(Math.random() * (len - i));
			var temp = arr[index];
			arr[index] = arr[len - i - 1];
			arr[len - i - 1] = temp;
    }
    return arr;
	}

	// 获取URL中参数值
	function getQueryString(name) {
		if (name === 'singer') {	// 歌手
			const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
			var r = window.location.search.substr(1).match(reg);
			return r != null ? decodeURI(r[2]) : '';
		} else if (name === 'song') {	// 歌名
			const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
			var r = window.location.search.substr(1).match(reg);
			return r != null ? decodeURI(r[2]) : '';
		}
	}
	
	// 判断是否为中文字符
	function funcChina(val){
		const reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g');
		return reg.test(val) ? true : false;
	}
	
	// 封装弹框提示错误信息
	function showNotify(notyifyMsg) {
		$(".hide-notify").css('display', 'block')
		let count = 4;
		$(".notify-text").text(notyifyMsg + '(' + count + 's)')
		timer = setInterval(() => {	// 设定定时器，根据播放时间调整播放进度
			count -= 1;
			$(".notify-text").text(notyifyMsg + '(' + count + 's)')
		}, 1000);
		setTimeout(function(){
			$(".hide-notify").css('display', 'none')
			loadData();
		}, 4000);
	}
	
})(jQuery);
