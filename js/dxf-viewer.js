//Das Array in dem alle Layers gespeichert sind.
drawing = [];

//Ein Assoziatives array  'Layer_name'->Layer_index
layers = [];

canvas_breite = 1000;
canvas_hoehe = 600;

view_x = 150;
view_y = canvas_hoehe/2;
view_scale = 12;

model_min_x = 0;
model_max_x = 0;
model_min_y = 0;
model_max_y = 0;

auto_scale = true;

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
	
	document.getElementById('canvas').addEventListener('DOMMouseScroll', function(e)
		{
			if (e.detail > 0){
				view_scale = view_scale + 1;
				redraw();
			} else {
				view_scale = view_scale- 1;
				redraw();
			}
			e.preventDefault();
		}, false);
	document.getElementById('canvas').addEventListener('mousewheel', function(e)
		{
			if (e.wheelDelta < 0){
				view_scale = view_scale + 1;
				redraw();
			} else {
				view_scale = view_scale- 1;
				redraw();
			}
			e.preventDefault();
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

function do_auto_scale(){
	console.log("min_y"+model_min_y+"max_y"+model_max_y+"min_x"+model_min_x+"max_x"+model_max_x)
	auto_scale = false;
	//ctx.fillStyle = "rgb(200,0,0)";
    //ctx.fillRect (x(model_min_x), y(model_min_y), x(model_max_x), y(model_max_y));
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
	console.log(view_scale);
	view_x = - scale(model_min_x)+5;
	view_y = (- scale(model_min_y))/2 + 5;	
	redraw();
}

function redraw(){
	ctx.clearRect(0, 0, 1000, 600);
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
