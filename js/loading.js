var loadingMarker;
var loadingMakerAnimationCurrConst;
var loadingMarkerAnimationTimeout, loadingMarkerRecreationTimeout;

$(document).ready(function()
{
	loadingMarker = new ProgressBar.Circle('#loading-bar', {
		color: '#FFFFFF',
		duration: 4000,
		easing: 'easeInOut',
		strokeWidth: 1
	});
    loadingMarker.set(1);
});

function LoadbarAnimateStep()
{
    loadingMarker.animate(loadingMakerAnimationCurrConst);
    loadingMakerAnimationCurrConst *= -1;
    loadingMarkerAnimationTimeout = setTimeout(LoadbarAnimateStep, 3500);
}

function EnableLoadbar()
{
    clearTimeout(loadingMarkerAnimationTimeout);
    loadingMarker.animate(-1);
    loadingMakerAnimationCurrConst = 1;
    loadingMarkerAnimationTimeout = setTimeout(LoadbarAnimateStep, 3500);
}

function DisableLoadbar()
{
    clearTimeout(loadingMarkerAnimationTimeout);

    var currVal = loadingMarker.value();
    loadingMarker.destroy();
    loadingMarker = new ProgressBar.Circle('#loading-bar', {
        color: '#FFFFFF',
        duration: 700,
        easing: 'easeInOut',
        strokeWidth: 1
    });
    loadingMarker.set(currVal);
    loadingMarker.animate(1);

    clearTimeout(loadingMarkerRecreationTimeout);
    loadingMarkerRecreationTimeout = setTimeout(function (){
        loadingMarker.destroy();
        loadingMarker = new ProgressBar.Circle('#loading-bar', {
            color: '#FFFFFF',
            duration: 4000,
            easing: 'easeInOut',
            strokeWidth: 1
        });
        loadingMarker.set(1);
        }, 700);
}