var loadingMarker;
var loadingMarkerAnimationCurrConst;
var loadingMarkerAnimationTimeout, loadingMarkerRecreationTimeout;

$(document).ready(function()
{
	loadingMarker = new ProgressBar.Circle('#loading-bar', {
		color: '#FFFFFF',
		duration: 7000,
		easing: 'easeInOut',
		strokeWidth: 1
	});
    loadingMarker.set(1);
});

function RecreateLoadbarWithSpeed(speed)
{
    var currVal = loadingMarker.value();
    loadingMarker.destroy();
	loadingMarker = new ProgressBar.Circle('#loading-bar', {
		color: '#FFFFFF',
		duration: speed,
		easing: 'easeInOut',
		strokeWidth: 1
	});
    loadingMarker.set(currVal);
}

var loaderEvenStep = false;
function LoadbarAnimateStep()
{
    //TODO: Раскрутка
    loadingMarker.animate(loadingMarkerAnimationCurrConst);
    loadingMarkerAnimationTimeout = setTimeout(LoadbarAnimateStep, 6500);
    loadingMarkerAnimationCurrConst++;
    loaderEvenStep = !loaderEvenStep;
}

function EnableLoadbar()
{
    clearTimeout(loadingMarkerAnimationTimeout);
    loadingMarker.animate(2);
    loadingMarkerAnimationCurrConst = 3;
    loadingMarkerAnimationTimeout = setTimeout(LoadbarAnimateStep, 6500);
}

function DisableLoadbar()
{
    clearTimeout(loadingMarkerAnimationTimeout);

    RecreateLoadbarWithSpeed(700);
    loadingMarker.animate(1);

    clearTimeout(loadingMarkerRecreationTimeout);
    loadingMarkerRecreationTimeout = setTimeout(function (){
        RecreateLoadbarWithSpeed(7000);
        }, 700);
}