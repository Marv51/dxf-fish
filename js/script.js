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
var canvas = document.getElementById('canvas');
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
		console.log(e.clientX+" "+e.clientY);
		ctx.beginPath();
		ctx.arc(e.layerX-2.5,e.layerY-2.5,5,0,(Math.PI/180)*360,true);
		ctx.fill();
		console.log(e);
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
		 finish_loading();
		 draw();
		 return
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