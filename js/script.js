var canvas;

function dragenter(e) {
  $("#lassmichfallen").fadeIn();
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  $("#lassmichfallen").stop().fadeIn();
  e.stopPropagation();
  e.preventDefault();
}

function dragleave(e) {
	$("#lassmichfallen").fadeOut();
}

function drop(e) {
//alert('drop');
	var dropbox = document.body;
	dropbox.removeEventListener("dragenter", dragenter, false);
	dropbox.removeEventListener("dragover", dragover, false);
	dropbox.removeEventListener("drop", drop, false);
	dropbox.removeEventListener("dragexit", dragleave, false);
	dropbox.removeEventListener("dragend", dragleave, false);
	$("#lassmichfallen").remove();
		
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;

  handleFiles(files);
}

function handleFiles(files) {
	 var f = files[0];
	 var reader = new FileReader();
      reader.onload = function(e) {
	  dxf_lesen(e.target.result);
	  };
      reader.readAsText(f);
}

$(function(){
$('#oeffnen')
canvas = document.getElementById('canvas');
 canvas.width = window.innerWidth -3;
 canvas.height = window.innerHeight -3; 
 ctx = canvas.getContext('2d');
var dropbox = document.body;
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);
dropbox.addEventListener("dragexit", dragleave, false);
dropbox.addEventListener("dragend", dragleave, false);
console.log('Eventlisteners sind da!');
});

function sprinkler_starten(){
		$("#canvas").click(function(e){
		//console.log(e.clientX+" "+e.clientY);
		ctx.beginPath();
		var x;
		var y;
		if (e.pageX || e.pageY) { 
		  x = e.pageX;
		  y = e.pageY;
		}
		else { 
		  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
		  y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
		} 
		x -= document.getElementById('canvas').offsetLeft;
		y -= document.getElementById('canvas').offsetTop;

		ctx.arc(x-1,y-1,1,0,(Math.PI/180)*360,true);
		ctx.fillStyle = "orange";
		ctx.fill();
		//console.log(e);
	});
}

function dxf_lesen(text){
worker = new Worker("js/dxf-reader.js");
worker.addEventListener('message',message_from_worker, false);
worker.addEventListener('error',error_in_worker, false);
message_to_worker('laden',text);
show_loading();
}

function message_to_worker(cmd, daten){
	worker.postMessage({'cmd': cmd, 'daten': daten});
}

function message_from_worker(event){
	if (event.data.cmd == 'fertig'){
		 drawing = event.data.daten[0];
		 layers = event.data.daten[1];
		 available_blocks = event.data.daten[2];
		 meta = event.data.daten[3];
		 //console.log(nicht_unterstuetzt);
		 if (meta['nicht_unterstuetzt'].length != 0) $('body').append("<div class='meldung'><div class='meldung_schliessen'>x</div>Folgende Elemente werden nicht unterstützt: " + meta['nicht_unterstuetzt'].toString());
		 $(".meldung_schliessen").click(function(){
			$(".meldung").remove();
		});
		 console.log('Verarbeitungszeit: ' + meta['dauer']);
		 finish_loading();
		 draw();
		 return
	 }
	 if (event.data.cmd == 'echo'){
		console.log(event.data.daten);
	 }
}

function error_in_worker(){

}

function show_loading(){
$('body').addClass("overlay").append("<img id='loader' src='images/ajax-loader.gif' />");
}

function finish_loading(){
$("#loader").remove();
$('body').removeClass("overlay");
}