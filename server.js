// PairMatic - a real-time remote pair coordinating web app
// Copyright (C) 2012 - Glen E. Ivey
// https://github.com/gleneivey/pairmatic
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License version
// 3 as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program in the file COPYING and/or LICENSE. If not,
// see <http://www.gnu.org/licenses/>.


function removeHashEntryByValue(h, v){
  for (var k in h) {
    if (h[k] == v) {
      delete h[k];
    }
  }
}



var
  app = require('http').createServer(handler),
  io = require('socket.io').listen(app),
  fs = require('fs');

app.listen(80);


// trivial static-file server
function handler (req, res) {
  var url = req.url;
  if (url == '/') { url = '/index.html'; }
  if (url == '/favicon.ico') { url = '/vendor/favicon.ico'; }
  fs.readFile(__dirname + '/client' + url,
      function (err, data) {
	if (err) {
	  res.writeHead(500);
	  return res.end('Error loading "' + url + '"');
	}

	res.writeHead(200);
	res.end(data);
      }
  );
}


var pairingState = {};
var pairNotes = {};
var personData = [
    [ "mark",      "Mark",      "mm",  "D",  null ],
    [ "nick",      "Nick",      "nrs", "D",  "a6843e2d31781a378deb73b6d8656e26" ],
    [ "glen",      "Glen",      "gi",  null, "givey@pivotallabs.com" ],
    [ "lewis",     "Lewis",     "lh",  "D",  null ],
    [ "chad",      "Chad",      "caw", null, "68613e8fd136bfddcdedd16b0bfa671f" ],
    [ "alex",      "Alex",      "aj",  "D",  null ],
    [ "matt",      "Matt",      "mh",  "D",  null ],
    [ "thomas",    "Thomas",    "tb",  "SF", "4a4dd769149baedf9212e7af94c6c11c" ],
    [ "david",     "David",     "ds",  "SF", "6da8384aa1243b708fafd402922b478e" ],
    [ "jordi",     "Jordi",     "jn",  "SF", null ],
    [ "christian", "Christian", "cn",  "SF", "83d5299619b88c68e6360e4d05d1535f" ],
    [ "johan",     "Johan",     "ji",  "SF", null ],
    [ "dan",       "Dan",       "dp",  null, "ed2a327e601de8f01d9d0d728c480fa4" ],
    [ "chris",     "Chris",     "ct",  null, "8a858ed4ebd2d2809c38b30b1135fd41" ],
    [ "jo",        "Jo",        "jw",  null, null ]
  ];


// browser-to-browser relay
io.sockets.on('connection', function (socket) {
  socket.emit('init', {
      'state': pairingState,
      'notes': pairNotes,
      'personData': personData
  });
  socket.on('pair', function(data) {
    removeHashEntryByValue(pairingState, data.person);
    pairingState[data.target] = data.person;
    socket.broadcast.emit('pair', data);
  });
  socket.on('unpair', function(data) {
    removeHashEntryByValue(pairingState, data.person);
    socket.broadcast.emit('unpair', data);
  });
  socket.on('reset', function(){
    pairingState = {};
    pairNotes = {};
    socket.broadcast.emit('reset', {});
  });
  socket.on('note', function(data){
    pairNotes[data.target] = data.note;
    socket.broadcast.emit('note', data);
  });
  socket.on('move', function(data){
    socket.broadcast.emit('move', data);
  });
});
