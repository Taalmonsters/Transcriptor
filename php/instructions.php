<?php

	$key = '';
	if(isset($_GET['key']) && !empty($_GET['key']) && preg_match('/^[a-zA-Z0-9\-_]+$/', $_GET['key'])){
		$key = $_GET['key'];
	} else {
		echo json_encode('ERROR: INVALID KEY');
		exit;
	}
	
	$file = '../config/instructions.txt';
	$instructions = "";
	$handle = fopen($file, "r");
	if ($handle) {
		while (($line = fgets($handle)) !== false) {
			$stuff = explode(";", $line);
			if ($stuff[0] === $key) {
				$instructions = $stuff[1];
				break;
			}
		}
		fclose($handle);
		echo json_encode($instructions);
	} else {
		echo json_encode('Could not open instructions file!');
	}

?>