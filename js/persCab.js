var scorePerc;
var kills, score, rank, achievements;
var backgroundProgressCircle, foregroundProgressCircle;
var acHints = ['<div class="underlined">Кильки в бочке I</div>Пример ачивки', '<div class="underlined">Кильки в бочке II</div>Пример ачивки', '<div class="underlined">Кильки в бочке III</div>Пример ачивки', '<div class="underlined">Кильки в бочке VI</div>Пример ачивки', '<div class="underlined">Кильки в бочке V</div>Пример ачивки'];
var LKActive = false;

$(document).ready(function()
{
	var safdGen = function(i) {return function(){SelectAchievementForDescribe(i)}};
	for (var i = 1; i <= acHints.length; ++i)
	{
		var currSafd = safdGen(i);
		$('#ac' + i).on('click', currSafd);
		$('#ac' + i).on('mouseenter', currSafd);
	}
	SelectAchievementForDescribe(1);
	
	backgroundProgressCircle = new ProgressBar.Circle('#score-progress-bck', {
		color: '#4E4E4E',
		duration: 1500,
		easing: 'easeInOut',
		strokeWidth: 5
	});
	foregroundProgressCircle = new ProgressBar.Circle('#score-progress', {
		color: '#FFFFFF',
		duration: 2000,
		easing: 'easeInOut',
		strokeWidth: 5,
		step: function(state, bar){
			$('#progress-text').html('Твой результат лучше чем у ' + Math.round(bar.value() * 100) + '% игроков');
			if (scorePerc == 0)
			{
				$('#proc-score').html(FillWithLeadingZeros(Math.round(score)), 3);
				$('#proc-kills').html(FillWithLeadingZeros(Math.round(kills)), 3);
				$('#proc-rank').html(FillWithLeadingZeros(Math.round(rank)), 3);
			}
			else
			{
				$('#proc-score').html(FillWithLeadingZeros(Math.round(score * (bar.value() / scorePerc)), 3));
				$('#proc-kills').html(FillWithLeadingZeros(Math.round(kills * (bar.value() / scorePerc)), 3));
				$('#proc-rank').html(FillWithLeadingZeros(Math.round(rank * (bar.value() / scorePerc)), 3));
			}
		}
	});
});

function ToggleLK()
{
	LKActive = !LKActive;
	ToggleMainScreen();
	if (LKActive)
	{//активируем LK
		setTimeout(function(){$(".pers-logo").animate({opacity: 1}, 300); $('.pers-name-part').animate({opacity: 1}, 300); $("#lk-page").css('z-index', '1');}, 700);
		backgroundProgressCircle.animate(1);
		foregroundProgressCircle.animate(scorePerc);
		$("#progress-center").animate({opacity: 1}, 700);
		$("#words-right").css('display','inline-block');
		$("#words-right").animate({opacity: 1}, 700);
		$("#victim-left").css('display','inline-block');
		$("#victim-left").animate({opacity: 1}, 700);
	}
	else
	{
		$("#lk-page").css('z-index', '-1');
		$(".pers-logo").animate({opacity: 0}, 300);
		backgroundProgressCircle.animate(0);
		foregroundProgressCircle.animate(0);
		$("#progress-center").animate({opacity: 0}, 700);
		$("#words-right").animate({opacity: 0}, 700, function(){$("#words-right").hide();});
		$("#victim-left").animate({opacity: 0}, 700, function(){$("#victim-left").hide();});
		$('.pers-name-part').animate({opacity: 0}, 300);
	}
	RecalcBodyHeight();
}

var authing = false;
function LoginIntoLK()
{
	if (!LKActive)
	{
		//начало авторизации
		if (authing)
			return;
		authing = true;
		//TODO: loadbar
		VK.Auth.getLoginStatus(function(response)
		{
			if (response.session)
			{
				authing = false;
				//конец авторизации
				FillLK();
			} 
			else
			{
				VK.Auth.login(function(response)
				{
					authing = false;
					//конец авторизации
					if (response.session)
						FillLK();
				});	
			}
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
				ToggleRegister();
			return;
		}
		$('#victim-name').val(data['victim_name']);
		$('#victim-dep').val(data['victim_dep']);
		achievements = $.parseJSON(data['achievements']);//TODO: маркировка полученных ачивок

		kills = data['killed_count'];
		score = data['score'];
		var lowerRank = 0;//игроков хуже чем этот
		for (var i = 0; i < leaderboardData.length; ++i)
			if (leaderboardData[i]['anon_id'] == data['anon_id'])
			{
				rank = leaderboardData[i]['place'];
				while (i < leaderboardData.length && leaderboardData[i]['place'] == rank)
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

function SelectAchievementForDescribe(i)
{
	$('#achievement-hint').html(acHints[i - 1]);
	$('#achievement-hint').stop();
	$('#achievement-hint').animate({opacity: 0, marginTop: -20}, 0);
	$('#achievement-hint').animate({opacity: 1, marginTop: 0}, 200);
	for (var j = 1; j <= acHints.length; ++j)
		$('#ac' + j).removeClass('ach-selected');
	$('#ac' + i).addClass('ach-selected');
}

function RecaptchaCallbackKillRequest(recaptchaResponse)
{
	if ($('#vic-deathword-text').val().trim()=='')
	{
		grecaptcha.reset();
		return;
	}

	var tryToKill = function(result)
	{
		result = $.parseJSON(result);

		var picToShow = '';
		if (result['result'] == 'success')
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
	POST('/engine/profile.php', {recaptcha_response: recaptchaResponse, death_word: $('#vic-deathword-text').val()}, tryToKill);
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
