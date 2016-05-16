var express = require('express');
var url = require('url');

var app = express();
var port = 8080;

function timeTemplate() {
    this.unix = null;
    this.natural = null;
}

var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


//accepts a date object and returns the correct unix and natural time
function createTime(date) {
    var d = new timeTemplate();
    d.unix = date.getTime()/1000; //converted to seconds
    d.natural = monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    
    return d;
}

//returns null if not a natural date format, or the date object if it is
function naturalDate(url) {
    //parse data and create Date object
    var contents = url.split('%20');
    var urlString = contents[0] + ' ' + contents[1] + ', ' + contents[2];
    var date = new Date(urlString);
    
    if (!isNaN(date.getTime())) //checks if object is valid
        return date;
    else
        return null;
}

//returns an array where the first index contains the type of url entered if it's valid or null if it's invalid.
//the second index contains the Date object if it's valid. 
function getDate(url) {
    var natDate = naturalDate(url);
    if (natDate != null) { //check to see if it's natural!
        return ['natural', natDate];
    }    
    else if (!isNaN(url)) { //if the url is a number, it's unix time
        return ['unix', new Date(Number(url*1000))]; //converted to milliseconds
    }
    else {
        return [null];        
    }
}

//serves homepage
app.use('/', express.static('client'));

//tests to see if url is valid, if url is valid then returns the correct time object
//if url is invalid it sends to next middle that gives the correct response
app.all('*', function(req, res, next) {
    //pathName is a fully parsed version of their request
    var pathName = url.parse(req.url, true).pathname.slice(1); 
    
    //check to see if pathName is a valid time format
    var date = getDate(pathName);
    if (date[0] != null) { //valid time format
        //create time object based on url data and send it
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(createTime(date[1])));
    }
    else { //not a valid time format
        next(); //go to middleware for invalid time formats
    }

    res.end(pathName); //!!!!replace this with the proper object!
});

//serves null object if incorrect url
app.use(function(req, res) {
    var time = new timeTemplate();
    
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(JSON.stringify(time, null, 1));
});

app.listen(port);