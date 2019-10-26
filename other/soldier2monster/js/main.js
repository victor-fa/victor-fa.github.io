(function($) {
	"use strict";

	var screenWidth = document.body.clientWidth;
	var screenHeight = document.body.clientHeight;
	var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'game_div', { preload: preload, create: create, update: update, render: render });
	var currentMaxVal = 0; // 当前分贝大小
	var maxWidth = 5080;

	function preload() {
		game.stage.backgroundColor = '#71c5cf';	// Change the background color of the game	默认 #124184
		game.load.spritesheet('soldier', 'img/humstar.png', 32, 32);	// 设置对象对应的图并初始化位置
		game.load.image('start', 'img/start.png');
		game.load.image('monster', 'img/shmup-baddie3.png');
		game.load.image('bird', 'img/lead.png');
		game.load.image('life', 'img/life.png');
		game.load.image('start', 'img/start.png');
		game.load.image('platform', 'img/platform.png');
		game.world.setBounds(0, 0, maxWidth, screenHeight);
	}

	var soldier;
	var bmd;	// 轨迹
	var vertices = [];	// 节点数组
	var soldierHP = 0;	// 得分
	var monsterHP = 100;	// 怪兽扣分
	var soldierHPCaption;	// 主角面板
	var monsterHPCaption;	// 怪兽面板
	var platformSpriteTop;
	var platformSpriteBottom;
	var timer = null;	// 定时器

	function create() {
		$('.life-panel').css('top', screenHeight-70);
		/** 分贝开始 */
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		// if(!navigator.getUserMedia) { console.log('您的浏览器不支持获取音频。'); }
		navigator.getUserMedia({ audio: true }, onSuccess, onError); // 直接调成功或失败方法
		function onSuccess(stream) {
			const audioContext = window.AudioContext || window.webkitAudioContext;
			const context = new audioContext(); //创建一个管理、播放声音的对象
			const liveSource = context.createMediaStreamSource(stream); //将麦克风的声音输入这个对象
			const levelChecker = context.createScriptProcessor(4096, 1, 1); //创建一个音频分析对象，采样的缓冲区大小为4096，输入和输出都是单声道
			liveSource.connect(levelChecker); //将该分析对象与麦克风音频进行连接
			levelChecker.connect(context.destination);
			levelChecker.onaudioprocess = function(e) { //开始处理音频
				const buffer = e.inputBuffer.getChannelData(0); //获得缓冲区的输入音频，转换为包含了PCM通道数据的32位浮点数组
				let maxVal = 0;
				for (var i = 0; i < buffer.length; i++) {
					maxVal < buffer[i] ? maxVal = buffer[i] : 1;
				}
				currentMaxVal = maxVal * 50; // 获取到实时变化的分贝
			};
		}
		function onError() {} // console.log('获取音频时好像出了点问题。');
		/** 分贝结束 */

		/** 基本配置 */
		game.physics.startSystem(Phaser.Physics.BOX2D);	// Enable Box2D physics
		bmd = new Phaser.Physics.Box2D.Body(this.game, null, 0, 0, 0);
    bmd.static = true;
		/** 基本配置 */
		
		/** 怪兽 */
		var monster = game.add.sprite(-100, -100, 'monster');
		game.physics.box2d.enable(monster);
		monster.body.setCircle(25);	// 半径大小
		/** 怪兽 */
		
		/** 地板 天花板 */
		platformSpriteTop = game.add.sprite(0, 0, 'platform');
		game.physics.box2d.enable(platformSpriteTop);
		platformSpriteTop.body.static = true;
		
		platformSpriteBottom = game.add.sprite(0, screenHeight, 'platform');
		game.physics.box2d.enable(platformSpriteBottom);
		platformSpriteBottom.body.static = true;
		/** 地板 天花板 */

		/** 多个生命 */
		var starts = game.add.group();
		starts.enableBody = true;
		starts.physicsBodyType = Phaser.Physics.BOX2D;
		var startsXArr = [50, 150, 250, 350, 450, 550, 650, 750, 850, 950,	// 顶部
											1050, 1150, 1250, 1350, 1450, 1550, 1650, 1750, 1850, 1950,	// 顶部
											2050, 2150, 2250, 2350, 2450, 2550, 2650, 2750, 2850, 2950,	// 顶部
											3050, 3150, 3250, 3350, 3450, 3550, 3650, 3750, 3850, 3950,	// 顶部
											4050, 4150, 4250, 4350, 4450, 4550, 4650, 4750, 4850, 4950,	// 顶部
											50, 150, 250, 350, 450, 550, 650, 750, 850, 950,	// 中间
											1050, 1150, 1250, 1350, 1450, 1550, 1650, 1750, 1850, 1950,	// 中间
											2050, 2150, 2250, 2350, 2450, 2550, 2650, 2750, 2850, 2950,	// 中间
											3050, 3150, 3250, 3350, 3450, 3550, 3650, 3750, 3850, 3950,	// 中间
											4050, 4150, 4250, 4350, 4450, 4550, 4650, 4750, 4850, 4950,	// 中间
											50, 150, 250, 350, 450, 550, 650, 750, 850, 950,	// 底部
											1050, 1150, 1250, 1350, 1450, 1550, 1650, 1750, 1850, 1950,	// 底部
											2050, 2150, 2250, 2350, 2450, 2550, 2650, 2750, 2850, 2950,	// 底部
											3050, 3150, 3250, 3350, 3450, 3550, 3650, 3750, 3850, 3950,	// 底部
											4050, 4150, 4250, 4350, 4450, 4550, 4650, 4750, 4850, 4950];
		var startsArr = [150, 150, 150, 150, 150, 150, 150, 150, 150, 150,	// 顶部
											-50, -50, 150, 150, 150, 150, -50, 150, 150, 150,	// 顶部
											-50, -50, 150, 150, 150, 150, -50, 150, 150, 150,	// 顶部
											-50, -50, 150, 150, 150, 150, -50, 150, 150, 150,	// 顶部
											-50, -50, 150, 150, 150, 150, -50, 150, 150, 150,	// 顶部
											250, 250, 250, 250, 250, 250, 250, 250, 250, 250,	// 中间
											250, 250, 250, 250, 250, 250, 250, 250, 250, 250,	// 中间
											250, 250, 250, 250, 250, 250, 250, 250, 250, 250,	// 中间
											250, 250, 250, 250, 250, 250, 250, 250, 250, 250,	// 中间
											250, 250, 250, 250, 250, 250, 250, 250, 250, 250,	// 中间
											350, 350, 350, 350, 350, 350, 350, 350, 350, 350,	// 底部
											350, 350, -50, -50, 350, 350, 350, 350, -50, 350,	// 底部
											350, 350, -50, -50, 350, 350, 350, 350, -50, 350,	// 底部
											350, 350, -50, -50, 350, 350, 350, 350, -50, 350,	// 底部
											350, 350, -50, -50, 350, 350, 350, 350, -50, 350];
		for (var i = 0; i < 150; i++) {
			if (startsXArr[i] > 400) {
				var startsObj = starts.create(startsXArr[i], startsArr[i], 'start');
				startsObj.body.setCollisionCategory(2); // this is a bitmask
				startsObj.body.sensor = true;
			}
		}
		/** 多个生命 */

		/** 主角 */
		soldier = game.add.sprite(50, screenHeight/2, 'soldier');	// 初始化位置
		soldier.scale.set(2);
		soldier.smoothed = false;
		soldier.animations.add('fly', [0, 1, 2, 3, 4, 5], 10, true);	// 雪碧图切换
		soldier.play('fly');
		game.physics.box2d.enable(soldier);	// Create our physics body - a 28px radius circle.
		soldier.body.fixedRotation = true;
		soldier.body.setCircle(28);	// 半径
		soldier.body.setCategoryContactCallback(2, startCallback, this);	// A callback to match fixtures of category 2 (bitmask!)	加分
		/** 主角 */
		
		/** 多个怪兽 */
		var monsters = game.add.group();
		monsters.enableBody = true;
		monsters.physicsBodyType = Phaser.Physics.BOX2D;
		var monstersXArr = [50, 150, 250, 350, 450, 550, 650, 750, 850, 950,	// 顶部
											1050, 1150, 1250, 1350, 1450, 1550, 1650, 1750, 1850, 1950,	// 顶部
											2050, 2150, 2250, 2350, 2450, 2550, 2650, 2750, 2850, 2950,	// 顶部
											3050, 3150, 3250, 3350, 3450, 3550, 3650, 3750, 3850, 3950,	// 顶部
											4050, 4150, 4250, 4350, 4450, 4550, 4650, 4750, 4850, 4950,	// 顶部
											50, 150, 250, 350, 450, 550, 650, 750, 850, 950,	// 底部
											1050, 1150, 1250, 1350, 1450, 1550, 1650, 1750, 1850, 1950,	// 底部
											2050, 2150, 2250, 2350, 2450, 2550, 2650, 2750, 2850, 2950,	// 底部
											3050, 3150, 3250, 3350, 3450, 3550, 3650, 3750, 3850, 3950,	// 底部
											4050, 4150, 4250, 4350, 4450, 4550, 4650, 4750, 4850, 4950,	// 底部
											50, 150, 250, 350, 450, 550, 650, 750, 850, 950,	// 中间添加障碍
											1050, 1150, 1250, 1350, 1450, 1550, 1650, 1750, 1850, 1950,	// 中间添加障碍
											2050, 2150, 2250, 2350, 2450, 2550, 2650, 2750, 2850, 2950,	// 中间添加障碍
											3050, 3150, 3250, 3350, 3450, 3550, 3650, 3750, 3850, 3950,	// 中间添加障碍
											4050, 4150, 4250, 4350, 4450, 4550, 4650, 4750, 4850, 4950];
		var monstersYArr = [50, 50, 50, 50, 50, 50, 50, 50, 50, 50,	// 顶部
											50, 50, 50, 50, 50, 50, 50, 50, 50, 50,	// 顶部
											50, 50, 50, 50, 50, 50, 50, 50, 50, 50,	// 顶部
											50, 50, 50, 50, 50, 50, 50, 50, 50, 50,	// 顶部
											50, 50, 50, 50, 50, 50, 50, 50, 50, 50,	// 顶部
											50, 50, 50, 50, 50, 50, 50, 50, 50, 50,	// 底部
											500, 500, 500, 500, 500, 500, 500, 500, 500, 500,	// 底部
											500, 500, 500, 500, 500, 500, 500, 500, 500, 500,	// 底部
											500, 500, 500, 500, 500, 500, 500, 500, 500, 500,	// 底部
											500, 500, 500, 500, 500, 500, 500, 500, 500, 500,	// 底部
											500, 500, 500, 500, 500, 500, 500, 500, 500, 500,	// 底部
											150, 150, 350, 350, -50, -50, 150, -50, 350, -50,	// 中间添加障碍
											150, 150, -50, 350, -50, -50, 150, 150, -50, 350,	// 中间添加障碍
											150, 150, -50, 350, -50, -50, 150, 150, -50, 350,	// 中间添加障碍
											150, 150, -50, 350, -50, -50, 150, 150, -50, 350];
		for (var i = 0; i < 150; i++) {
			if (monstersXArr[i] > 400) {
				var monstersObj = monsters.create(monstersXArr[i], monstersYArr[i], 'monster');
				monstersObj.body.setCollisionCategory(2); // this is a bitmask
				monstersObj.body.sensor = true;
				game.physics.box2d.enable(monstersObj);
				monstersObj.body.setCircle(25);	// 半径大小
				soldier.body.setBodyContactCallback(monstersObj, monsterCallback, this);	// A body specific callback.
			}
		}
		/** 多个怪兽 */
		
		/** 摄像头 */
		// game.camera.follow(soldier);
		/** 摄像头 */
		
		timer = setInterval(() => { addVertex(); }, 50);
	}

	// 触碰星星
	function startCallback(body1, body2, fixture1, fixture2, begin) {
		if (!begin) { return; }
		soldierHP += 1;
		$('#scoreCount').html('X ' + soldierHP);
		body2.sprite.destroy();
	}

	// 触碰怪兽
	function monsterCallback(body1, body2, fixture1, fixture2, begin) {
		if (!begin) { return; }
		monsterHP -= 1;
		$('#lifeCount').html((monsterHP > 1 ? 'X ' : '') + (monsterHP > 0 ? monsterHP : 'dead!'));
		if (monsterHP <= 0) { restart_game('dead') }
		body2.sprite.destroy();
	}

	function update() {
		// 修改参数：
		// console.log(currentMaxVal);
		if (currentMaxVal > 0 && currentMaxVal < 40) {
			if (currentMaxVal > 8 && currentMaxVal < 40) {
				soldier.body.velocity.x = 250;
				soldier.body.velocity.y = -400;
			} else if (currentMaxVal > 7 && currentMaxVal < 8) {
				soldier.body.velocity.x = 250;
				soldier.body.velocity.y = -350;
			} else if (currentMaxVal > 6 && currentMaxVal < 7) {
				soldier.body.velocity.x = 250;
				soldier.body.velocity.y = 0;	// -300
			} else if (currentMaxVal > 5 && currentMaxVal < 6) {
				soldier.body.velocity.x = 250;
				soldier.body.velocity.y = 0;	// -250
			} else if (currentMaxVal > 4 && currentMaxVal < 5) {
				soldier.body.velocity.x = 250;
				soldier.body.velocity.y = 0;	// -200
			} else if (currentMaxVal > 3 && currentMaxVal < 4) {
				soldier.body.velocity.x = 200;
				soldier.body.velocity.y = -150;	// -150
			} else if (currentMaxVal > 2 && currentMaxVal < 3) {
				soldier.body.velocity.x = 150;
				soldier.body.velocity.y = -100;	// -100
			} else if (currentMaxVal > 0.5 && currentMaxVal < 2) {
				soldier.body.velocity.x = 100;
				soldier.body.velocity.y = -50;
			} else if (currentMaxVal > 0 && currentMaxVal < 0.5) {
				soldier.body.velocity.x = 10;
				soldier.body.velocity.y = 200;
			}
		}
		
		// 划清界限
		if (soldier.y > (screenHeight - 10)) { soldier.body.y = screenHeight - 50; }
		if (soldier.y < 0) { soldier.body.y = 0; }
		if (soldier.x > maxWidth){ restart_game('win'); }
		// 划清界限
	}

	// Restart the game
	function restart_game(flag) {
		if (flag === 'dead') {
			soldier.destroy();
			$('.dead-panel').css('display', 'block');
		} else if (flag === 'win') {
			soldier.destroy();
			$('.win-panel').css('display', 'block');
		}
	}
	
	$('#gameoverRestart,#winRestart').click(function() {	// 微信环境下需要点击引导浏览器打开
		console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^');
		window.location.reload();
	});
	
	function addVertex() {
		bmd.clearFixtures();
		console.log(soldier.x);
		vertices.push( soldier.x );
		vertices.push( soldier.y );
		// 以下是针对镜头跟随做的处理
		// if (soldier.x < 500) {
		// 	vertices.push( soldier.x );
		// 	vertices.push( soldier.y );
		// } else if (soldier.x > 500 && soldier.x < 4600) {
		// 	vertices.push( 500 );
		// 	vertices.push( soldier.y );
		// } else if (soldier.x > 4600) {
		// 	vertices.push(soldier.x-4100);
		// 	vertices.push( soldier.y );
		// }
	}
	
	function render() {
    for (var i = 0; i < vertices.length; i += 2) {
			game.debug.pixel( vertices[i]-3, vertices[i+1]-3, '#ffffff', 4);
    }   
	}
})(jQuery);
