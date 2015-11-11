# Toggl to ScalablePath Report
This is just a small node script to retreive the time tracked in Toggl and export it in a format that ScalablePath's Tempo app will understand

## Usage
The basic usage is

	node index.js <options>

## Example

1. Get the time from an interval
```
node index.js --token 12098efnojsdf00 --workspace 123456 --person 151 --from 2015-10-02 --to 2015-11-08
```

2. Get the workspace id
```
node index.js --get-workspace
```

## Options

- *token*: The [token provided by toggle](https://www.toggl.com/app/profile)
- *workspace*: The workspace id (use --get-workspace to find it)
- *since*: Starting date
- *until*: End date
- *person*: ScalablePath's Developer ID


## Configuration
3 values are required for configuration:
* workspace
* token
* person

This can be provided as commandline options or as environment variables

```bash
export SP_TOGGL_TOKEN=2e7ad31993766ed0b9310ab977b7e278
export SP_TOGGL_WORKSPACE=763001
export SP_TOGGL_PERSON=151
```

