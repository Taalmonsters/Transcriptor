<?php

	error_reporting(E_ALL); 
	ini_set('display_errors','1');

	function get_clam_property($key) {
	    $file = '../config/clam.properties';
		$handle = fopen($file, "r");
		if ($handle) {
			while (($line = fgets($handle)) !== false) {
				$stuff = preg_split("/ *= */", $line);
				if ($stuff[0] === $key) {
					fclose($handle);
					return $stuff[1];
				}
			}
			fclose($handle);
		}
		return '';
	}
	
	function get_clam_data($input) {
		$data = array();
		$keys = array("encoding", "x", "lang", "lang2", "name", "inputtemplate", "contents");
		
		for($x = 0; $x < count($keys); $x++) {
			if (isset($input[$keys[$x]])) {
				$data[$keys[$x]] = $input[$keys[$x]];
			}
		}
		
		return $data;
	}
	
	function get_clam_response($url, $username, $password, $data, $method) {
		$options = array(
		        CURLOPT_URL            => $url,
		        CURLOPT_HEADER         => true,    
		        CURLOPT_VERBOSE        => true,
		        CURLOPT_RETURNTRANSFER => true,
		        CURLOPT_FOLLOWLOCATION => true,
		        CURLOPT_SSL_VERIFYPEER => false,    // for https
		        CURLOPT_USERPWD        => $username . ":" . $password,
		        CURLOPT_HTTPAUTH       => CURLAUTH_DIGEST,
		        // CURLOPT_POST           => true,
		        CURLOPT_POSTFIELDS     => http_build_query($data) 
		);
		
		$ch = curl_init();
		
		curl_setopt_array( $ch, $options );
		
		if ($method === 'GET') {
			curl_setopt($ch, CURLOPT_POST, false);
		} else if ($method === 'POST') {
			curl_setopt($ch, CURLOPT_POST, true);
		} else if ($method === 'DELETE' || $method === 'PUT') {
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
		}
		
		try {
		  $raw_response  = curl_exec( $ch );
		
		  // validate CURL status
		  if(curl_errno($ch))
		      throw new Exception(curl_error($ch), 500);
		
		  // validate HTTP status code (user/password credential issues)
		  $status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		  if ($status_code != 200)
		      throw new Exception("Response with Status Code [" . $status_code . "].", 500);
		
		} catch(Exception $ex) {
		    if ($ch != null) curl_close($ch);
		    throw new Exception($ex);
			return '';
		}
		
		if ($ch != null) curl_close($ch);
		
		return $raw_response;
	}
	
	$clam_url = (isset($_ENV['TRANSCRIPTOR_URL']) ? $_ENV['TRANSCRIPTOR_URL'] : get_clam_property('base'))+$_GET['url'];
	$clam_user = (isset($_ENV['TRANSCRIPTOR_USER'])) ? $_ENV['TRANSCRIPTOR_USER'] : get_clam_property('user');
	$clam_pass = (isset($_ENV['TRANSCRIPTOR_AUTH'])) ? $_ENV['TRANSCRIPTOR_AUTH'] : get_clam_property('auth');
	$clam_data = get_clam_data($_GET);
	
	$response = get_clam_response($clam_url, $clam_user, $clam_pass, $clam_data, (isset($_GET['method'])) ? $_GET['method'] : 'GET');
	echo json_encode(array("response" => $response));
?>