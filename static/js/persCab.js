var scorePerc;
var kills, score, rank, achievements;
var backgroundProgressCircle, foregroundProgressCircle;
var acHints = ['<div class="underlined">Снимаю шляпу</div>Совершить первое раскрытие за всю игру', '<div class="underlined">Цепная реакция</div>Совершить два раскрытия в течение 24 часов', '<div class="underlined">Рокировка</div>Раскрыть игрока имеющего большее количество раскрытий', '<div class="underlined">Достижение IV</div>Здесь будет описание', '<div class="underlined">Достижение V</div>Здесь будет описание'];
var LKActive = false;
var victims, currentVictimId;

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
	
	$('.list-arrow').on('click', function(){
		$(this).animate({marginTop: 3}, 200, function(){$(this).animate({marginTop: 0}, 200);});
	});

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
		EnableLoadbar();
		
		VK.Auth.login(function(response)
		{
			if (response.session)
				FillLK();
			else
			{
				authing = false;//конец авторизации
				DisableLoadbar();
			}
		});	
	}
	else
		ToggleLK();
}

function FillVictim(id)
{
	currentVictimId = id;
	$('#victim-name').val(victims[id]['showing_name']);
	$('#victim-dep').val(victims[id]['showing_dep']);
	$('#victim-counter').text((currentVictimId + 1) + '/' + victims.length);
	FlipWordInit('#vic-secword', victims[id]['showing_secret_word']);
}

function NextVictim()
{
	if ($('#vic-secword-text').text() != '[нажми, чтобы увидеть]' && $('#vic-secword-text').val() != '[нажми, чтобы увидеть]')
		$('#vic-secword').click();
	FillVictim((currentVictimId + 1) % victims.length);
}

function PrevVictim()
{
	if ($('#vic-secword-text').text() != '[нажми, чтобы увидеть]' && $('#vic-secword-text').val() != '[нажми, чтобы увидеть]')
		$('#vic-secword').click();
	FillVictim((currentVictimId + victims.length - 1) % victims.length);
}

function MarkAchievements()
{
	//TODO: маркировка полученных ачивок
}

function ReloadLKData()
{
	var stage2 = function (data)
	{
		data = $.parseJSON(data);
		if (data['result'] != 'success')
			return;
		victims = data['victims_showed'];
		achievements = data['achievements'];
		MarkAchievements();

		kills = data['killed_count'];
		score = data['score'];

		UpdateLeaderboard(function()
		{
			var lowerRank = 0;//игроков хуже чем этот
			for (var i = 0; i < leaderboardData.length; ++i)
				if (leaderboardData[i]['anon_id'] == data['anon_id'])
				{
					rank = leaderboardData[i]['place'];
					lowerRank = 0;
					for (var j = 0; j < leaderboardData.length; ++j)
						if (leaderboardData[j]['score'] < leaderboardData[i]['score'])
							lowerRank++;
					break;
				}

			scorePerc =  lowerRank / (leaderboardData.length - 1);
			FillVictim(victims.length - 1);
			foregroundProgressCircle.animate(scorePerc);
		});
	} 
	GET('/engine/profile', stage2)
}

function FillLK()
{
	var stage2 = function (data)
	{
		data = $.parseJSON(data);
		if (data['result'] != 'success')
		{
			authing = false;
			DisableLoadbar();
			if (data['result'] == 'not a player')
				ToggleRegister();
			return;
		}
		victims = data['victims_showed'];
		achievements = data['achievements'];
		MarkAchievements();

		kills = data['killed_count'];
		score = data['score'];
		UpdateLeaderboard(function()
		{
			var lowerRank = 0;//игроков хуже чем этот
			for (var i = 0; i < leaderboardData.length; ++i)
				if (leaderboardData[i]['anon_id'] == data['anon_id'])
				{
					rank = leaderboardData[i]['place'];
					lowerRank = 0;
					for (var j = 0; j < leaderboardData.length; ++j)
						if (leaderboardData[j]['score'] < leaderboardData[i]['score'])
							lowerRank++;
					break;
				}

			if (leaderboardData.length == 1)
				scorePerc = 0;
			else
				scorePerc =  lowerRank / (leaderboardData.length - 1);

			FlipWordInit('#deathword', data['death_word']);
			FlipWordInit('#secretword', data['secret_word']);
			FillVictim(0);

			if (gameStatus == 'finished')
			{
				$('#vic-deathword-text').css('pointer-events', 'none');
				$('#recap-div').css('pointer-events', 'none');
				$('#recap-div').css('opacity', '0.2');
				$('#captcha-hint').hide();
				$('#watch-ended').html('Игра окончена<br><span class="font15px" id="simple-ended">до новых встреч!</span>');
				$('#watch-ended').show();
			}
			else
			if (!data['alive'])
			{
				$('#vic-deathword-text').css('pointer-events', 'none');
				$('#recap-div').css('pointer-events', 'none');
				$('#recap-div').css('opacity', '0.2');
				$('#captcha-hint').hide();
				$('#watch-ended').show();
			}

			var namepieces = data['name'].split(' ');
			$('#pers-name-part-left').text(namepieces[0] + ' ' + namepieces[1]);
			$('#pers-name-part-right').text(data['anon_id']);

			authing = false;
			DisableLoadbar();
			ToggleLK();
		});
	}
	GET('/engine/profile', stage2);
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
			ReloadLKData();
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

	POST('/engine/profile', {recaptcha_response: recaptchaResponse, death_word: $('#vic-deathword-text').val(), victim_id: currentVictimId}, tryToKill);
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
	
	$(wordId).off('click');
	$(wordId).on('click', function(){
		if ($(wordId + '-text').text() == '[нажми, чтобы увидеть]' || $(wordId + '-text').val() == '[нажми, чтобы увидеть]')
			FlipWordAndReplaceWith(wordId + '-text', wordText);
		else
			FlipWordAndReplaceWith(wordId + '-text','[нажми, чтобы увидеть]');
	});
}
