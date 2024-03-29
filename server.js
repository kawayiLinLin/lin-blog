const fs = require('fs')


const express = require('express')

const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json({ limit: '200mb' }))

app.use('/lin/', express.static(path.join(__dirname, './public')))

app.get('/', function(_req, res) {
    res.redirect('/lin')
})

app.get('/lin', function(_req, res) {
    res.sendFile(require('path').join(__dirname, './public/index.html'))
})

app.post('/deploy', function(_req, res) {
    console.log('start')
    const child_process = require('child_process')
    child_process.exec(`chmod +x ${path.join(__dirname, './deploy.sh')}`)
    child_process.execFile(path.join(__dirname, './deploy.sh'), function(error, stdout,  stderr) {
        if (error) {
            console.log(error)
        }
        if (stdout) {
            console.log(stdout)
        }
        if (stderr) {
            console.log(stderr)
        }
    })
    console.log('end')
    res.end()
})


const privateKey = fs.readFileSync(path.join(__dirname, './8344303_yzl.xyz.key'), 'utf8')

const certificate = fs.readFileSync(path.join(__dirname, './8344303_yzl.xyz.pem'), 'utf8')

const credentials = { key: privateKey, cert: certificate }

const https = require('https').Server(credentials, app)

https.listen(443, function() {
  console.log('listening on *:443')
})