//Das Array in dem alle Layers gespeichert sind.
drawing = [];

//Ein Assoziatives array  'Layer_name'->Layer_index
layers = [];

function message_to_main(cmd, daten){
	self.postMessage({'cmd': cmd, 'daten': daten});
}

self.onmessage = function(event) {
	 if (event.data.cmd == 'laden'){
	 dxf_laden(event.data.daten);
	 message_to_main('fertig',[drawing,layers]);
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
	for (var i=0; i< dxf.length;i++){
		var Section_name = dxf[i][0][1];
		dxf[i].shift();//section Name entfernen 
		if (Section_name == "HEADER"){
			parse_dxf_header(dxf[i]);
		}
		if (Section_name == "TABLES"){
			parse_dxf_tables(dxf[i]);
		}
		if (Section_name == "ENTITIES"){
			parse_dxf_entities(dxf[i]);
		}
		dxf.shift();
	}
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

//Entfernt EOF und alles danach
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
			(fertig.type == "LINE")){
		drawing[layer(fertig.layer_name)].push(fertig);
		return
	}
	//console.log("Entitytyp wird nicht unterstuetzt:"+entity_name);
}

function dxf_group_codes_parse(daten){
	var fertig = {};
	while (daten.length != 0){
		if (daten[0][0] == "1" ){ //text erste 250 zeichen
			fertig.text = daten[0][1];
			fertig.text = fertig.text.slice(1,fertig.text.length).replace(/}/,"");
		}
		if (daten[0][0] == "8" ){ //layer_name
			fertig.layer_name = daten[0][1];
			layer(fertig.layer_name);
		}
		if (daten[0][0] == "6" ){ //line type
			fertig.line_typ = daten[0][1];
		}
		if (daten[0][0] == "62" ){ //farbe
			fertig.color = daten[0][1];
		}
		if (daten[0][0] == "10" ){//x1
			fertig.x1 = parseFloat(daten[0][1]);
		}
		if (daten[0][0] == "11" ){//x2
			fertig.x2 = parseFloat(daten[0][1]);
		}
		if (daten[0][0] == "20" ){ //y1
			fertig.y1 = parseFloat(daten[0][1]);
		}
		if (daten[0][0] == "21" ){ //y2
			fertig.y2 = parseFloat(daten[0][1]);
		}
		if (daten[0][0] == "39" ){ //thickness
			fertig.thickness = daten[0][1];
		}
		if (daten[0][0] == "40" ){ //radius
			fertig.radius = parseFloat(daten[0][1]);
		}
		if (daten[0][0] == "50" ){ //start winkel
			fertig.start_winkel = daten[0][1];
		}
		if (daten[0][0] == "51" ){ //end winkel
			fertig.end_winkel = daten[0][1];
		}
		if (daten[0][0] == "71" ){ //Verknüpfungspunkt TOP: 1Left 2Center 3Right MIDDLE: 4L 5C 6R Bottom: 7L 8C 9R
			fertig.attachment_p = daten[0][1];
		}
		daten.shift();
	}
	return fertig;
}