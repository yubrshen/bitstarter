#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURLExists = function(url) {
    // var instr = infile.toString();
    // if(!fs.existsSync(instr)) {
    //     console.log("%s does not exist. Exiting.", instr);
    //     process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    // }
    // this function should ensure the url is valid, for now just keep the stub according to the signature
    return "";
};

// var cheerioHtmlFile = function(htmlfile) {
//     return cheerio.load(fs.readFileSync(htmlfile));
// };

var cheerioHtmlFile = function(htmlfile) {
    return cheerioHtmlString(fs.readFileSync(htmlfile));
};


var cheerioHtmlString = function(htmlstring) {
    return cheerio.load(htmlstring);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var checkHtmlString = function(htmlstring, checksfile) {
    $ = cheerioHtmlString(htmlstring);
    // the rest is the same as checkHtmlFile, if I knew how to represent $. I may further factor
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var bulidProcessor = function(checksfile) {
    var processHtmlCode = function(result, response) {
	if (result instanceof Error) {
	    console.error('Error: ' + util.format(response.message));
	} else {
	    // check the Html code and output the result
	    outputCheckResult(checkHtmlString(result, checksfile));
	}
    };
    return processHtmlCode;
};

var outputCheckResult = function(checkJson) {
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <URL>', 'URL to index.html', clone(assertURLExists), HTMLFILE_DEFAULT)
	.parse(process.argv);
    // for the case of file
    if (program.file) {
	outputCheckResult(checkHtmlFile(program.file, program.checks));
    } else {
	var responseHander = bulidProcessor(program.checks);
	rest.get(program.url).on('complete', responseHander);
    }
    // var checkJson = checkHtmlFile(program.file, program.checks);

    // // for the case of url

    // var outJson = JSON.stringify(checkJson, null, 4);
    // console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
