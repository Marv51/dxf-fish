function extround(zahl,n_stelle) {
zahl = (Math.round(zahl * n_stelle) / n_stelle);
    return zahl;
}

//functionen aus reader --> müssen in gemeinsame Datei
function layer(name){
	var return_id = -1;
	for (var t = 0; t < layers.length;t++){
		if (layers[t].name == name){
			return_id = t;
		}
	}
	if (return_id == -1){
		var id = drawing.length;
		layers[id] = {};
		layers[id].id = id;
		layers[id].name = name
		layers[id].active = true;
		drawing[layers[id].id] = [];
		return_id = id;
	}
	return return_id;
}


//Das Array in dem alle Layers gespeichert sind.
drawing = [];

//Ein Assoziatives array  'Layer_name'->Layer_index
layers = [];

//Standartwerte, werden für den ersten Frame verwendet, dann autoscale und redraw
view_x = 150;
view_y = 400;
view_scale = 12;

//Variablen in denen die Dimension des Modells gespeichert werden
model_min_x = 0;
model_max_x = 0;
model_min_y = 0;
model_max_y = 0;

//Bem ersten Frame soll hinterher die Skala und der Ursprung angepasst werden
auto_scale = true;


function activate_controls(){
	
	add_layer_auswahl();
	
	document.getElementById('canvas').addEventListener('DOMMouseScroll', function(e)
		{
			if (e.detail > 0){
				view_scale = view_scale - 2;
				redraw();
			} else {
				view_scale = view_scale+ 2;
				redraw();
			}
			e.preventDefault();
		}, false);
		
	document.getElementById('canvas').addEventListener('mousewheel', function(e)
		{
			if (e.wheelDelta < 0){
				view_scale = view_scale - 1;
				redraw();
			} else {
				view_scale = view_scale+ 1;
				redraw();
			}
			e.preventDefault();
		}, false);
			
	document.getElementById('canvas').addEventListener('mousedown', function(e){
			mousemove_x = e.clientX;
			mousemove_y = e.clientY;
			document.getElementById('canvas').addEventListener('mousemove', mousemove, false);
		},false);
	document.getElementById('canvas').addEventListener('mouseup', function(e){
			document.getElementById('canvas').removeEventListener('mousemove', mousemove, false);
		}, false);	
	window.addEventListener('resize', function(e){
			canvas.width = window.innerWidth-15;
			canvas.height = window.innerHeight-15;
			redraw();
		}, false);
	document.getElementById('canvas').addEventListener('mousemove', fangen, false);
	if (auto_scale)
	do_auto_scale();
}

function fangen(ev){
redraw();
ctx.beginPath();
var click = wo_click(ev);
var element = nach_element_suchen(un_x(click[0]),un_y(click[1]));
if (element != null){
	ctx.strokeStyle = "orange";
	ctx.arc(x(element[0]),y(element[1]),2,0,2*Math.PI);
}else{
	ctx.strokeStyle = "black";
	ctx.arc(click[0],click[1],2,0,2*Math.PI);
};
ctx.stroke();
ctx.strokeStyle = "black";
}

function ist_layer_aktiv(layer_id){
	return layers[layer_id].active;
}

function nach_element_suchen(x,y){
	var element = null;
	for (var i = 0; i < drawing.length; i++){
		if (ist_layer_aktiv(i)){
			for (var a = 0; a < drawing[i].length; a++){
				if ((extround(x,10) == extround(drawing[i][a].x1,10)) && (extround(y,10) == extround(drawing[i][a].y1,10))){
					element = [drawing[i][a].x1,drawing[i][a].y1];
					return element;
				}
				if ((extround(x,10) == extround(drawing[i][a].x2,10)) && (extround(y,10) == extround(drawing[i][a].y2,10))){
					element = [drawing[i][a].x2,drawing[i][a].y2];
					return element;
				}
			}
		}
	}
	return null;
}

function mousemove(e){
	view_x = view_x - (mousemove_x - e.clientX);
	view_y = view_y - (mousemove_y - e.clientY);
	mousemove_x = e.clientX;
	mousemove_y = e.clientY;
	redraw();
}

function do_auto_scale(){
	auto_scale = false;
	ctx.beginPath();
	ctx.arc(x(0)-2.5,y(0)-2.5,5,0,(Math.PI/180)*360,true);
	ctx.stroke();
	var breite = model_max_x - model_min_x;
	var scale_nach_breite = (canvas.width-10)/breite;
	var hoehe = model_max_y - model_min_y;
	var scale_nach_hoehe = (canvas.height-10)/hoehe;
	if (scale_nach_hoehe < scale_nach_breite) {
		view_scale = scale_nach_hoehe;
	} else {
		view_scale = scale_nach_breite;
	}
	view_x = - scale(model_min_x)+5;
	view_y = (- scale(model_min_y))/2 + 5;	
	redraw();
}

function redraw(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//Für jedes Layer
	//var i = 3;
	//console.log( available_blocks);
	draw_massstab();
	for (var i = 0; drawing.length > i; i++){
		if (layers[i].active){
			for (var a = 0; drawing[i].length > a; a++){
				element_zeichnen(drawing[i][a]);
			}
		}
	}
}

function add_layer_auswahl(){
	var text = ""
	for (var m = 0; m < layers.length;m++){
		text = text + "<span class='layer submenuitem'><input type='checkbox' checked='checked' class='layer_auswahl' id='layer-"+m+"' value='"+layers[m].name+"' />"+layers[m].name.replace(/_/g," ")+"</span>";
	}
	$('#layers').remove();
	$("#menu").append("<div id='layers'><div id='layer_button'>Ebenen</div><div id='layer_auswahl_container' class='submenu'><div id='layer_messen'>"+text+"</div></div></div>");
	$("#layer_button").toggle(function(){
	$("#layer_auswahl_container").css("height", document.getElementById('layer_messen').clientHeight + "px");
	},function(){
	$("#layer_auswahl_container").css("height","0");
	});
	$('.layer_auswahl').change(function(e){
		var layer_id = e.currentTarget.id.substr(6,(e.currentTarget.id.length-1));
		if (layers[layer_id].active == true){
		layers[layer_id].active = false;
		}
		else layers[layer_id].active = true;
		
		redraw();
	});
}

function draw(){
	redraw();
	activate_controls();
	hook('finished_draw');
}

function element_zeichnen(element){
	if (element.type == "LINE"){
		draw_line(element);
		return
	}
	if (element.type == "XLINE"){
		draw_line(element);
		return
	}
	if (element.type == "ARC"){
		draw_arc(element);
		return
	}
	if (element.type == "CIRCLE"){
		draw_circle(element);
		return
	}
	if (element.type == "TEXT"){
		draw_text(element);
		return
	}
	if (element.type == "MTEXT"){
		draw_text(element);
		return
	}
	if (element.type == "INSERT"){
		draw_insert(element);
		return
	}
	if (element.type == "POLYLINE"){
		draw_polyline(element);
		return
	}
	if (element.type == "LWPOLYLINE"){
		draw_lwpolyline(element);
		return
	}
	hook('element_zeichnen',element)
}

function draw_insert(element){
var i = 0;
	//console.log(element.insert_block);
	while (element.insert_block != available_blocks[i].handle.block_name){
		i++;
		if (available_blocks.length == i){
		console.warn("Block nicht gefunden: " + element.insert_block );
		return
		}	
	}
	temp_elemente = available_blocks[i].elemente;
		
	for (var a = 0; a < temp_elemente.length; a++){
		temp_elemente[a].type = temp_elemente[a].entity_typ;
		if ( typeof temp_elemente[a].x_scale == "undefined" )
		temp_elemente[a].x_scale = 1;
		if ( typeof temp_elemente[a].y_scale == "undefined" )
		temp_elemente[a].y_scale = 1;
		
		if ( typeof temp_elemente[a].org_x1 == "undefined" ) {
			temp_elemente[a].org_x1 = temp_elemente[a].x1;
			}
		temp_elemente[a].x1 = element.x1 + rotate_x(temp_elemente[a].org_x1,temp_elemente[a].org_y1,element.start_winkel,temp_elemente[a].x_scale);
		
		if ( typeof temp_elemente[a].org_x2 == "undefined" ) {
			temp_elemente[a].org_x2 = temp_elemente[a].x2;
			}
		temp_elemente[a].x2 = element.x1 + rotate_x(temp_elemente[a].org_x2,temp_elemente[a].org_y2,element.start_winkel,temp_elemente[a].x_scale);
		
		if ( typeof temp_elemente[a].org_y1 == "undefined" ) {
			temp_elemente[a].org_y1 = temp_elemente[a].y1;
			}
		temp_elemente[a].y1 = element.y1 + rotate_y(temp_elemente[a].org_x1,temp_elemente[a].org_y1,element.start_winkel,temp_elemente[a].y_scale);
		
		if ( typeof temp_elemente[a].org_y2 == "undefined" ) {
			temp_elemente[a].org_y2 = temp_elemente[a].y2;
			}
		temp_elemente[a].y2 = element.y1 + rotate_y(temp_elemente[a].org_x2,temp_elemente[a].org_y2,element.start_winkel,temp_elemente[a].y_scale);

		 if ((typeof temp_elemente[a].org_start_winkel == "undefined") && (element.start_winkel)){
			 temp_elemente[a].org_start_winkel = temp_elemente[a].start_winkel;
			 temp_elemente[a].start_winkel = temp_elemente[a].start_winkel + element.start_winkel;
		 }
		 if ((typeof temp_elemente[a].org_end_winkel == "undefined") && (element.start_winkel)){
			 temp_elemente[a].org_end_winkel = temp_elemente[a].end_winkel;
			 temp_elemente[a].end_winkel = temp_elemente[a].end_winkel + element.start_winkel;
		 }
		element_zeichnen(temp_elemente[a]);
	}	
}

function draw_polyline(element){
	ctx.beginPath();
	draw_vertex(element.elemente[0], true);
	for (var i = 1; i < element.elemente.length; i++){
		draw_vertex(element.elemente[i], false);
	}
	if (element.closed == true){
		draw_vertex(element.elemente[0],false);
	}
	ctx.stroke();
}

function draw_lwpolyline(element){
	ctx.beginPath();
	ctx.moveTo(x(element.x1),y(element.y1));
	for (var i = 0; i < element.x1_extra.length; i++){
		ctx.lineTo(x(element.x1_extra[i]), y(element.y1_extra[i]));
	}
	if (element.closed == true){
		ctx.lineTo(x(element.x1),y(element.y1));
	}
	ctx.stroke();
}

function draw_vertex(element, first){
	if (first)
	ctx.moveTo(x(element.x1),y(element.y1));
	else
	ctx.lineTo(x(element.x1),y(element.y1));
}

function rotate_x(x_org,y_org,a_deg,s){
	if (!a_deg) return x_org;
	a_rad = (a_deg) * Math.PI / 180; 
	return x_org*Math.cos(a_rad) - y_org*Math.sin(a_rad);
}

function rotate_y(x_org,y_org,a_deg,s){
	if (!a_deg) return y_org;
	a_rad = (a_deg) * Math.PI / 180; 
	return x_org*Math.sin(a_rad) + y_org*Math.cos(a_rad);
}

function draw_text(element){
	if ((element.attachment_p == 2)||(element.attachment_p == 5)||(element.attachment_p == 8)){
		ctx.textAlign = "center";
	}
	if ((element.attachment_p == 1)||(element.attachment_p == 4)||(element.attachment_p == 7)){
		ctx.textAlign = "left";
	}
	if ((element.attachment_p == 3)||(element.attachment_p == 6)||(element.attachment_p == 9)){
		ctx.textAlign = "right";
	}
	if (element.attachment_p <= 3){
		ctx.textBaseline = "bottom";
	}
	if (element.attachment_p >= 7 ){
		ctx.textBaseline = "top";
	}
	if ((element.attachment_p < 7 ) && (element.attachment_p > 3 )){
		ctx.textBaseline = "middle";
	}
	var text = element.text.replace(/(\\f|\\H)[^;]+;/g,"");
	var text = text.replace(/\\A1;/g,"");
	var text = text.replace(/\\S2\^[\s]+;/g,"²");
	var text = text.split(/\\P/);
	//var text = element.text.split(/\\P/);
	ctx.font = scale(element.radius) + "px Times New Roman";
	ctx.fillStyle = "Black";
	for (var a = 0; a < text.length; a++){
		ctx.fillText(text[a], x(element.x1), y(element.y1-a*element.radius));
	}
}

function draw_arc(element){
	ctx.beginPath();
	//console.log(element.start_winkel+" bis "+element.end_winkel+" org:"+element.org_start_winkel+" bis "+element.org_end_winkel );
	var anticlockwise = true; //Aus Header auslesen!
	ctx.arc(x(element.x1),y(element.y1),scale(element.radius),(Math.PI/180)*(360-element.start_winkel),(Math.PI/180)*(360-element.end_winkel),anticlockwise);
	ctx.stroke();
}

function draw_circle(element){
	element.start_winkel = 0;
	element.end_winkel = 360;
	draw_arc(element);
}

//In Viewer nicht verwendet
function draw_rect(element){
	ctx.beginPath();
	ctx.strokeRect(x(element.x1),y(element.y1),scale(element.x2-element.x1),scale(element.y1-element.y2) );
	if (typeof element.sprinkler != "undefined"){
		for (var i = 0; element.sprinkler.length > i; i++){
			element_zeichnen(element.sprinkler[i]);
		}
	}
}

function draw_line(element){
	ctx.beginPath();
	ctx.moveTo(x(element.x1),y(element.y1));
	ctx.lineTo(x(element.x2),y(element.y2));
	ctx.stroke();
}

function x(wert){
	if (wert < model_min_x) {
		model_min_x = wert;
	};
	if (wert > model_max_x) {
		model_max_x = wert;
	};
	return scale(wert)+view_x;
}

function un_x(wert){
	return unscale(wert-view_x);
}

function y(wert){
	if (wert < model_min_y) model_min_y = wert;
	if (wert > model_max_y) model_max_y = wert;
	return  - (scale(wert))+view_y;
}

function un_y(wert){
	return unscale(-(wert-view_y));
}

function scale(wert){
	return wert*view_scale;
}

function unscale(wert){
	return wert / view_scale;
}

function draw_massstab()
{
	//Vertikal
	ctx.beginPath();
	ctx.moveTo(0, canvas.height-1);
	ctx.lineTo(scale(10), canvas.height-1);
	for (var a = 0; a <= 10; a++){
		if ( a % 10 == 0 ){ var strich = 7 } 
		else { if ( a % 5 == 0 ) {var strich = 5;}
		else { var strich = 2;} };
		ctx.moveTo(scale(a), canvas.height-1);
		ctx.lineTo(scale(a), canvas.height-(1+strich));
	}
	ctx.stroke();
	//Horizontal
	ctx.beginPath();
	ctx.moveTo(0, canvas.height);
	ctx.lineTo(0, canvas.height - scale(10));
	for (var a = 0; a <= 10; a++){
		if ( a % 10 == 0 ){ var strich = 7 } 
		else { if ( a % 5 == 0 ) {var strich = 5;}
		else { var strich = 2;} };
		ctx.moveTo(0, canvas.height-scale(a));
		ctx.lineTo(strich, canvas.height - scale(a));
	}
	ctx.stroke();
}