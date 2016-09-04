var currDispMode = -1;//0-mob,1-desk

var secs = 420000;
var rotAngle = 0;
var rotInterval;
var leaderboard;

function RecalcBody()
{
	$('body').height(Math.max(730, window.innerHeight, $('#hello-page').offset().top + $('#hello-page').height(), $('#lk-page').offset().top + $('#lk-page').height()));
}

function ResizeEvent()
{
	if (window.innerWidth >= 1107)
	{
		$('#caphint-text').text('Прохождение капчи автоматически отсылает запрос на убийство');
		$('#captcha-hint-pic').addClass('flip-vertical');
		currDispMode = 1;
	}
	else
	{//mob
		$('#caphint-text').text('Чтобы убить');
		$('#captcha-hint-pic').removeClass('flip-vertical');
		currDispMode = 0;
	}
	$("*").finish();
	ForcedMainFade();
	ForcedMainScreen();
	RecalcBody();
	$('#viewport').attr('content', 'width=device-width, user-scalable=0');
	if ($(window).width() < 400)
		$('#viewport').attr('content', 'width=400, user-scalable=0');
}

window.onresize = ResizeEvent;

$(document).ready(function(){
	$('#inside-logo').hover(function(){
		clearInterval(rotInterval);
		rotInterval = setInterval(function(){$('#logo').rotate(rotAngle -= 0.1);}, 30);
	}, function(){
		clearInterval(rotInterval);
		rotInterval = setInterval(function(){$('#logo').rotate(rotAngle += 0.1);}, 65);
	});
	TimerUpdate();
	setInterval(TimerUpdate, 1000);
	rotInterval = setInterval(function(){$('#logo').rotate(rotAngle += 0.1);}, 60);
	
	$('#reg-1').focusin(function(){$('#reg-hint-1').animate({opacity: 1, right: -165}, 300);});
	$('#reg-1').focusout(function(){$('#reg-hint-1').animate({opacity: 0, right: -175}, 300);});
	
	$('#reg-2').focusin(function(){$('#reg-hint-2').animate({opacity: 1, left: -120}, 300);});
	$('#reg-2').focusout(function(){$('#reg-hint-2').animate({opacity: 0, left: -130}, 300);});
	
	$('#reg-3').focusin(function(){$('#reg-hint-3').animate({opacity: 1, right: -185}, 300);});
	$('#reg-3').focusout(function(){$('#reg-hint-3').animate({opacity: 0, right: -195}, 300);});
	
	$('#reg-1').on('input', OnRegChange);
	$('#reg-2').on('input', OnRegChange);
	$('#reg-3').on('input', OnRegChange);

	var achfwD = function(i) {return function(){if (currDispMode != 1) return; WriteAchievementWrapper(i); }};
	var achfwM = function(i) {return function(){if (currDispMode != 0) return; WriteAchievementWrapper(i); }};
	for (var i = 1; i <= achievementCount; ++i)
	{
		$('#ac' + i).on('click', achfwM(i));
		$('#ac' + i).on('mouseenter', achfwD(i));
	}
	WriteAchievementWrapper(1);
	
	bck2 = new ProgressBar.Circle('#score-progress-bck', {
		color: '#4E4E4E',
		duration: 1500,
		easing: 'easeInOut',
		strokeWidth: 5
	});
	scoreProgress = new ProgressBar.Circle('#score-progress', {
		color: '#FFFFFF',
		duration: 2000,
		easing: 'easeInOut',
		strokeWidth: 5,
		step: function(state, bar){
			$('#progress-text').html('Твой результат лучше чем у ' + Math.round(bar.value() * 100) + '% игроков');
			if (scorePerc == 0)
			{
				$('#proc-score').html(pad(Math.round(score)), 3);
				$('#proc-kills').html(pad(Math.round(kills)), 3);
				$('#proc-rank').html(pad(Math.round(rank)), 3);
			}
			else
			{
				$('#proc-score').html(pad(Math.round(score * (bar.value() / scorePerc)), 3));
				$('#proc-kills').html(pad(Math.round(kills * (bar.value() / scorePerc)), 3));
				$('#proc-rank').html(pad(Math.round(rank * (bar.value() / scorePerc)), 3));
			}
		}
	});
	ResizeEvent();
	$(window).bind('hashchange', HashManager);
	VK.init({apiId: 5170996});

	var leaderLoad = function (data)
	{
		leaderboard = $.parseJSON(data);
		var lastPlace = 0;
		var lastScore = -1;
		for (var i = 0; i < leaderboard.length; ++i)
		{
			if (lastScore != leaderboard[i]['score'])
			{
				lastScore = leaderboard[i]['score'];
				lastPlace++;
			}
			leaderboard[i]['place'] = lastPlace;
			$('#leaderboard-table').append('<tr><td width="30px">' + lastPlace + '</td><td width="160px">' + leaderboard[i]['anon_id'] + '</td><td width="70px">' + leaderboard[i]['score'] + '</td><td width="70px">' + leaderboard[i]['killed_count'] + '</td></tr>');
		}

		HashManager();
	};

	GET('/engine/leaderboard.php', leaderLoad)
});

var prvHash = "";
function HashGoStart()
{
	switch (prvHash)
	{
		case "#about-game":
			ToggleRules();
		break;
		case "#registration":
			ToggleRegister();
		break;
		case "#pers-cab":
			LoginIntoLK();
		break;
	}
	location.hash = "";
}
function HashManager()
{
	$("*").finish();
	switch (prvHash)
	{
		case "#about-game":
		case "#registration":
		case "#pers-cab":
			HashGoStart();
		break;
	}
	switch (location.hash)
	{
		case "#about-game":
			ToggleRules();
		break;
		case "#registration":
			ToggleRegister();
		break;
		case "#pers-cab":
			LoginIntoLK();
		break;
	}
	prvHash = location.hash;
}

function WriteAchievementWrapper(i)
{
	WriteAchievementHint(acHints[i - 1]);
	for (var j = 1; j <= achievementCount; ++j)
		$('#ac' + j).removeClass('ach-selected');
	$('#ac' + i).addClass('ach-selected');
}

var MainShown = true;
function ToggleMainScreen()
{
	if (MainShown)
	{
		$("#enter-hint").animate({opacity: 0}, 300);
		$("#about-game").animate({opacity: 0}, 400);
		$("#about-game").css( 'pointer-events', 'none' );
		
		$("#timer-div").animate({marginTop: -210, opacity: 0}, 1000);
		$("#backg-timer").animate({marginTop: -170, opacity: 0}, 1000);
		
		$("#inside-logo").css( 'pointer-events', 'none' );
		$("#logo").animate({width: 140}, 1000, function(){if (!MainShown) $("#return-hint").animate({opacity: 1}, 300);});
		$("#inside-logo").animate({width: 60, marginTop: 40}, 1000, function(){$("#inside-logo").css( 'pointer-events', 'auto' );});

		if (currDispMode == 1)
		{
			$("#leader-left").animate({opacity: 0, top: -100}, 500);
			$("#news-right").animate({opacity: 0, top: -100}, 500);
		}
		else
		{
			$("#leader-left").animate({opacity: 0, top: -100, height: 78}, 500);
			$("#news-right").animate({opacity: 0, bottom: -100}, 500);
		}
	}
	else
	{
		if (currDispMode == 1)
		{
			$("#leader-left").animate({opacity: 1, top: 0}, 500);
			$("#news-right").animate({opacity: 1, top: 0}, 500);
		}
		else
		{
			$("#leader-left").animate({opacity: 1, top: 0, height: 300}, 500);
			$("#news-right").animate({opacity: 1, bottom: 0}, 500);
		}

		$("#timer-div").animate({marginTop: 40, opacity: 1}, 1000);
		$("#backg-timer").animate({marginTop: 40, opacity: 1}, 1000);
		
		$("#logo").animate({width: 282}, 1000, function(){if (MainShown) $("#enter-hint").animate({opacity: 1}, 300);});
		
		$("#inside-logo").css( 'pointer-events', 'none' );
		$("#inside-logo").animate({width: 141, marginTop: 65}, 1000, function(){$("#inside-logo").css( 'pointer-events', 'auto' );});
		
		$("#return-hint").animate({opacity: 0}, 300, function(){$("#about-game").animate({opacity: 1}, 400); $("#about-game").css( 'pointer-events', 'auto' );});
	}
	MainShown = !MainShown;
}
function ForcedMainScreen()
{
	$("#leader-left").animate({left: 0, top: 0, height: 300}, 0);
	$("#news-right").animate({right: 0, bottom: 0}, 0);

	if (MainShown)
		return;

	if (currDispMode == 1)
	{
		$("#leader-left").animate({opacity: 0, left: -100}, 0);
		$("#news-right").animate({opacity: 0, right: -100}, 0);
	}
	else
	{
		$("#leader-left").animate({opacity: 0, top: -100, height: 78}, 0);
		$("#news-right").animate({opacity: 0, bottom: -100}, 0);
	}
}

var LKActive = false;
var scorePerc = 0.72;
var kills = 13, score = 57, rank = 42;
var bck2, scoreProgress;
var achievementCount = 5;
var acHints = ['<div class="underlined">Кильки в бочке I</div>Пример ачивки', '<div class="underlined">Кильки в бочке II</div>Пример ачивки', '<div class="underlined">Кильки в бочке III</div>Пример ачивки', '<div class="underlined">Кильки в бочке VI</div>Пример ачивки', '<div class="underlined">Кильки в бочке V</div>Пример ачивки'];
function LoginIntoLK()
{
	if (!LKActive)
	{
		VK.Auth.getLoginStatus(function(response)
		{
			if (response.session)
				FillLK();
			else
				VK.Auth.login(function(response)
				{
					if (response.session)
						FillLK();
				});
		});
	}
	else
		ToggleLK();
}

function FillLK()
{
	var stage2 = function (data)
	{
		data = $.parseJSON(data);
		if (data['result'] != 'success')
		{
			if (data['result'] == 'not a player')
			{
				prvHash = '';
				window.location.href = "#registration";
			}
			return;
		}
		$('#victim-name').val(data['victim_name']);
		$('#victim-dep').val(data['victim_dep']);

		kills = data['killed_count'];
		score = data['score'];
		var lowerRank = 0;
		for (var i = 0; i < leaderboard.length; ++i)
			if (leaderboard[i]['anon_id'] == data['anon_id'])
			{
				rank = leaderboard[i]['place'];
				while (i < leaderboard.length && leaderboard[i]['place'] == rank)
					++i;
				lowerRank = i;
				break;
			}
		var stage4 = function(plc)
		{
			scorePerc =  (plc - lowerRank) / (plc - 1);

			FlipWordInit('#deathword', data['death_word']);
			FlipWordInit('#secretword', data['secret_word']);
			FlipWordInit('#vic-secword', data['victim_secret_word']);

			$('#pers-name-part-left').text(data['name']);
			$('#pers-name-part-right').text(data['anon_id']);

			ToggleLK();
		}
		GET('/engine/leaderboard.php?count=1', stage4);

	}
	GET('/engine/profile.php', stage2);
}

function ToggleLK()
{
	LKActive = !LKActive;
	ToggleMainScreen();
	if (LKActive)
	{//активируем LK
		setTimeout(function(){$(".pers-logo").animate({opacity: 1}, 300); $('.pers-name-part').animate({opacity: 1}, 300); $("#lk-page").css('z-index', '1');}, 700);
		bck2.animate(1);
		scoreProgress.animate(scorePerc);
		$("#progress-center").animate({opacity: 1}, 700);
		$("#words-right").css('display','inline-block');
		$("#words-right").animate({opacity: 1}, 700);
		$("#victim-left").css('display','inline-block');
		$("#victim-left").animate({opacity: 1}, 700);
		$("#inside-logo-link").attr('href', '#');
	}
	else
	{
		$("#lk-page").css('z-index', '-1');
		$(".pers-logo").animate({opacity: 0}, 300);
		bck2.animate(0);
		scoreProgress.animate(0);
		$("#progress-center").animate({opacity: 0}, 700);
		$("#words-right").animate({opacity: 0}, 700, function(){$("#words-right").hide();});
		$("#victim-left").animate({opacity: 0}, 700, function(){$("#victim-left").hide();});
		$('.pers-name-part').animate({opacity: 0}, 300);
		$("#inside-logo-link").attr('href', '#pers-cab');
	}
	RecalcBody();
}

var MainFaded = false;
function ToogleMainFade()
{
	if (MainFaded)
	{
		$("#enter-hint").animate({opacity: 1}, 400);

		$("#timer-div").animate({opacity: 1}, 1000);
		$("#backg-timer").animate({opacity: 1}, 1000);
		$("#about-game").animate({opacity: 1}, 1000);
		$("#about-game").css( 'pointer-events', 'auto' );
			
		$("#logo").animate({opacity: 1}, 1000);
		$("#inside-logo").animate({opacity: 1}, 1000);
		$("#inside-logo").css( 'pointer-events', 'auto' );

		$("#leader-left").css( 'pointer-events', 'auto' );
		$("#news-right").css( 'pointer-events', 'auto' );

		if (currDispMode == 1)
		{
			$("#leader-left").animate({opacity: 1, left: 0}, 1000);
			$("#news-right").animate({opacity: 1, right: 0}, 1000);
		}
		else
		{
			$("#leader-left").animate({opacity: 1, top: 0}, 1000);
			$("#news-right").animate({opacity: 1, bottom: 0}, 1000);
		}
	}
	else
	{
		$("#enter-hint").animate({opacity: 0}, 400);

		$("#timer-div").animate({opacity: 0.6}, 1000);
		$("#backg-timer").animate({opacity: 0.6}, 1000);
		
		$("#about-game").animate({opacity: 0}, 400);
		$("#about-game").css( 'pointer-events', 'none' );
		
		$("#logo").animate({opacity: 0.1}, 700);
		$("#inside-logo").animate({opacity: 0.1}, 700);
		$("#inside-logo").css( 'pointer-events', 'none' );

		$("#leader-left").css( 'pointer-events', 'none' );
		$("#news-right").css( 'pointer-events', 'none' );

		if (currDispMode == 1)
		{
			$("#leader-left").animate({opacity: 0.2, left: -30}, 1000);
			$("#news-right").animate({opacity: 0.2, right: -30}, 1000);
		}
		else
		{
			$("#leader-left").animate({opacity: 0.2, top: -30}, 1000);
			$("#news-right").animate({opacity: 0.2, bottom: -30}, 1000);
		}
	}
	MainFaded = !MainFaded;
}
function ForcedMainFade()
{
	$("#leader-left").animate({left: 0, top: 0}, 0);
	$("#news-right").animate({right: 0, bottom: 0}, 0);

	//...
	if (!MainFaded)
		return;

	if (currDispMode == 1)
	{
		$("#leader-left").animate({opacity: 0.2, left: -30}, 0);
		$("#news-right").animate({opacity: 0.2, right: -30}, 0);
	}
	else
	{
		$("#leader-left").animate({opacity: 0.2, top: -30}, 0);
		$("#news-right").animate({opacity: 0.2, bottom: -30}, 0);
	}
}

var RulesShown = false;
function ToggleRules()
{
	if (!MainShown)
		return;
	ToogleMainFade();
	if (RulesShown)
	{
		$("#back-from-rules").hide();
		$("#rules-wrapper").animate({height: 0, opacity: 0}, 1000);
	}
	else
	{
		$("#rules-wrapper").animate({height: 340, opacity: 1}, 1000, function(){$("#back-from-rules").show();});
	}
	RulesShown = !RulesShown;
}

var RegisterShown = false;
function ToggleRegister()
{
	if (!MainShown)
		return;
	if (RegisterShown)
	{
		setTimeout(ToogleMainFade, 300);
		$("#registr").animate({opacity: 0}, 1000, function(){$("#registr").hide()});
		$(".reg-field").animate({width: 10}, 700);
	}
	else
	{
		ToogleMainFade();
		setTimeout(function(){$(".reg-field").animate({width: 250}, 700);}, 300);
		$("#registr").show();
		$("#registr").animate({opacity: 1}, 1000);
	}
	RegisterShown = !RegisterShown;
}

function pad(num, len)
{
	var s = "00" + num;
	return s.substr(s.length-len);
}

function TimerUpdate()
{
	var days = pad(Math.floor(secs / 60 / 60 / 24), 2).toString();
	var hours = pad(Math.floor(secs / 60 / 60) % 24, 2).toString();
	var minutes = pad(Math.floor(secs / 60) % 60, 2).toString();
	var seconds = pad(secs % 60, 2).toString();
	$('#timer').text(days+':'+hours+':'+minutes+':'+seconds);
	secs--;
}

var RegHSwn = false;
function OnRegChange()
{
	if (!RegHSwn && $("#reg-1").val() != '' && $("#reg-2").val() != '' && $("#reg-3").val() != '')
	{
		$('#reg-hint-4').animate({opacity: 1}, 300);
		RegHSwn = true;
	}
}

function Register()
{
	var login = $("#reg-1").val().trim();
	var password = $("#reg-2").val().trim();
	var anon_id = $("#reg-3").val().trim();
	
	var fieldsOk = true;
	if (login == '')
	{
		$("#reg-1").animate({width: 300}, 300, function(){$("#reg-1").animate({width: 250}, 300);});
		fieldsOk = false;
	}
	if (password == '')
	{
		$("#reg-2").animate({width: 300}, 300, function(){$("#reg-2").animate({width: 250}, 300);});
		fieldsOk = false;
	}
	if (anon_id == '')
	{
		$("#reg-3").animate({width: 300}, 300, function(){$("#reg-3").animate({width: 250}, 300);});
		fieldsOk = false;
	}
	
	if (!fieldsOk)
		return;

	var registerResult = function (result)
	{
		result = $.parseJSON(result);
		switch (result['result'])
		{
			case 'УСПЕШНАЯ РЕГИСТРАЦИЯ':
				$("#reg-1").val('');
				$("#reg-2").val('');
				$("#reg-3").val('');
				FlipRegisterLabel(result['result'], 'green', true);
			break;
			default:
				FlipRegisterLabel(result['result'], 'red', true);
			break;
		}
	};

	POST('/engine/regvialms.php', {lmslogin: login, lmspassw: password, anonid: anon_id}, registerResult);
}

var rotInt, backRotInt;
function FlipRegisterLabel(newText, bkgColor, first)
{
	clearInterval(rotInt);
	clearTimeout(backRotInt);
	flipDegs = 0;
	rotInt = setInterval(function(){
		$("#reglabel").css( 'transform', 'rotateY('+flipDegs+'deg)' );
		flipDegs+=5;
		if (flipDegs == 270)
		{
			$("#reglabel").css( 'background', bkgColor);
			$("#reglabel-text").text(newText);
		}
		if (flipDegs == 360)
		{
			if (first)
				backRotInt = setTimeout("FlipRegisterLabel('РЕГИСТРАЦИЯ НА ИГРУ', 'transparent', false)", 2000);
			clearInterval(rotInt);
		}
	}, 10);
}

function FlipWordInit(wordId, wordText)
{
	var rotIntw;
	var FlipWordAndReplaceWith = function(wordId, replaceWith)
	{
		clearInterval(rotIntw);
		var flipDegs = 0;
		var rotMod = 5;
		rotIntw = setInterval(function(){
			$(wordId).css( 'transform', 'rotateX('+flipDegs+'deg)' );
			flipDegs+=rotMod;
			if (flipDegs == 90)
			{
				$(wordId).text(replaceWith);
				$(wordId).val(replaceWith);
				rotMod = -5;
			}
			if (flipDegs == 0)
				clearInterval(rotIntw);
		}, 10);
	};
	
	$(wordId).on('click', function(){
		if ($(wordId + '-text').text() == '[нажми, чтобы увидеть]' || $(wordId + '-text').val() == '[нажми, чтобы увидеть]')
			FlipWordAndReplaceWith(wordId + '-text', wordText);
		else
			FlipWordAndReplaceWith(wordId + '-text','[нажми, чтобы увидеть]');
	});
}

function WriteAchievementHint(textToWrite)
{
	$('#achievement-hint').html(textToWrite);
	$('#achievement-hint').stop();
	$('#achievement-hint').animate({opacity: 0, marginTop: -20}, 0);
	$('#achievement-hint').animate({opacity: 1, marginTop: 0}, 200);
}

function RecaptchaKill(recaptchaResponse)
{
	var picToShow = '';
	
	if ($('#vic-deathword-text').val() == 'aq')
	{
		picToShow = '#succ-kill';
		$('#vic-deathword-text').val('');
	}
	else
		picToShow = '#fail-kill';
	
	$('#captcha-hint').animate({opacity: 0}, 200);

	var flipDegs = 0;
	var addDegs = 0;
	var rotMod = 5;
	$(picToShow).css( 'transform', 'rotateY(90deg)' );
	var toRot = '#recap-div';
	var paused = false;
	var rotIntr = setInterval(function(){
		if (!paused)
		{
			$(toRot).css( 'transform', 'rotateY('+(flipDegs+addDegs)+'deg)' );
			flipDegs+=rotMod;
			if (flipDegs == 90)
			{
				if (toRot == '#recap-div')
				{
					grecaptcha.reset();
					$('#recap-div').hide();
					$(picToShow).show();
					toRot = picToShow;
					addDegs = 180;
				}
				else
				{
					$('#recap-div').show();
					$(picToShow).hide();
					toRot = '#recap-div';
					addDegs = 0;
				}
			}
			if (flipDegs == 180)
			{
				rotMod = -5;
				paused = true;
				setTimeout(function(){paused = false;}, 3000);
			}
			if (flipDegs == 0)
			{
				clearInterval(rotIntr);
				$('#captcha-hint').animate({opacity: 1}, 200);
			}
		}
	}, 10);
}

function GET(link, callback)
{
	$.get(link, callback);
}

function POST(link, data, callback)
{
	$.post(link, data, callback);
}