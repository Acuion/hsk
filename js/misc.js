function FillWithLeadingZeros(num, len)
{
	var s = "00" + num;
	return s.substr(s.length-len);
}

function GET(link, callback)
{
	$.get(link, callback);
}

function POST(link, data, callback)
{
	$.post(link, data, callback);
}
