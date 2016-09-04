<?php
	include 'dbworks.php';//KillerTheGame - table

	$tojson = array();
	$query = mysql_query("SELECT anon_id, score, killed_count, alive FROM KillerTheGame ORDER BY killed_count DESC");
	while($result = mysql_fetch_assoc($query))
		$tojson[] = $result;
	if ($_GET['count'])
		echo count($tojson);
	else
		echo json_encode($tojson);
?>