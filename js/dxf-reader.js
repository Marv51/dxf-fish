//Das Array in dem alle Layers gespeichert sind.
drawing = [];

//Ein Assoziatives array  'Layer_name'->Layer_index
layers = [];

available_blocks = [];

meta = [];
meta['nicht_unterstuetzt'] = [];

in_polyline = false;
aktuelle_polyline_id = null;
aktuelle_polyline_layer = null;

function message_to_main(cmd, daten){
	self.postMessage({'cmd': cmd, 'daten': daten});
}

self.onmessage = function(event) {
	 if (event.data.cmd == 'laden'){
	 var jetzt = new Date();
	 meta['start_zeit'] = jetzt;
	 dxf_laden(event.data.daten);
	 jetzt = new Date();
	 meta['stop_zeit'] = jetzt;
	 meta['dauer'] = (meta['stop_zeit'].getTime() - meta['start_zeit'].getTime())  /1000;
	 message_to_main('fertig',[drawing,layers,available_blocks,meta]);
	 self.close();
	 return
	 }
	 throw "Keine gueltige Message an Worker";	 
};

//Einstieg in die Verarbeitung einer dxf-Datei 
// Bekommt dxf-Datei als Text 
function dxf_laden(text){
	
	var dxf = text_in_zeilen_teilen(text);
	delete(text);
	dxf = EOF_entfernen(dxf);
	dxf = split_in_sections(dxf);
	parse_sections(dxf);
}

//Ruft je nach Section Name die entsprechende function auf
function parse_sections(dxf) {
//alert('test');
//console.log(dxf[0][0][1]);
	for (var i=0; i < dxf.length;i++){
		var Section_name = dxf[i][0][1];
		dxf[i].shift();//section Name entfernen 
		
		/*if (Section_name == "HEADER"){
			parse_dxf_header(dxf[i]);
		}
		if (Section_name == "TABLES"){
			parse_dxf_tables(dxf[i]);
		}*/
		if ( Section_name == "BLOCKS") {
			parse_dxf_blocks(dxf[i]);
		}
		if (Section_name == "ENTITIES"){
			parse_dxf_entities(dxf[i]);
		}
	}
	//fertig
}


//Wandelt den gesamten Text in ein 2-Dimensionales-Array um. 
//Zeile 1 -> Array[0][0] ; Z 2 -> [0][1]; Z3->1,0; Z4->1,1; Z5->2,0; 
function text_in_zeilen_teilen(text){
	var dxf_in_lines = text.split(/\r\n|\r|\n/);
	var lines_final = [];
	for ( var a = 0; a < (dxf_in_lines.length-1); a = a + 2){
		//Leerzeichen erden entfernt, ob das Sinn macht?
		dxf_in_lines[a] = dxf_in_lines[a].replace(/\s/g, "");
		dxf_in_lines[a+1] = dxf_in_lines[a+1].replace(/^\s+/g, "");
		
		lines_final.push(Array(dxf_in_lines[a],dxf_in_lines[a+1]));
	}
	return lines_final;
}

//Entfernt EOF
function EOF_entfernen(dxf){
	//Alles nach EOF entfernen
	//console.log(dxf)
	//while (dxf[dxf.length-1] != Array("0","EOF")){
	//dxf.pop();
	//}
	dxf.pop(); //EOF entfernen
	return dxf;
}


//Unterteilt dxf in Sections und entfernt die Sections markierungen
function split_in_sections(dxf){
var sections = [];
	for (var i = 0; i < dxf.length; i++){
		var temp_sec = [];
		i++;	// 0 Section entfernen
		while (dxf[i][1] != "ENDSEC"){
			temp_sec.push(dxf[i]);
			i++;
		}
		sections.push(temp_sec);
	}
	return sections;
}

function parse_dxf_header(Data){
//console.log("parse Header")
	//Probleme mit Zwei Werten für eine Variable -> alles durcheinander
//	dxf_header_vars = Array();
//	for (var i= 0; i < Data.length; i = i+2){
//		dxf_header_vars.push(Array(Data[i][1],Data[i+1][1]));
//	
	//console.log('parse header');
}

//Funktion der man einen Layernamen übergeben kann und die, die Layer_id zurückliefert. 
// Wenn es noch keine Layer mit dem Namen gibt wird eine erstellt.
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

function parse_dxf_blocks(Data){
	//message_to_main('echo','parse_blocks');
	//message_to_main('echo',Data);
var blocks = [];
var i = 0;
	while (i < Data.length){
		var temp_block = [];
		i++;	// 0 Section entfernen
		while (Data[i][1] != "ENDBLK"){
			temp_block.push(Data[i]);
			i++;
		}
		blocks.push(temp_block);
		i++; //ENDSEC entfernen
		while ((typeof Data[i] != 'undefined') && (Data[i][0] != "0")){
			i++;
		}
	}
	for (var i = 0; i < blocks.length; i++){
		parse_single_block(blocks[i]);
	}
}

function parse_dxf_entities(Data){
	//Vom Anfang zum Ende
	//0 Type
	
	// wenn Type = Polyline -> Unterentities bis SEQEND danach löschen bis 0 Type
	//0 Type
	//POLYLINES sind ein Problem!
	var i = 0;
	while (i < Data.length){
		var temp_entity = [];
		var name;
		//if (Data[0][0] != "0") console.log("Entities Error 1");
		name = Data[i][1];
		if (name == "SEQEND") in_polyline = false;
		i++; //0 Type Zeile löschen
		while ((i < Data.length) && (Data[i][0] != "0")){
			temp_entity.push(Data[i]);
			i++;
		}
		parse_single_entity(name, temp_entity);
	}
}


function parse_single_block(block_data){
	var new_block_data = [];
	var i = 0;
	new_block_data[0] = [];
	//message_to_main('echo', block_data);
	for (var a = 0; a < block_data.length; a++){
		if (block_data[a][0] == "0"){
		i++;
		new_block_data[i] = [];
		}
		new_block_data[i].push(block_data[a]); 
	}
	if (new_block_data.length < 3) return;

	new_block_data.pop();
	//message_to_main('echo',new_block_data);
	var this_block = {}
	
	this_block.handle = dxf_group_codes_parse(new_block_data[0]);
	
	this_block.elemente = [];
	for (var a = 1; a < new_block_data.length;a++){
		this_block.elemente.push(dxf_group_codes_parse(new_block_data[a]));
	}
	//message_to_main('echo',this_block);
	available_blocks.push(this_block);
}

function parse_dxf_tables(Data){
//console.log('parse tables');
}

function parse_single_entity(entity_name, single_entity){
	var fertig = dxf_group_codes_parse(single_entity)
	fertig.type = entity_name;


	//Hier alle Entity typen auflisten

	// if (entity_name == "POLYLINE"){
		// dxf_polyline(single_entity);
		// return
	// }

	// var daten = dxf_group_codes_parse(single_entity);
	if     ((fertig.type == "TEXT")  ||
			(fertig.type == "MTEXT") ||
			(fertig.type == "ARC")   ||
			(fertig.type == "CIRCLE")||
			(fertig.type == "XLINE") ||
			(fertig.type == "LINE")  ||
			(fertig.type == "VERTEX")  ||
			(fertig.type == "POLYLINE")  ||
			(fertig.type == "LWPOLYLINE")  ||
			(fertig.type == "INSERT")){
		if (in_polyline == true){
			drawing[layer(aktuelle_polyline_layer)][aktuelle_polyline_id].elemente.push(fertig);
		}else {
		var id = (drawing[layer(fertig.layer_name)].push(fertig) - 1);
		//message_to_main('echo', id);
		}
		if ((fertig.type == "POLYLINE")){
			in_polyline = true;
			aktuelle_polyline_id = id;
			aktuelle_polyline_layer = fertig.layer_name;
			drawing[layer(aktuelle_polyline_layer)][aktuelle_polyline_id].elemente = [];
			//message_to_main('echo', drawing);
		}
		if (fertig.type == "SEQEND"){
			in_polyline = false;
			//message_to_main('echo', 'SEQEND');
		}
		return
	}
	
	for (var a = 0; a < meta['nicht_unterstuetzt'].length;a++){
		if (meta['nicht_unterstuetzt'][a] == fertig.type){
		return
		}
	}
	meta['nicht_unterstuetzt'].push(fertig.type);
}

function dxf_group_codes_parse(daten){
	var fertig = {};
	for (var i = 0; i < daten.length; i++){
	//while (daten.length != 0){
		if (daten[i][0] == "0" ){ //Element Typ
			fertig.entity_typ = daten[i][1];
		}
		if (daten[i][0] == "1" ){ //text erste 250 zeichen
			fertig.text = daten[i][1];
			fertig.text = fertig.text.replace(/{|}/g,"");
		}
		if (daten[i][0] == "2" ){ //Insert Block Name
			fertig.insert_block = daten[i][1];
		}
		if (daten[i][0] == "3" ){ //Block name
			fertig.block_name = daten[i][1];
		}
		if (daten[i][0] == "6" ){ //line type
			fertig.line_typ = daten[i][1];
		}
		if (daten[i][0] == "8" ){ //layer_name
			fertig.layer_name = daten[i][1];
			//layer(fertig.layer_name);
		}
		if (daten[i][0] == "62" ){ //farbe
			fertig.color = daten[i][1];
		}
		if (daten[i][0] == "10" ){//x1
			if (typeof fertig.x1 == "undefined")
			fertig.x1 = parseFloat(daten[i][1])
			else if (typeof fertig.x1_extra == "undefined"){
			fertig.x1_extra = [parseFloat(daten[i][1])];
			}else{
			fertig.x1_extra.push(parseFloat(daten[i][1]));
			}
		}
		if (daten[i][0] == "11" ){//x2
			fertig.x2 = parseFloat(daten[i][1]);
		}
		if (daten[i][0] == "20" ){ //y1
			if (typeof fertig.y1 == "undefined")
			fertig.y1 = parseFloat(daten[i][1])
			else if (typeof fertig.y1_extra == "undefined"){
			fertig.y1_extra = [parseFloat(daten[i][1])];
			}else{
			fertig.y1_extra.push(parseFloat(daten[i][1]))
			}
		}
		if (daten[i][0] == "21" ){ //y2
			fertig.y2 = parseFloat(daten[i][1]);
		}
		if (daten[i][0] == "39" ){ //thickness
			fertig.thickness = daten[i][1];
		}
		if (daten[i][0] == "40" ){ //radius + text height
			fertig.radius = parseFloat(daten[i][1]);
		}
		if (daten[i][0] == "41" ){ //X Scale
			fertig.x_scale = parseFloat(daten[i][1]);
		}
		if (daten[i][0] == "42" ){ //Y Scale
			fertig.y_scale = parseFloat(daten[i][1]);
		}
		if (daten[i][0] == "50" ){ //start winkel
			fertig.start_winkel =  parseFloat(daten[i][1]);
		}
		if (daten[i][0] == "51" ){ //end winkel
			fertig.end_winkel =  parseFloat(daten[i][1]);
		}
		if (daten[i][0] == "70" ){ //Polyline Optionen 1 = closed
			if (daten[i][1] == "1")
			fertig.closed = true;
		}
		if (daten[i][0] == "71" ){ //Verknüpfungspunkt TOP: 1Left 2Center 3Right MIDDLE: 4L 5C 6R Bottom: 7L 8C 9R
			fertig.attachment_p = daten[i][1];
		}
		//daten.shift();
	}
	return fertig;
}