<?php
	include 'dbworks.php';//KillerTheGame - table
	include 'oapi.php';
	include 'curl.php';
	
	$member = authOpenAPIMember();
	$lmsl = mysql_escape_string(trim(strtolower($_POST['lmslogin'])));
	$lmsp = $_POST['lmspassw'];
	$anonid = mysql_escape_string($_POST['anonid']);
	
	if ($lmsl && $lmsp && $anonid && $member !== false)
	{
		$vkid = $member['id'];
		$playerinfo = mysql_num_rows(mysql_query("SELECT * FROM KillerTheGame WHERE lms_login = '$lmsl'"));
		
		if ($member['player'] || $playerinfo !== 0)
		{
			echo '{"result": "УЖЕ ЗАРЕГИСТРИРОВАН"}';
		}
		else
		{
			$loginAns = curl_POST("http://lms.hse.ru/index.php?index_page","_qf__login_form=&user_login=$lmsl&user_password=$lmsp&userLogin=%D0%92%D0%BE%D0%B9%D1%82%D0%B8",$member['id']);
			$toProc = curl_GET('http://lms.hse.ru/student.php?ctg=personal&op=account', $member['id']);
			if (strpos($toProc, 'Группа пользователей') !== false)
			{
				$dep = MySubstring($toProc, 'Группа пользователей', true);
				$dep = MySubstring(MySubstring($dep, 'value="', true), '"', false);
				if ($dep === 'Н НН БИиПМ 15 ПИ')
				{
					$anontaken = mysql_num_rows(mysql_query("SELECT * FROM KillerTheGame WHERE anon_id = '$anonid'"));
					if ($anontaken === 0)
					{
						$sword = mysql_fetch_assoc(mysql_query("SELECT Word FROM Words WHERE Used = 0 ORDER BY Rand()"));
						$sword = $sword['Word'];
						mysql_query("UPDATE Words SET Used = 1 WHERE Word = '".$sword."'");
						
						$alpG = array('у','е','ы','а','о','э','я','и','ю');
						$alpS = array('й','ц','к','н','ш','щ','з','х','ф','в','п','р','л','д','ж','ч','с','м','т','б');
						
						srand(floor(time() * 0.73));
						$dword = $alpG[rand(0,8)].$alpS[rand(0,19)].$alpG[rand(0,8)].$alpS[rand(0,19)].$alpG[rand(0,8)];
						
						$fname = MySubstring(MySubstring($toProc, 'name="surname" type="text" value="', true), '"', false);
						$sname = MySubstring(MySubstring($toProc, 'name="name" type="text" value="', true), '"', false);
						$oname = MySubstring(MySubstring($toProc, 'name="second_name" type="text" value="', true), '"', false);
						$name = $fname.' '.$sname.' '.$oname;

						mysql_query("INSERT INTO KillerTheGame values('$lmsl', '$dep', '$vkid', '$name', '$dword', '$sword', '', 0, 0, '', '$anonid', '', 1)");
						
						echo '{"result": "УСПЕШНАЯ РЕГИСТРАЦИЯ"}';
					}
					else
					{
						echo '{"result": "ПСЕВДОНИМ ЗАНЯТ"}';
					}
				}
				else
				{
					echo '{"result": "РЕГИСТРАЦИЯ НЕВОЗМОЖНА"}';
				}
			}
			else
			{
				echo '{"result": "НЕВЕРНЫЕ ДАННЫЕ LMS"}';
			}
			curl_CookieReset($member['id']);
		}
	}
	
	function MySubstring($string, $tofind, $after)
	{
		if ($after)
			return substr($string, strpos($string, $tofind) + strlen($tofind));
		else
			return substr($string, 0, strpos($string, $tofind));
	}	
?>