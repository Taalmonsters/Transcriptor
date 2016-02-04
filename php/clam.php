<?php

	function get_clam_property($key) {
	    $file = '../config/clam.properties';
		$handle = fopen($file, "r");
		if ($handle) {
			while (($line = fgets($handle)) !== false) {
				$stuff = explode(";", $line);
				if ($stuff[0] === $key) {
					fclose($handle);
					return $stuff[1];
				}
			}
			fclose($handle);
		}
		return '';
	}
	
	function get_clam_response($url, $data, $method) {
		// use key 'http' even if you send the request to https://...
		$options = array(
		    'http' => array(
		        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
		        'method'  => $method,
		        'content' => http_build_query($data),
		    ),
		);
		$context  = stream_context_create($options);
		$result = file_get_contents($url, false, $context);
		if ($result === FALSE) { /* Handle error */ }
		return $result;
	}
	
	$clam_user = (isset($_ENV['TRANSCRIPTOR_USER'])) ? $_ENV['TRANSCRIPTOR_USER'] : get_clam_property('user');
	$clam_auth = (isset($_ENV['TRANSCRIPTOR_AUTH'])) ? $_ENV['TRANSCRIPTOR_AUTH'] : get_clam_property('auth');
	$clam_url = (isset($_ENV['TRANSCRIPTOR_URL'])) ? $_ENV['TRANSCRIPTOR_URL'] : get_clam_property('base');
	
	$response = get_clam_response();
	
?>