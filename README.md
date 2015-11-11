# Toggl to ScalablePath Report
This is just a small node script to retreive the time tracked in Toggl and export it in a format that ScalablePath's Tempo app will understand

## Usage
The basic usage is

	node app.js <options>

## Examples

1. Get the time from an interval
	node app.js --token 12098efnojsdf00 --workspace 123456 --from 2015-10-02 --to 2015-11-08

2. Get the workspace id
	node app.js --get-workspace

## Options
*token*: The toggl provided by toggle
*workspace*: To find the workspace id
*file*: Filename to save the exported data to
*from*: Starting date
*to*: End date

## Configuration
You have 3 options for configuration:
1. use command line options like in the examples
2. use the file config.json with the configuration information (there is a config.json.example as an example)
3. Use environment variables (see the section about environment variables)

## Environment Variables
WIP
