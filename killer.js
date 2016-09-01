var currDispMode = -1;//0-mob,1-desk

var secs = 420000;
var rotAngle = 0;
var rotInterval;

window.onresize = function()
{
	if (window.innerWidth >= 1107)
		currDispMode = 1;
	else
		currDispMode = 0;
	if (MainShown)
		ForcedMainFade();
};

$(document).ready(function(){
	if (window.innerWidth >= 1107)
		currDispMode = 1;
	else
		currDispMode = 0;

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
	
	$('#ac1').on('mouseenter', function(){WriteAchievementHint('<div class="underlined">Кильки в бочке I</div>Пример ачивки');});
	$('#ac1').on('mouseleave', ClearAchievementHint);
	$('#ac2').on('mouseenter', function(){WriteAchievementHint('<div class="underlined">Кильки в бочке II</div>Пример ачивки');});
	$('#ac2').on('mouseleave', ClearAchievementHint);
	$('#ac3').on('mouseenter', function(){WriteAchievementHint('<div class="underlined">Кильки в бочке III</div>Пример ачивки');});
	$('#ac3').on('mouseleave', ClearAchievementHint);
	$('#ac4').on('mouseenter', function(){WriteAchievementHint('<div class="underlined">Кильки в бочке VI</div>Пример ачивки');});
	$('#ac4').on('mouseleave', ClearAchievementHint);
	$('#ac5').on('mouseenter', function(){WriteAchievementHint('<div class="underlined">Кильки в бочке V</div>Пример ачивки');});
	$('#ac5').on('mouseleave', ClearAchievementHint);

	FlipWordInit('#deathword', 'azaza');
	FlipWordInit('#secretword', 'ururu');
	FlipWordInit('#vic-secword', 'Уран');
	
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
			$('#proc-score').html(pad(Math.round(score * (bar.value() / scorePerc)), 3));
			$('#proc-kills').html(pad(Math.round(kills * (bar.value() / scorePerc)), 3));
			$('#proc-rank').html(pad(Math.round(rank * (bar.value() / scorePerc)), 3));
		}
	});
});

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
			$("#leader-left").animate({opacity: 0, left: -100}, 700);
			$("#news-right").animate({opacity: 0, right: -100}, 700);
		}
		else
		{
			$("#leader-left").animate({opacity: 0, top: -100, height: 78}, 700);
			$("#news-right").animate({opacity: 0, bottom: -100}, 700);
		}
	}
	else
	{
		if (currDispMode == 1)
		{
			$("#leader-left").animate({opacity: 1, left: 0}, 700);
			$("#news-right").animate({opacity: 1, right: 0}, 700);
		}
		else
		{
			$("#leader-left").animate({opacity: 1, top: 0, height: 300}, 700);
			$("#news-right").animate({opacity: 1, bottom: 0}, 700);
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

var LKActive = false;
var scorePerc = 0.72;
var kills = 13, score = 57, rank = 42;
var bck2, scoreProgress;
function ToggleLK()
{
	LKActive = !LKActive;
	ToggleMainScreen();
	if (LKActive)
	{//активируем LK
		setTimeout(function(){$(".pers-logo").animate({opacity: 1}, 300); $('.pers-name-part').animate({opacity: 1}, 300); $("#lk-page").css('z-index', '0');}, 700);
		bck2.animate(1);
		scoreProgress.animate(scorePerc);
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
		bck2.animate(0);
		scoreProgress.animate(0);
		$("#progress-center").animate({opacity: 0}, 700);
		$("#words-right").animate({opacity: 0}, 700, function(){$("#words-right").hide();});
		$("#victim-left").animate({opacity: 0}, 700, function(){$("#victim-left").hide();});
		$('.pers-name-part').animate({opacity: 0}, 300);
	}
}

var MainFaded = false;
function ToogleMainFade()
{
	if (MainFaded)//TODO: ресайз после анимации в одну сторону, учесть
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
	$("*").finish();
	$("#enter-hint").css('opacity', '1');

	$("#timer-div").css('opacity', '1');
	$("#backg-timer").css('opacity', '1');
	$("#about-game").css('opacity', '1');
	$("#about-game").css('pointer-events', 'auto');
		
	$("#logo").css('opacity', '1');
	$("#inside-logo").css('opacity', '1');
	$("#inside-logo").css( 'pointer-events', 'auto' );
	
	$("#leader-left").css( 'pointer-events', 'auto' );
	$("#news-right").css( 'pointer-events', 'auto' );

	$("#leader-left").css('opacity', '1');
	$("#news-right").css('opacity', '1');
	$("#leader-left").css('left', '0');
	$("#news-right").css('right', '0');
	$("#leader-left").css('top', '0');
	$("#news-right").css('bottom', '0');

	//...
	if (!MainFaded)
		return;
	$("#enter-hint").css('opacity', '0');

	$("#timer-div").css('opacity', '0.6');
	$("#backg-timer").css('opacity', '0.6');
	
	$("#about-game").css('opacity', '0');
	$("#about-game").css( 'pointer-events', 'none' );
	
	$("#logo").css('opacity', '0.1');
	$("#inside-logo").css('opacity', '0.1');
	$("#inside-logo").css( 'pointer-events', 'none' );

	$("#leader-left").css( 'pointer-events', 'none' );
	$("#news-right").css( 'pointer-events', 'none' );

	$("#leader-left").css('opacity', '0.2');
	$("#news-right").css('opacity', '0.2');

	if (currDispMode == 1)
	{
		$("#leader-left").css('left', '-30');
		$("#news-right").css('right', '-30');
	}
	else
	{
		$("#leader-left").css('top', '-30');
		$("#news-right").css('bottom', '-30');
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
	$("#reg-1").val($("#reg-1").val().trim());
	$("#reg-2").val($("#reg-2").val().trim());
	$("#reg-3").val($("#reg-3").val().trim());
	
	var fieldsOk = true;
	if ($("#reg-1").val() == '')
	{
		$("#reg-1").animate({width: 300}, 300, function(){$("#reg-1").animate({width: 250}, 300);});
		fieldsOk = false;
	}
	if ($("#reg-2").val() == '')
	{
		$("#reg-2").animate({width: 300}, 300, function(){$("#reg-2").animate({width: 250}, 300);});
		fieldsOk = false;
	}
	if ($("#reg-3").val() == '')
	{
		$("#reg-3").animate({width: 300}, 300, function(){$("#reg-3").animate({width: 250}, 300);});
		fieldsOk = false;
	}
	
	if (!fieldsOk)
		return;
	
	if ($("#reg-3").val() == 'aq')
	{
		FlipRegisterLabel('ПСЕВДОНИМ ЗАНЯТ', 'red', true);
		return;
	}
	
	FlipRegisterLabel('УСПЕШНАЯ РЕГИСТРАЦИЯ', 'green', true);
	$("#reg-1").val('');
	$("#reg-2").val('');
	$("#reg-3").val('');
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
	
	$(wordId).on('mouseenter', function(){FlipWordAndReplaceWith(wordId + '-text', wordText);});
	$(wordId).on('mouseleave', function(){FlipWordAndReplaceWith(wordId + '-text','[наведи, чтобы увидеть]');});
}

function WriteAchievementHint(textToWrite)
{
	$('#achievement-hint').html(textToWrite);
	$('#achievement-hint').stop();
	$('#achievement-hint').animate({opacity: 1, marginTop: 0}, 200);
}

function ClearAchievementHint()
{
	$('#achievement-hint').stop();
	$('#achievement-hint').css({opacity: 0, marginTop: -10}, 0);
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
			}
		}
	}, 10);
}