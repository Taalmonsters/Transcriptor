<?php

	$file = '../config/about.txt';
	$about = array();
	$handle = fopen($file, "r");
	if ($handle) {
		while (($line = fgets($handle)) !== false) {
			if (substr( $line, 0, 1 ) !== "%") {
				$about[] = $line;
			}
		}
		fclose($handle);
		echo json_encode($about);
	} else {
		echo json_encode('Could not open "about" file!');
	}

?>