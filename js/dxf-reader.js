//Das Array in dem alle Layers gespeichert sind.
drawing = [];

//Ein Assoziatives array  'Layer_name'->Layer_index
layers = [];

available_blocks = [];

function message_to_main(cmd, daten){
	self.postMessage({'cmd': cmd, 'daten': daten});
}

self.onmessage = function(event) {
	 if (event.data.cmd == 'laden'){
	 dxf_laden(event.data.daten);
	 message_to_main('fertig',[drawing,layers,available_blocks]);
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
		dxf_in_lines[a+1] = dxf_in_lines[a+1].replace(/\s/g, "");
		
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
	while (dxf.length > 1){
		var temp_sec = [];
		dxf.shift();	// 0 Section entfernen
		while (dxf[0][1] != "ENDSEC"){
			temp_sec.push(dxf[0]);
			dxf.shift();
		}
		sections.push(temp_sec);
		dxf.shift(); //ENDSEC entfernen
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
	while (Data.length > 1){
		var temp_block = [];
		Data.shift();	// 0 Section entfernen
		while (Data[0][1] != "ENDBLK"){
			temp_block.push(Data[0]);
			Data.shift();
		}
		blocks.push(temp_block);
		Data.shift(); //ENDSEC entfernen
		while ((typeof Data[0] != 'undefined') && (Data[0][0] != "0")){
		Data.shift();
		}
	}
	for (var i = 0; i < blocks.length; i++){
		parse_single_block(blocks[i]);
	}
}

function parse_single_block(block_data){
	var new_block_data = [];
	var i = 0;
	new_block_data[0] = [];
	//message_to_main('echo', block_data);
	for (var a = 0; a < block_data.length; a++){
		if (block_data[a][0] == "0"){
		i = i + 1;
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

function parse_dxf_entities(Data){
	//Vom Anfang zum Ende
	//0 Type
	
	// wenn Type = Polyline -> Unterentities bis SEQEND danach löschen bis 0 Type
	//0 Type
	//POLYLINES sind ein Problem!
	while (Data.length > 1){
		var temp_entity = [];
		var name;
		//if (Data[0][0] != "0") console.log("Entities Error 1");
		name = Data[0][1]
		Data.shift(); //0 Type Zeile löschen
		while ((Data[0][0] != "0") && (Data.length > 1)){
			temp_entity.push(Data[0]);
			Data.shift();
		}
		parse_single_entity(name, temp_entity);
	}
	// if (name == 'POLYLINE'){
		// entity.children = [];
		// var temp_entity2 = [];
		// while ((Data[0][0] != "0") || (Data[0][1] != "SEQEND")) {
			// while (Data[0][0] != "0"){
				// temp_entity.push(Data[0]);
			// }
		// }
}

function parse_dxf_tables(Data){
//console.log('parse tables');
}

function parse_single_entity(entity_name, single_entity){
	//console.log(entity_name);
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
			(fertig.type == "INSERT")){
		drawing[layer(fertig.layer_name)].push(fertig);
		return
	}
	//console.log("Entitytyp wird nicht unterstuetzt:"+entity_name);
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
			fertig.text = fertig.text.slice(1,fertig.text.length).replace(/}/,"");
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
			fertig.x1 = parseFloat(daten[i][1]);
		}
		if (daten[i][0] == "11" ){//x2
			fertig.x2 = parseFloat(daten[i][1]);
		}
		if (daten[i][0] == "20" ){ //y1
			fertig.y1 = parseFloat(daten[i][1]);
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
		if (daten[i][0] == "71" ){ //Verknüpfungspunkt TOP: 1Left 2Center 3Right MIDDLE: 4L 5C 6R Bottom: 7L 8C 9R
			fertig.attachment_p = daten[i][1];
		}
		//daten.shift();
	}
	return fertig;
}