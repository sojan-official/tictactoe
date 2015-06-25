var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'



var express = require('express');
var app = express(); 



var http = require('http').Server(app);
var io = require('socket.io')(http);




//array that saves all games 
var games = {} ;
//winning combinations 


var roomDetails = {};






app.use('/js',express.static('clientside/js/'));

app.use('/css',express.static('clientside/css/'));
app.use('/images',express.static('clientside/images/'));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/clientside/game.html');
});

io.on('connection', function(socket){


  
  console.log(socket.id + ' connected');

  socket.on('create room', function(data){

    //console.log(data);
    var room = data['room'];
    if(games[room]){

      socket.emit('room exists', room);
      return;
    }
    console.log("created room"+ room);

    var player ={};
    player['username'] = data['username'];
    player['type'] = 'x';
    player['socket'] = socket.id;


    games[room] = {};
    games[room]['players'] = [];
    games[room]['x'] = [];
    games[room]['o'] = [];

    roomDetails[socket.id]=room;


    games[room]['players'].push(player);
    socket.join(room);

    socket.emit('room created',room);
    

    console.log(player);
    //console.log(socket.id)
  });


  socket.on('join room', function(data){
    room  = data['room'];
    if(!games[room]){
      console.log("room don't exist " + room); 
      socket.emit('wrong room',room);
      return;
    }

    socket.join(room);

    console.log("joining room"+ room);


    var player ={};
    player['username'] = data['username'];
    var count = games[room]['players'].length;

    if(count ==1 ) { 
      player['type'] = 'o';
      roomDetails[socket.id]=room;


    }
    else{
      player['type']  = 'spectator';
    }

    player['socket'] = socket.id;

   
    games[room]['players'].push(player);
    

    console.log(games);

    io.sockets.emit('player joined',games[room]);
    

    console.log(games);
    //console.log(socket.id);

  });



  socket.on('move made', function(data){
    var roomName = data['room'];
    var player   = data['player'];
    var col      = data['col'];
    games[roomName][player].push(parseInt(col));



    console.log(roomName);
    console.log(player);
    console.log(col);


    io.sockets.in(roomName).emit('move made',{'player':player , 'col':col});


  });

  socket.on('clear board',function(room) {

    if(games[room]){
    games[room]['x'] =[];
    games[room]['o'] = [];

     }


  });





  socket.on('disconnect', function(){
    console.log('user disconnected');

    console.log(roomDetails[socket.id]);
    if(roomDetails[socket.id])
    {
       io.sockets.in(roomDetails[socket.id]).emit('close room',socket.id);

       var roomName = roomDetails[socket.id];
       delete games[roomDetails[socket.id]];
       for(x in roomDetails){
        if (roomDetails[x]== roomName) delete roomDetails[x];
       }
       
    }

    console.log(games);
    console.log(roomDetails);
  });

  


 
});





http.listen(server_port, server_ip_address, function(){
  console.log('listening on *:3000');
});