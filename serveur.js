var express = require('express');
var session = require('cookie-session'); // Charge le middleware de sessions
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var fs = require('fs'); // Charge gestionnaire fichiers
var libOptim = require('./cutOptim'); //Charge l'optimizer

var app = express();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var cuts = JSON.parse(fs.readFileSync('exemple500.json', 'utf8'));


var optimizer = new libOptim.Optimizer(cuts);

var bars = optimizer.optimize();

console.log('Bars number='+optimizer.barCol.countBars());
console.log('TotalSizeBars='+optimizer.barCol.totalSizeBars());
console.log('TotalUsedBars='+optimizer.barCol.totalUsedBars());
console.log('CountPiecesInBars='+optimizer.barCol.countPieces());
console.log('SumPiecesInBars='+optimizer.barCol.sumPieces());
console.log('SumCuts='+optimizer.cutCol.cuts.length);
console.log('TotalCuts='+optimizer.cutCol.totalCuts());
console.log('LossRate='+Math.round(optimizer.barCol.totalLossBars()*10000/optimizer.barCol.totalSizeBars(),4)/100+'%');

//optimizer.barCol.getPiecesIdList();



/* On utilise les sessions */
app.use(session({secret: 'todotopsecret'}))


/* Gestion des routes en-dessous
   ....                         */


app.get('/', function(req, res) {

    res.setHeader('Content-Type', 'text/html');

    res.end('Vous êtes à l\'accueil 2');

})

.get('/cuts', function(req, res) {

res.setHeader('Content-Type', 'text/html');

    res.render('cuts.ejs', {cuts: optimizer.cutCol.cuts});
})

.get('/extracuts', function(req, res) {

res.setHeader('Content-Type', 'text/html');

    res.render('extraCuts.ejs', {cuts: optimizer.cutCol.extraCuts});
})

.get('/bars', function(req, res) {

res.setHeader('Content-Type', 'text/html');

    res.render('bars.ejs', {bars: bars});
});




app.listen(8080);