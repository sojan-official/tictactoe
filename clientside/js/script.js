  var userName="";
  var room ="";
  var playerType="";
  var currentTurn=""
  var pause = 0 ;


  var scores = {} ;
  scores['x'] = [];
  scores['o'] = [];

  var gameCols = document.getElementsByClassName("col");
  addClickToCols();

  var socket = io();
  

  
  var promptScreen = document.getElementById('promptscreen');
  var waitScreen = document.getElementById('waitscreen');
  var gameScreen = document.getElementById('gamescreen');

  
  //function to search through array of objects
  function findByIdValue(source,id,value) {
    var result = -1;
    
    for(x in source) 
    { 
      if(source[x][id] === value){
        result=x;
        break;
      }
    }
    if (result!=-1){
      return source[x];
    }
    else{
      return '';
    }
  }

  //functions to modify html
  function updateStatus(message){
    document.getElementById("message").innerHTML = message;
  }

  function updateGameDetails (player,room,type) {
    document.getElementById('gamedetails').innerHTML = "player:"+player+" | room:"+room+" | type:"+type;
  }


  function addClickToCols(){

    var gameCols = document.getElementsByClassName("col");

    for(var i=0; i < gameCols.length ; i++){
        //console.log(i);
        gameCols[i].addEventListener('click', clickFn, false);
      };

    }




    function clearfield (){

      var cols = document.getElementsByClassName("col");

      for(var i=0; i < cols.length ; i++)
      {
        //console.log(cols[i]);

        if(cols[i].classList.contains('ticked'))
        {
          cols[i].className = "col"; 
          cols[i].innerHTML = "";



        }
      }

      scores['x'] =[];
      scores['o'] =[];
      socket.emit("clear board",room);

      currentTurn = 'x';
      if(playerType=="x"){
        updateStatus("You(x) makes the first move");

      }else if(playerType=="o"){
        updateStatus("wait for your opponent(x)");

      }else{

        updateStatus("you are a spectator");

      }

    }


    function updateBoard()
    {
      for(var x in scores['x']){

        var dotSpan = document.createElement('span')
        dotSpan.innerHTML = 'x';

        var col = document.getElementById('col'+scores['x'][x]);
        col.className = col.className + " ticked";

        col.appendChild(dotSpan);


      }

      for(var x in scores['o']){

        var dotSpan = document.createElement('span')
        dotSpan.innerHTML = 'o';

        var col = document.getElementById('col'+scores['o'][x]);
        col.className = col.className + " ticked";

        col.appendChild(dotSpan);


      }

    }

    function moveMade(player,colNo){


      pause = 0;
      var dotSpan = document.createElement('span')
      dotSpan.innerHTML = player;

      var col = document.getElementById('col'+colNo);
      col.className = col.className + " ticked";

      col.appendChild(dotSpan);


      scores[player].push(parseInt(colNo));

      if(isWinner(scores[player]) == 1)
      {

        alert("player "+player+" wins");
        clearfield();
        
        return;
      }

      if(scores['x'].length > 4 || scores['o'].length > 4 ){

        alert("game tied");

        clearfield();
        return;


      }






      currentTurn = player === 'x' ? 'o' : 'x';
      
      if(currentTurn == playerType && playerType !="spectator")
        {updateStatus("Make your("+currentTurn+") move"); }
      else if(playerType !="spectator")
      {
       updateStatus("Wait for opponents("+currentTurn+") move");
     }
     else{
      updateStatus("you are spectator - Next Move : "+currentTurn);
    }

    


  }


  function create(){

    userName =   document.getElementsByName('username')[0].value;
    room =   document.getElementsByName('roomname')[0].value;

    socket.emit('create room',{'username':userName ,'room':room});

    promptScreen.style.display = "none";
    waitScreen.style.display = "block"; 

  }

  function join(){

    userName =   document.getElementsByName('username')[0].value;
    room =   document.getElementsByName('roomname')[0].value;

    socket.emit('join room',{'username':userName ,'room':room});

    promptScreen.style.display = "none";
    gameScreen.style.display = "block"; 
    
  }




  //Game events
  socket.on('room exists',function(room){
    alert(room + " already taken ");
    userName ="";
    playerType ="";
    room="";
    waitScreen.style.display ="none";
    promptScreen.style.display = "block";
    console.log('room exits');
  });


  socket.on('wrong room',function(room){
    alert(room + " room don't exist ");
    waitScreen.style.display ="none";
    promptScreen.style.display = "block";
    gameScreen.style.display = "none";
    console.log('room exits');
  });



  socket.on('room created',function(data){
   console.log(userName);
   console.log(playerType);
   console.log(room);
   console.log(data);
   console.log('room created');
 });



  
  socket.on('player joined',function(data){
   console.log(data);
   var playerTemp = findByIdValue(data['players'],'username',userName);



   if(playerType=='' && playerTemp['type']=='x'){
    waitScreen.style.display = "none";
    gameScreen.style.display = "block"; 
    updateStatus("your make the first move");
    currentTurn ="x";
    playerType = playerTemp['type'];
    updateGameDetails(userName,room,playerType);

  }else if(playerType=='' && playerTemp['type']=='o'){
    currentTurn ="x";
    playerType = playerTemp['type'];
    updateStatus("wait for other player");
    updateGameDetails(userName,room,playerType);


  }

  else if(playerTemp['type']=='spectator'){

   playerType = 'spectator';
   scores['x'] = data['x'];
   scores['o'] = data['o'];
   updateBoard();
   console.log(playerTemp);
   updateStatus("You are spectator");
   updateGameDetails(userName,room,playerType);




 }

 console.log('player joined');



});



  socket.on('move made',function(data){

    console.log('move made');
    moveMade(data['player'],data['col']);
    console.log(data);
    
  });


  socket.on('close room',function(data){

    alert('player left or disconnected. so closing room');

    clearfield(); 
    waitScreen.style.display ="none";
    promptScreen.style.display = "block";
    gameScreen.style.display = "none";

    userName="";
    room ="";
    playerType="";
    currentTurn=""
    pause = 0 ;


  });


  





  



  



















  function clickFn(){
    console.log(currentTurn);

    if( pause ==1 ) return;

    if(this.classList.contains('ticked')) return ;

    if(playerType != currentTurn)
      return;

    console.log(playerType);

      // var dotSpan = document.createElement('span');
      // dotSpan.innerHTML = playerType;
      
      pause = 1;

      socket.emit('move made',{'room':room,'player':playerType,'col':this.id[3]});



      // this.className = this.className + " ticked";



      

      

      

      console.log(scores);

    };








    function isWinner(playerScores) {

      var winCombos = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]];
      var result =1;
      console.log(playerScores);
      for(var i=0;i<winCombos.length;i++)
      {
        result =1;
        for(var j=0;j<3;j++) {
          if(playerScores.indexOf(winCombos[i][j]) == -1)
          {
            result = 0;
            break;
          }

        }

        if ( result ==1 ) {
          break;
        }
      }

      console.log(result);
      return result;

    }

