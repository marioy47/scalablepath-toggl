#! /usr/bin/env node

var https  = require('https'),
  nconf    = require('nconf'),
  fs       = require('fs'),
  _        = require('lodash'),
  strftime = require('strftime');

// Toggle request paths
var  paths = {
  workspace: '/api/v8/workspaces',
  report : '/reports/api/v2/details?user_agent=api_test&workspace_id=<%= workspace %>&since=<%= since %>&until=<%= until %>'
};

// https request options
const httpOptions = {
  auth: '',
  hostname: 'toggl.com',
  port: 443,
  path: '',
  method: 'GET'
}


// Nconf configuration priority: Arguments then ENV then conf.json
nconf.argv().env().file({
  file: 'config.json'
});

// Initial values
let token   = nconf.any('token', 'TOGGL_TOKEN'),
  workspace = nconf.any('workspace', 'TOGGL_WORKSPACE'),
  type      = nconf.any('type'),
  action    = 'sp-report'

// Exit if not engouh parameters
if (token == null) {
  console.log('EMPTY TOKEN. Get you token from togglein https://toggl.com');
  showUsage();
  process.exit();
}

// What are we going to do on toggle?
if (nconf.any('get-workspace')) {
  action = 'workspace';
}

if (type != null) {
  action = type;
}

// Add mising paramters to httpsOptions
httpOptions.auth = token + ':api_token';
switch (action) {
  case 'workspace':
    httpOptions.path = paths.workspace;
    break;
  case 'sp-report':
    let since = nconf.any('since'),
      until = nconf.any('until');
    if (since == null || until == null || workspace == null) {
      console.log('MISSING PARAMETER');
      console.log('You must provide workspace id, since date, until data and SP worker ID');
      showUsage();
      process.exit();
    }
    httpOptions.path = _.template(paths.report)({
      since: since,
      until: until,
      workspace: workspace
    });

    break;
}

var data = '';
const req = https.request(httpOptions, (res) => {
  res.setEncoding('utf8');

  res.on('data', (d) => {
    data = data + d;
  });

  res.on('end', () => {
    switch (action) {
      case 'workspace':
        processWorkspace(data);
        break;
      case 'sp-report':
        const spId = nconf.any('sp-id', 'TOGGL_SP_ID');
        if (spId == null) {
          console.error('ERROR. You must privide the SP worker ID');
          showUsage();
          process.exit();
        }
        processSP(data, spId);
        break;
    }
  });

});

req.on('error', (e) => {
  console.error(e);
  process.exit();
});

req.end();


/**
 * Convert received json y SP formated data
 * @param {string} data
 */
function processSP(data, spId) {
  const dataObj = convertJsonObject(data);
  let line = ['date', 'person', 'project', 'hours', 'notes', 'discount', 'tags'];

  process.stdout.write(line.join('\t') + '\n');

  dataObj.data.forEach(function(item){
    line = [];
    line.push(strftime('%Y-%m-%d', new Date(item.start)));
    line.push('[' + spId + ']');
    line.push(item.project);
    line.push(item.dur/3600000);
    line.push(item.description);
    line.push(0);
    line.push(item.tags.join(','));
    process.stdout.write(line.join('\t') + '\n');
  });
}
/**
 * Entrega una lista formateada de espacios de trabajo
 * @param {string} data Datas recibidos del API
 */
function processWorkspace(data) {
  console.log('This is a list of workspaces');
  let dataObj = convertJsonObject(data);
  dataObj.forEach( (item) => {
    console.log('ID: ', item.id, ' ,Name: ', item.name);
  });
}

/**
 * Receives a json string and resturns it as an object
 * @param {string} data Input paramters
 * @returns {object}
 */
function convertJsonObject(data) {

  let dataObj = {};
  try {
    dataObj = JSON.parse(data);
  } catch (e) {
    console.error('ERROR!', e);
    console.error('DATA: ', data);
    process.exit();
  }

  return dataObj;
}

/**
 * Displays usage instructions
 */
function showUsage() {
  console.log('Usage:');
  console.log('sp-toggl --token=<toggl-token> --workspace=<toggl-workspace-id> --since=<YYYY-MM-DD> --unti=<YYYY-MM-DD> [--sp-id=<scalable-path-worker>]');
}
