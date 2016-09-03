<?php
	//error_reporting(E_ERROR);
	
	include 'oapi.php';
	include 'dbworks.php';//KillerTheGame - table

	$result = mysql_query("SELECT * FROM KillerTheGame ORDER BY killed_count DESC");
	echo(json_encode(mysql_fetch_assoc($result)));
?>