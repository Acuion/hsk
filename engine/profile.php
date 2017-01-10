<?php
	include 'oapi.php';
	include 'dbworks.php';//KillerTheGame - table
	include 'curl.php';
	include 'privatedata.php';

	$member = authOpenAPIMember();
	
	if($member !== FALSE)
	{ 
		if ($member['player'] === false)
		{
			echo '{"result": "not a player"}';
		}
		else
		{
			$userinfo = ($mysqli->query("SELECT * FROM KillerTheGame WHERE vk_id = '".$member['id']."'"));
			$userinfo = $userinfo->fetch_assoc();
			$victiminfo = ($mysqli->query("SELECT * FROM KillerTheGame WHERE vk_id = '".$userinfo['victim_vk_id']."'"));
			$victiminfo = $victiminfo->fetch_assoc();

			$userinfo['result'] = 'success';
			$userinfo['victim_name'] = $victiminfo['name'];
			$userinfo['victim_secret_word'] = $victiminfo['secret_word'];
			$userinfo['victim_dep'] = $victiminfo['dep'];

			if ($_POST['death_word'])
			{
				$recap = curl_POST('https://www.google.com/recaptcha/api/siteverify', 'secret='.$recaptchaSecret.'&response='.$_POST['recaptcha_response'], '');
				$recap = json_decode($recap);
				if ($recap->success === true && trim(strtolower($_POST['death_word'])) === $victiminfo['death_word'])
				{
					$killled_list = json_decode($userinfo['killed_list']);
					$killled_list[] =  $userinfo['victim_vk_id'];
					$killled_list = json_encode($killled_list);
					$mysqli->query("UPDATE KillerTheGame SET alive=0 WHERE vk_id = '".$userinfo['victim_vk_id']."'");
					$mysqli->query("UPDATE KillerTheGame SET killed_count=".($userinfo['killed_count'] + 1)." WHERE vk_id = '".$member['id']."'");//TODO: as json
					$mysqli->query("UPDATE KillerTheGame SET killed_list='$killled_list' WHERE vk_id = '".$member['id']."'");
					$mysqli->query("UPDATE KillerTheGame SET victim_vk_id='".$victiminfo['victim_vk_id']."' WHERE vk_id = '".$member['id']."'");
					echo '{"result": "success"}';
				}
				else
					echo '{"result": "wrong secret word"}';
			}
			else
				echo json_encode($userinfo);
		}
	}
	else
	{ 
		echo '{"result": "no auth"}';
	}
?>