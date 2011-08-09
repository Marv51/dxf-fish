//Das Array in dem alle Layers gespeichert sind.
drawing = [];

//Ein Assoziatives array  'Layer_name'->Layer_index
layers = [];

//Canvas Dimensiones -> Sollte automatisch gehen
canvas_breite = 1000;
canvas_hoehe = 600;

//Standartwerte, werden f�r den ersten Frame verwendet, dann autoscale und redraw
view_x = 150;
view_y = canvas_hoehe/2;
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
		
	$('.layer_auswahl').change(function(e){
			var layer_id = e.currentTarget.id.substr(6,(e.currentTarget.id.length-1));
			if (layers[layer_id].active == true){
			layers[layer_id].active = false;
			}
			else 
			layers[layer_id].active = true;
			redraw();
	});
	if (auto_scale)
	do_auto_scale();
	sprinkler_starten();
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
	var scale_nach_breite = (canvas_breite-10)/breite;
	var hoehe = model_max_y - model_min_y;
	var scale_nach_hoehe = (canvas_hoehe-10)/hoehe;
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
	ctx.clearRect(0, 0, 1000, 600);
	//F�r jedes Layer
	//var i = 3;
	//console.log( available_blocks);
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
		text = text + "<input type='checkbox' checked='checked' class='layer_auswahl' id='layer-"+m+"' value='"+layers[m].name+"' />"+layers[m].name+"</br>";
	}
	$("body").append(text);
}

function draw(){
	redraw();
	activate_controls();
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
		//console.log(temp_elemente[a].start_winkel);
		//console.log(winkel_in_rad);
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
		//console.log(temp_elemente[a]);
		// if ((typeof temp_elemente[a].org_start_winkel == "undefined") && (element.start_winkel)){
			// temp_elemente[a].org_start_winkel = temp_elemente[a].start_winkel;
			// temp_elemente[a].start_winkel = temp_elemente[a].start_winkel + element.start_winkel;
		// }
		// if ((typeof temp_elemente[a].org_end_winkel == "undefined") && (element.end_winkel)){
			// temp_elemente[a].org_end_winkel = temp_elemente[a].end_winkel;
			// temp_elemente[a].end_winkel = temp_elemente[a].end_winkel + element.start_winkel;
		// }
		element_zeichnen(temp_elemente[a]);
	}	
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
	ctx.font = scale(element.radius) + "px Times New Roman";
	ctx.fillStyle = "Black";
	ctx.fillText(element.text, x(element.x1), y(element.y1));
}

function draw_arc(element){
	ctx.beginPath();
	console.log(element.start_winkel+" bis "+element.end_winkel+" org:"+element.org_start_winkel+" bis "+element.org_end_winkel );
	var clockwise = false; //Aus Header auslesen!
	ctx.arc(x(element.x1),y(element.y1),scale(element.radius),(Math.PI/180)*(180+element.start_winkel),(Math.PI/180)*(180+element.end_winkel),clockwise);
	ctx.stroke();
}

function draw_circle(element){
	element.start_winkel = 0;
	element.end_winkel = 360;
	draw_arc(element);
}

function draw_line(element){
	ctx.beginPath();
	ctx.moveTo(x(element.x1),y(element.y1));
	ctx.lineTo(x(element.x2),y(element.y2));
	ctx.stroke();
}

// function dxf_polyline(daten){
	// while (daten[0][0] != "0"){
		// //Polyline_Daten interpretieren
		// daten.shift();
	// }
	// ctx.beginPath();
	// daten.shift();
	// var vertex_daten = Array();
	// while (daten.length > 0){
		// if (daten[0][0] == "0"){
			// dxf_vertex(vertex_daten);
			// vertex_daten = Array()
		// } else {
			// vertex_daten.push(daten[0])
		// }
		// daten.shift();
	// }
// }

// function dxf_vertex(daten){
	// daten = dxf_group_codes_parse(daten);
	// ctx.lineTo(x(daten['10']),y(daten['20']));
	// ctx.stroke();
// }

function x(wert){
	if (wert < model_min_x) {
		model_min_x = wert;
	};
	if (wert > model_max_x) {
		model_max_x = wert;
	};
	return scale(wert)+view_x;
}

function y(wert){
	if (wert < model_min_y) model_min_y = wert;
	if (wert > model_max_y) model_max_y = wert;
	return  - (scale(wert))+view_y;
}

function scale(wert){
	return wert*view_scale;
}
