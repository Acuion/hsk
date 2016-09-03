<?php
include 'dbworks.php';//KillerTheGame - table

function authOpenAPIMember()
{ //vk copypaste
  include 'privatedata.php';

  $session = array(); 
  $member = FALSE; 
  $valid_keys = array('expire', 'mid', 'secret', 'sid', 'sig'); 
  $app_cookie = $_COOKIE['vk_app_5170996']; //app id
  if ($app_cookie) { 
    $session_data = explode ('&', $app_cookie, 10); 
    foreach ($session_data as $pair) { 
      list($key, $value) = explode('=', $pair, 2); 
      if (empty($key) || empty($value) || !in_array($key, $valid_keys)) { 
        continue; 
      } 
      $session[$key] = $value; 
    } 
    foreach ($valid_keys as $key) { 
      if (!isset($session[$key])) return $member; 
    } 
    ksort($session); 

	  $sign = ''; 
    foreach ($session as $key => $value) { 
      if ($key != 'sig') { 
        $sign .= ($key.'='.$value); 
      } 
    } 
    $sign .= $vksecretkey; //sc key
    $sign = md5($sign);

	  //mine
	  $playerinfo = mysql_num_rows(mysql_query("SELECT * FROM KillerTheGame WHERE vk_id = '".$session['mid']."'"));
	  if ($session['sig'] == $sign && $session['expire'] > time()) { 
      $member = array( 
        'id' => intval($session['mid']), 
        'secret' => $session['secret'], 
        'sid' => $session['sid'],
		    'player' => (($playerinfo === false || $playerinfo === 0) ? false : true)
      ); 
    } 
  }
  
  return $member; 
} 
?>