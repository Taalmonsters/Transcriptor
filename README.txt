Configuration:

If you have CLAM set up WITHOUT Digest Authentication:

- js/transcriptor.js:
	Set Transcriptor.authenticate to false
	Set Transcriptor.baseUrl to the URL of the Transcriptor CLAM application.
	Set Transcriptor.resetUrl to the URL where the web interface is hosted.
	
If you have CLAM set up WITH Digest Authentication:

- js/transcriptor.js:
	Set Transcriptor.authenticate to true
	Set Transcriptor.resetUrl to the URL where the web interface is hosted.
- For CLAM authentication:
	Either set the following environment variables on your system:
		TRANSCRIPTOR_URL = the base url of your CLAM application
		TRANSCRIPTOR_USER = the username to authenticate with CLAM
		TRANSCRIPTOR_AUTH = the password for CLAM
	Or add a file 'clam.properties' to the config directory with the following properties:
		base = the base url of your CLAM application
		user = the username to authenticate with CLAM
		auth = the password for CLAM
	NB: Make sure the clam.properties file is NOT visible to the world.
	
Global configuration:

- config/about.txt:
	Add a description of the application.
- config/instructions.txt:
	Add a description for the given fields in the second column.
- config/logos.txt:
	Add all logos from img/logos/ to this list. First, provide the relative path to the logo image. Next, provide the URL to which the logo should link. Finally, provide an alt text for the image.
	Do not forget to add the images to img/logos/.

Enjoy!

Questions? Contact matje@taalmonsters.nl.
