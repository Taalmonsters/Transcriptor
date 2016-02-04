<?php

	$logo_file = '../config/logos.txt';
	$logos = array();
	$handle = fopen($logo_file, "r");
	if ($handle) {
		while (($line = fgets($handle)) !== false) {
			$logo = explode(";", $line);
			$logos[] = array("img" => $logo[0], "link" => $logo[1], "alt" => $logo[2]);
		}
		fclose($handle);
		echo json_encode($logos);
	} else {
		echo json_encode('Could not open logo file!');
	}

?>