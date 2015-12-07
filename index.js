#! /usr/bin/env node

var https     = require('https'),
    nconf     = require('nconf'),
    fs        = require('fs'),
    strftime  = require('strftime');

var token     = '',
    workspace = '',
    path      = '',
    reqType   = 'details';

/*
 * Configuration priority: arguments, then environment, then file
 */
nconf.argv().env().file({file: 'config.json'});

/*
 * Verify configuration values are present
 */
if (typeof nconf.get('token') && typeof nconf.get('SP_TOGGL_TOKEN')) {
    nconf.set('token', nconf.get('SP_TOGGL_TOKEN'));
}
if (typeof nconf.get('workspace') && typeof nconf.get('SP_TOGGL_WORKSPACE')) {
    nconf.set('workspace', nconf.get('SP_TOGGL_WORKSPACE'));
}
if (typeof nconf.get('person') && typeof nconf.get('SP_TOGGL_PERSON')) {
    nconf.set('person', nconf.get('SP_TOGGL_PERSON'));
}

if (typeof nconf.get('token') === 'undefined') {
    process.stderr.write('You have to provide a token\n');
    process.stderr.write('Go to https://www.toggl.com/app/profile to access your token');
    process.exit();
}
if (typeof nconf.get('workspace') === 'undefined' && typeof nconf.get('get-workspace') === 'undefined') {
    process.stderr.write('You have to provide a workspace ID \n');
    process.stderr.write('Use --get-workspace to get the workspace ID\n');
    process.exit();
}
if (typeof nconf.get('person') === 'undefined') {
    process.stderr.write('You have to provide the developer ID given by SacalablePath\n');
    process.stderr.write('Use --person to set it\n');
    process.exit();
}

/*
 * Set request URI depending on the conf values
 */
if (nconf.get('get-workspace')) {
    path = 'https://www.toggl.com/api/v8/workspaces?user_agent=api_test';
    reqType = 'workspaces';
} else {
    if (typeof nconf.get('since') == 'undefined' || typeof nconf.get('until') == 'undefined') {
        process.stderr.write('You have to specify --since and --until options \n');
        process.exit();
    }
    path = '/reports/api/v2/details?user_agent=api_test&workspace_id='+nconf.get('workspace')+
        '&since='+ nconf.get('since')+
        '&until='+ nconf.get('until');
    reqtype = 'details';
}

/*
 * HTTPS request options
 */
var httpOptions = {
    auth: nconf.get('token') + ':api_token',
    hostname: 'toggl.com',
    path: path,
    method: 'GET'
}

/*
 * Make request
 */
var req = https.request(httpOptions, function(res){

    res.on('data', function(data) {
        if (data['error'] != undefined) {
            console.log(data);
            process.exit();
        }
        var dataObj;
        try {
            dataObj = JSON.parse(data);
        } catch (e) {
            process.stderr.write('An error ocurred while parsing the received JSON data');
            process.exit();
        }

        switch (reqType) {
            case 'workspaces':
                process.stdout.write('This is a list of workspaces:\n');
                dataObj.forEach(function(item){
                    process.stdout.write('Name: ' + item.name + ', ID: ' + item.id + '\n');
                });
                break;
            case 'details':
                if (dataObj['error'] != undefined) {
                    process.stderr.write(dataObj);
                    process.exit();
                }

                /* Star output */
                var line= ['date', 'person', 'project', 'hours', 'notes'];
                process.stdout.write(line.join('\t') + '\n');
                dataObj.data.forEach(function(item){
                    line = [];
                    line.push(strftime('%Y-%m-%d', new Date(item.start)));
                    line.push('[' +nconf.get('person') + ']');
                    line.push(item.project);
                    line.push(item.dur/3600000);
                    line.push(item.description);
                    process.stdout.write(line.join('\t') + '\n');
                });
                break;
        }
    });
});
req.end();

req.on('err', function(err) {
    process.stderr.write(err);
    process.exit();
});
