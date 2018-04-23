var currDispMode = -1;//0-mob,1-desk

var secondsLeftTimer = 420000;
var logoRotationStep = 0, logoRotationDelta = 0.1;
var logoRotationInterval;
var leaderboardData;
var loggedInVk = false;
//таймер
function TimerUpdate()
{
	if (secondsLeftTimer <= 0)
		return;
	var days = FillWithLeadingZeros(Math.floor(secondsLeftTimer / 60 / 60 / 24), 2).toString();
	var hours = FillWithLeadingZeros(Math.floor(secondsLeftTimer / 60 / 60) % 24, 2).toString();
	var minutes = FillWithLeadingZeros(Math.floor(secondsLeftTimer / 60) % 60, 2).toString();
	var seconds = FillWithLeadingZeros(secondsLeftTimer % 60, 2).toString();
	$('#timer').text(days+':'+hours+':'+minutes+':'+seconds);
	secondsLeftTimer--;
}

//работа с окном
function RecalcBodyHeight()
{
	$('body').height(Math.max(730, window.innerHeight, $('#hello-page').offset().top + $('#hello-page').height(), $('#lk-page').offset().top + $('#lk-page').height()));
}

window.onresize = ResizeEventHandler;
function ResizeEventHandler()
{
	if (window.innerWidth >= 1107)
	{
		$('#caphint-text').text('Попытки раскрытия доступны не чаще, чем раз в минуту');
		$('#captcha-hint-pic').addClass('flip-vertical');
		currDispMode = 1;
	}
	else
	{//mob
		$('#caphint-text').text('Раз в минуту');
		$('#captcha-hint-pic').removeClass('flip-vertical');
		currDispMode = 0;
	}
	$("*").finish();
	ForcedMainFade();
	ForcedMainScreen();
	RecalcBodyHeight();
	$('#viewport').attr('content', 'width=device-width, user-scalable=0');
	if ($(window).width() < 400)
		$('#viewport').attr('content', 'width=400, user-scalable=0');
}

function UpdateLeaderboard(thencallback)
{
	var update = function(data)
	{
		leaderboardData = $.parseJSON(data);
		var lastPlace = 0;
		var lastScore = -1;
		var toAdd = 0;
		$('#leaderboard-table').empty();
		for (var i = 0; i < leaderboardData.length; ++i)
		{
			if (lastScore != leaderboardData[i]['score'])
			{
				lastScore = leaderboardData[i]['score'];
				lastPlace = lastPlace + toAdd + 1;
				toAdd = 0;
			}
			else
				toAdd++;
			leaderboardData[i]['place'] = lastPlace;
			var lbRow = '<tr><td width="30px">' + lastPlace + '</td>';
			lbRow += '<td width="133px">'+ (!leaderboardData[i]['alive'] ? '<img title="Раскрыт" src="static/images/jailed.png"> ' : '') + leaderboardData[i]['anon_id'] + '</td>';
			lbRow += '<td width="64px">' + leaderboardData[i]['score'] + '</td>';
			var achImgs = '';
			if (leaderboardData[i]['achievements'].includes(1))
				achImgs += '<img title="Снимаю шляпу" src="static/images/achievement_hat.png" width=21 height=21/>';
			if (leaderboardData[i]['achievements'].includes(2))
				achImgs += '<img title="Цепная реакция" src="static/images/achievement_chain.png" width=21 height=21/>';
			if (leaderboardData[i]['achievements'].includes(3))
				achImgs += '<img title="Рокировка" src="static/images/achievement_rock.png" width=21 height=21/>';
			lbRow += '<td width="93px">' + achImgs + '</td></tr>';
			$('#leaderboard-table').append(lbRow);
		}
		thencallback();
	}
	GET('/engine/leaderboard', update);
};

function CheckVkSession()
{
	VK.Auth.getLoginStatus(function(response)
	{
		if (response.session)
		{
			loggedInVk = true;
		}
		else
		{
			loggedInVk = false;
		}
	});
}

//инициализация
$(document).ready(function()
{
	$('img').on('dragstart', function(event) { event.preventDefault(); });
	VK.init({apiId: 5170996});

	CheckVkSession();
	setInterval(CheckVkSession, 1000 * 60 * 3);

	$('#inside-logo').hover(function(){
		clearInterval(logoRotationInterval);
		logoRotationInterval = setInterval(function(){$('#logo').rotate(logoRotationStep -= logoRotationDelta);}, 30);
	}, function(){
		clearInterval(logoRotationInterval);
		logoRotationInterval = setInterval(function(){$('#logo').rotate(logoRotationStep += logoRotationDelta);}, 60);
	});
	TimerUpdate();
	setInterval(TimerUpdate, 1000);
	logoRotationInterval = setInterval(function(){$('#logo').rotate(logoRotationStep += logoRotationDelta);}, 60);
	
	$('#reg-1').focusin(function(){$('#reg-hint-1').animate({opacity: 1, right: -165}, 300);});
	$('#reg-1').focusout(function(){$('#reg-hint-1').animate({opacity: 0, right: -175}, 300);});
	$('#reg-1').keypress(function(event) {if (event.keyCode == 13) $('#reg-2').focus(); });
	
	$('#reg-2').focusin(function(){$('#reg-hint-2').animate({opacity: 1, left: -120}, 300);});
	$('#reg-2').focusout(function(){$('#reg-hint-2').animate({opacity: 0, left: -130}, 300);});
	$('#reg-2').keypress(function(event) {if (event.keyCode == 13) $('#reg-3').focus(); });
	
	$('#reg-3').focusin(function(){$('#reg-hint-3').animate({opacity: 1, right: -185}, 300);});
	$('#reg-3').focusout(function(){$('#reg-hint-3').animate({opacity: 0, right: -195}, 300);});
	$('#reg-3').keypress(function(event) {if (event.keyCode == 13) Register(); });
	
	$('#reg-1').on('input', OnRegChange);
	$('#reg-2').on('input', OnRegChange);
	$('#reg-3').on('input', OnRegChange);

	ResizeEventHandler();

	if (gameStatus != 'register')
	{
		$('#reglink').css('text-decoration', 'line-through');
		$('#reglink').css('opacity', '0.8');
	}

	UpdateLeaderboard(function(){});
});

//главный экран
var mainShown = true;
function ToggleMainScreen()
{
	if (mainShown)
	{
		$("#enter-hint").animate({opacity: 0}, 300);
		$("#about-game").animate({opacity: 0}, 400);
		$("#about-game").css( 'pointer-events', 'none' );
		
		$("#timer-div").animate({marginTop: -210, opacity: 0}, 1000);
		$("#backg-timer").animate({marginTop: -170, opacity: 0}, 1000);
		
		$("#inside-logo").css( 'pointer-events', 'none' );
		$("#logo").animate({width: 140}, 1000, function(){if (!mainShown) $("#return-hint").animate({opacity: 1}, 300);});
		$("#loading-bar").animate({width: 140, height: 140}, 1000);
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
		
		$("#logo").animate({width: 282}, 1000, function(){if (mainShown) $("#enter-hint").animate({opacity: 1}, 300);});
		$("#loading-bar").animate({width: 280, height: 280}, 1000);

		$("#inside-logo").css( 'pointer-events', 'none' );
		$("#inside-logo").animate({width: 141, marginTop: 85}, 1000, function(){$("#inside-logo").css( 'pointer-events', 'auto' );});
		
		$("#return-hint").animate({opacity: 0}, 300, function(){$("#about-game").animate({opacity: 1}, 400); $("#about-game").css( 'pointer-events', 'auto' );});
	}
	mainShown = !mainShown;
}
function ForcedMainScreen()
{
	$("#leader-left").animate({left: 0, top: 0, height: 300}, 0);
	$("#news-right").animate({right: 0, bottom: 0}, 0);

	if (mainShown)
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

var mainFaded = false;
function ToogleMainFade()
{
	if (mainFaded)
	{
		$("#enter-hint").animate({opacity: 1}, 400);

		$("#timer-div").animate({opacity: 1}, 1000);
		$("#backg-timer").animate({opacity: 1}, 1000);
		$("#about-game").animate({opacity: 1}, 1000);
		$("#about-game").css( 'pointer-events', 'auto' );
			
		$("#logo").animate({opacity: 1}, 1000);
		$("#loading-bar").animate({opacity: 1}, 1000);
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
		$("#loading-bar").animate({opacity: 0.1}, 700);
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
	mainFaded = !mainFaded;
}
function ForcedMainFade()
{
	$("#leader-left").animate({left: 0, top: 0}, 0);
	$("#news-right").animate({right: 0, bottom: 0}, 0);

	//...
	if (!mainFaded)
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

//правила
var rulesShown = false;
function ToggleRules()
{
	if (!mainShown)
		return;
	ToogleMainFade();
	if (rulesShown)
	{
		$("#back-from-rules").hide();
		$("#rules-wrapper").animate({height: 0, opacity: 0}, 1000);
	}
	else
	{
		$("#rules-wrapper").animate({height: 340, opacity: 1}, 1000, function(){$("#back-from-rules").show();});
	}
	rulesShown = !rulesShown;
}

//регистрация
var registerShown = false;
function ToggleRegister()
{
	if (gameStatus != 'register')
		return;
	if (!mainShown)
		return;
	if (registerShown)
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
		$('#reg-1').focus();
	}
	registerShown = !registerShown;
}

var finalRegisterHintShown = false;
function OnRegChange()
{
	if (!finalRegisterHintShown && $("#reg-1").val() != '' && $("#reg-2").val() != '' && $("#reg-3").val() != '')
	{
		$('#reg-hint-4').animate({opacity: 1}, 300);
		finalRegisterHintShown = true;
	}
}

var registring = false;
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
	
	if (!fieldsOk || registring)
		return;

	registring = true;
	EnableLoadbar();

	var registerResult = function (result)
	{
		result = $.parseJSON(result);
		switch (result['result'])
		{
			case 'УСПЕШНАЯ РЕГИСТРАЦИЯ':
				UpdateLeaderboard(function()
				{
					$("#reg-1").val('');
					$("#reg-2").val('');
					$("#reg-3").val('');
					FlipRegisterLabel(result['result'], 'green', true);
					setTimeout(function()
					{
						ToggleRegister();
						setTimeout(function()
						{
							LoginIntoLK();
						}, 1100);
					}, 1000);
				});
			break;
			default:
				FlipRegisterLabel(result['result'], 'red', true);
			break;
		}
		registring = false;
		DisableLoadbar();
	};

	var startRegister = function(){POST('/engine/regvialms', {lmslogin: login, lmspassw: password, anonid: anon_id}, registerResult);};

	if (loggedInVk)
		startRegister();
	else
		VK.Auth.login(function(response)
		{
			if (response.session)
			{
				startRegister();
				loggedInVk = true;
			}
			else
			{
				registring = false;
				DisableLoadbar();
			}
		});	
}

var flipRegisterForwardInterval, flipRegisterBackwardInterval;
function FlipRegisterLabel(newText, bkgColor, first)
{
	clearInterval(flipRegisterForwardInterval);
	clearTimeout(flipRegisterBackwardInterval);
	flipDegs = 0;
	flipRegisterForwardInterval = setInterval(function(){
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
				flipRegisterBackwardInterval = setTimeout("FlipRegisterLabel('РЕГИСТРАЦИЯ НА ИГРУ', 'transparent', false)", 2000);
			clearInterval(flipRegisterForwardInterval);
		}
	}, 10);
}
