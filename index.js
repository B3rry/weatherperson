var express = require('express');
var app = express();
var env = require('dotenv').config();
var port = process.env.PORT || 3000;
// END OF ROUTING
var auth = require('./auth');
var channels = require('./channels');

app.get('/', function (req, res){
    res.redirect('https://amida.slack.com');
});

console.log(process.env.COM_SLACK_WEBHOOK_INCOMING)
var Slack = require('slack-node');
weatherBot = new Slack();
weatherBot.setWebhook(process.env.COM_SLACK_WEBHOOK_INCOMING);
var ioForecastApi = require('request');
var coordinates = {
	latitude: '38.906268',
	longitude: '-77.038024'
}
var ioForecastApiArguments = {
    url: 'https://api.forecast.io/forecast/' + process.env.IO_FORECAST_API_KEY + '/' + coordinates.latitude + ',' + coordinates.longitude,
    method: 'GET'
};
function ioForecastCallback(error, response, body){
    if(error) {
        console.log(error);
    } else {
        body = JSON.parse(body);
        console.log(body.daily);
        ds = body;
        var windDir = "";
        if (Math.round(body.hourly.data[0].windBearing) > 337.5) {
            windDir = "Northerly";
        } else if (Math.round(body.hourly.data[0].windBearing) > 292.5) {
            windDir = "Northwesterly";
        } else if (Math.round(body.hourly.data[0].windBearing) > 247.5) {
            windDir = "Westerly";
        } else if (Math.round(body.hourly.data[0].windBearing) > 202.5) {
            windDir = "Southwesterly";
        } else if (Math.round(body.hourly.data[0].windBearing) > 157.5) {
            windDir = "Southernly";
        } else if (Math.round(body.hourly.data[0].windBearing) > 112.5) {
            windDir = "Southeasterly";
        } else if (Math.round(body.hourly.data[0].windBearing) > 67.5) {
            windDir = "Easterly";
        } else if (Math.round(body.hourly.data[0].windBearing) > 22.5) {
            windDir = "Northeasterly";
        } else if (Math.round(body.hourly.data[0].windBearing)) {
            windDir = "Northerly";
        } else {
            windDir = "Still";
        };
        var moonPhase = "";
        if (body.daily.data[0].moonPhase >= 93.75) {
            moonPhase = ":new_moon:";
        } else if (body.daily.data[0].moonPhase >= 81.25) {
            moonPhase = ":waning_crescent_moon:";
        } else if (body.daily.data[0].moonPhase >= 68.75) {
            moonPhase = ":last_quarter_moon:";
        } else if (body.daily.data[0].moonPhase >= 56.25) {
            moonPhase = ":waning_gibbous_moon:";
        } else if (body.daily.data[0].moonPhase >= 43.75) {
            moonPhase = ":full_moon:";
        } else if (body.daily.data[0].moonPhase >= 31.25) {
            moonPhase = ":waxing_gibbous_moon:";
        } else if (body.daily.data[0].moonPhase >= 18.75) {
            moonPhase = ":first_quarter_moon:";
        } else if (body.daily.data[0].moonPhase >= 6.25) {
            moonPhase = ":waxing_crescent_moon:";
        } else {
            moonPhase = ":new_moon:";
        };
        var icon = ":sunny:";
        switch (body.minutely.icon) {
    		case 'clear-day':
        	icon = ":sunny:";
        	break;
        	case 'clear-night':
        	icon = moonPhase;
        	break;
        	case 'rain':
        	icon = ":rain_cloud:";
        	break;
        	case 'snow':
        	icon = ":snow_cloud:";
        	break;
        	case 'sleet':
        	icon = "::";
        	break;
        	case 'wind':
        	icon = ":dash:";
        	break;
        	case 'fog':
        	icon = ":fog:";
        	break;
        	case 'cloudy':
        	icon = ":cloud:";
        	break;
        	case 'partly-cloudy-day':
        	icon = ":sun_behind_cloud:";
        	break;
        	case 'partly-cloudy-night':
        	icon = moonPhase;
        	break;
		}
        weatherBot.webhook({
  			channel: channels.ioForecastApi,
  			username: body.currently.temperature + '° F',
 		    icon_emoji: icon,
		    text: '*Wind*: Moving ' + windDir + " at " + Math.round(body.hourly.data[0].windSpeed) + "MPH\n\n*Feels Like*: " + Math.round(body.currently.apparentTemperature) + "° F\n\n*Next Hour*: " + body.minutely.summary + "\n\n *Next 24 Hours*: " + body.hourly.summary + "\n\n *Next 7 Days*: " + body.daily.summary
		}, function(err, response) {
		  console.log(response);
		});
        setTimeout(function () {
          process.nextTick(function () {
          ioForecastApi(ioForecastApiArguments, ioForecastCallback);
          });
        }, 3600000);

    }
}
ioForecastApi(ioForecastApiArguments, ioForecastCallback);