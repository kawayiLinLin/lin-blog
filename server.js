const fs = require('fs')


const express = require('express')

const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json({ limit: '200mb' }))

app.use('/public/', express.static('./public'))

app.get('/', function(_req, res) {
    res.redirect('/lin')
})

app.get('/lin', function(req, res) {
    res.sendFile(require('path').join(__dirname, './public/index.html'))
})


const privateKey = fs.readFileSync('./4388799_yzl.xyz.key', 'utf8')

const certificate = fs.readFileSync('./4388799_yzl.xyz.pem', 'utf8')

const credentials = { key: privateKey, cert: certificate }

const https = require('https').Server(credentials, app)

https.listen(443, function() {
  console.log('listening on *:443')
})