<?php
	include 'dbworks.php';

	$tojson = array();
	$query = $mysqli->query('SELECT anon_id, score, killed_count, alive FROM KillerTheGame ORDER BY score DESC');
	while($result = $query->fetch_assoc())
		$tojson[] = $result;
	if ($_GET['count'])
		echo count($tojson);
	else
		echo json_encode($tojson);
?>