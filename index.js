Error.stackTraceLimit = 25
var express = require("express")
var app = express()
var bodyParser = require("body-parser")
var database = require("./database.js")
var config = require("./config.json")
var https = require("https")
var http = require("http")


var fs = require("fs")
var privateKey = fs.readFileSync("./ssl/key")
var certificate = fs.readFileSync("./ssl/cert")
var credentials = { key: privateKey, cert: certificate }

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/api/city", function (req, res) {
	console.log("city")
	if (!req.query.name) {
		return res.status(400).json({ err: "No name provided" })
	}
	database.getCityByName(req, res)
})

app.get("/api/echo", function (req, res) {
	console.log("echo")
	res.send("echo")
})
var httpServer = http.createServer(app)
var httpsServer = https.createServer(credentials, app)
httpsServer.listen(config.port)
httpServer.listen(config.port + 1)
