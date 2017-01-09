<?php
	include 'dbworks.php';

	$tojson = array();
	$query = $mysqli->query("SELECT anon_id, score, killed_count, alive FROM KillerTheGame ORDER BY killed_count DESC");
	while($result = $query->fetch_assoc())
		$tojson[] = $result;
	if ($_GET['count'])
		echo count($tojson);
	else
		echo json_encode($tojson);
?>