<?php

	$id = '';
	if(isset($_GET['id']) && !empty($_GET['id']) && preg_match('/^[a-zA-Z0-9\-_]+$/', $_GET['key'])){
		$id = $_GET['id'];
	} else {
		echo 'ERROR: INVALID ID';
		exit;
	}
	
	$file = '../config/tooltips.txt';
	$tooltip = "";
	$handle = fopen($file, "r");
	if ($handle) {
		while (($line = fgets($handle)) !== false) {
			$stuff = explode(";", $line);
			if ($stuff[0] === $id) {
				$tooltip = $stuff[1];
				break;
			}
		}
		fclose($handle);
		echo $tooltip;
	} else {
		echo 'Could not open tooltips file!';
	}

?>