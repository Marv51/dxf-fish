//Das Array in dem alle Layers gespeichert sind.
drawing = [];

//Ein Assoziatives array  'Layer_name'->Layer_index
layers = [];

view_x = 150;
view_y = 500;
view_scale = 12;

function activate_controls(){

	add_layer_auswahl();

	$("#left").click(function(){
		view_x = view_x - 10;
		redraw();
	});
	
	$("#right").click(function(){
		view_x = view_x + 10;
		redraw();
	});
	
	$("#down").click(function(){
		view_y = view_y + 10;
		redraw();
	});
	
	$("#up").click(function(){
		view_y = view_y - 10;
		redraw();
	});
	
	$("#zoom_in").click(function(){
		view_scale = view_scale + 1;
		redraw();
	});
	
	$("#zoom_out").click(function(){
		view_scale = view_scale - 1;
		redraw();
	});

	$('.layer_auswahl').change(function(e){
			var layer_id = e.currentTarget.id.substr(6,(e.currentTarget.id.length-1));
			if (layers[layer_id].active == true){
			layers[layer_id].active = false;
			}
			else 
			layers[layer_id].active = true;
			redraw();
	});
	
	sprinkler_starten();
}

function redraw(){
	ctx.clearRect(0, 0, 1000, 1000);
	//Für jedes Layer
	//var i = 3;
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
//console.log(element);
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

}

function draw_text(element){
	ctx.font = "11px Times New Roman";
	ctx.fillStyle = "Black";
	ctx.fillText(element.text, x(element.x1), y(element.y1));
}

function draw_arc(element){
	ctx.beginPath();
	ctx.arc(x(element.x1),y(element.y1),scale(element.radius),(Math.PI/180)*element.start_winkel,(Math.PI/180)*element.end_winkel,true);
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
	return scale(wert)+view_x;
}
function y(wert){
	return scale(wert)+view_y;
}

function scale(wert){
	return wert*view_scale;
}
