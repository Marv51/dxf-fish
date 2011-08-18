var canvas;

var hooks = [];

//Plugin API
//hook(name[, argumente]); aufrufen um alle mit register_hook
// registrierten Funktionen auszuführen
// Argumente sind freiwillig und werden in beliebiger Anzahl
// an die Funktion weitergegeben
function hook(name){
	if (typeof hooks[name] != "undefined"){
		for (var a = 0; hooks[name].length > a; a++){
		window[hooks[name][a]](hook.arguments);
		}
	}
}
//Plugin API
//register_hook(hook_name, funktions_name)
//In Addon aufrufen um Funktion mit Name auszuführen
function register_hook(name, function_name){
	if (typeof hooks[name] == "undefined"){
		hooks[name] = [];
	}
	hooks[name].push(function_name);
}
//Script mit "Datei" als Name laden.
// Datei kann relative Pfade zum Stammverzeichnis enthalten
function load_script(datei){
document.write("<script type='text/javascript' src='"+datei+"'></script>");
}

function load_css(datei){
document.write('<link rel="stylesheet" type="text/css" media="screen" href="'+datei+'">');
}

function sqr(wert){
return wert*wert;
}

function un_komma(string){
return string.replace(/\,/,".");
}

function komma(number){
return number.replace(/\./,",");
}

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
canvas = document.getElementById('canvas');
 canvas.width = window.innerWidth -15;
 canvas.height = window.innerHeight -15; 
 ctx = canvas.getContext('2d');
var dropbox = document.body;
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);
dropbox.addEventListener("dragexit", dragleave, false);
dropbox.addEventListener("dragend", dragleave, false);
console.log('Eventlisteners sind da!');
});

function wo_click(e){
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
		return [x,y];
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