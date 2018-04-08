var currDispMode = -1;//0-mob,1-desk

var secondsLeftTimer = 420000;
var logoRotationStep = 0, logoRotationDelta = 0.1;
var logoRotationInterval;
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
	$('body').height(Math.max(730, window.innerHeight, $('#hello-page').offset().top + $('#hello-page').height()));
}

window.onresize = ResizeEventHandler;
function ResizeEventHandler()
{
	if (window.innerWidth >= 1107)
	{
		currDispMode = 1;
	}
	else
	{//mob
		currDispMode = 0;
	}
	$("*").finish();
	RecalcBodyHeight();
	$('#viewport').attr('content', 'width=device-width, user-scalable=0');
	if ($(window).width() < 400)
		$('#viewport').attr('content', 'width=400, user-scalable=0');
}

//инициализация
$(document).ready(function()
{
	$('img').on('dragstart', function(event) { event.preventDefault(); });

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

	ResizeEventHandler();
});
