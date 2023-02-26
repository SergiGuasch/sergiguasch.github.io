1-Install Node.js from https://nodejs.org/es/

2-Download Openlayers folder and copy in C:

3-Open cmd from C:\Openlayers\Openlayers_DE

4-Execute by order:
	npm init
	npm install ol
	npm install --save-dev parcel-bundler

5-In package.json add the start and build line after test line:
 
	"scripts": {
    		"test": "echo \"Error: no test specified\"",
    		"start": "parcel index.html",
    		"build": "parcel build --public-url http://www.github.io index.html"
	},

6-Execute npm start and open http://localhost:1234/
