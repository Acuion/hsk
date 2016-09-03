<?php
function curl_CookieReset($cookiename)
{
	unlink($cookiename);
}
function curl_GET($url, $cookiename)
{
	$curl = curl_init(); 
	curl_setopt($curl, CURLOPT_URL, $url); 
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($curl, CURLOPT_COOKIEJAR, $cookiename);
	curl_setopt($curl, CURLOPT_COOKIEFILE, $cookiename);
	$output = curl_exec($curl); 
	curl_close($curl); 
	return $output; 	
}
function curl_POST($url, $data, $cookiename)
{
	$curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
	curl_setopt($curl, CURLOPT_COOKIEJAR, $cookiename);
	curl_setopt($curl, CURLOPT_COOKIEFILE, $cookiename);
    $output = curl_exec($curl);
    curl_close($curl);
	return $output;
}
?>