var part_bubble;
function CreatePopupBubble(left,top,innerHTML,dom_attach) {
  var html_str;
  var bubble_name = 'myPopup';
  
  // 调整位置以考虑箭头的位移：
  left -= 22;
  if (left < 5) left = 5;
  
  
  if (top > 214) {
    html_str  = '<div class= "bubble" id="' + bubble_name + '" style="position:absolute;z-index:5; left:' + left + 'px; top:' + top + 'px;">';
  }
  else {
    html_str  = '<div class= "bubble top" id="' + bubble_name + '" style="position:absolute;z-index:5; left:' + left + 'px; top:' + top + 'px;">';
  }

  html_str += innerHTML;
  html_str += '</div>';
  $('#'+dom_attach).append(html_str);
  if (part_bubble) $('#myPopup').css('background-color', 'rgb(255,230,230)')
  if(top > 214) {  
    h = $('#'+bubble_name).height();
    document.getElementById(bubble_name).style.top = (top-h-80) + 'px';
  }
  else {
    document.getElementById(bubble_name).style.top = (top) + 'px';
  }
  setTimeout("$('#objEnter').focus();",1);
  if (autocomplete_mode){
    addAutoComplete();
  }
  return bubble_name;
}
function addAutoComplete(){
	var tags = [];
	$.getScript("./annotationTools/js/wordnet_data.js", function(){
    var NoResultsLabel = 'No results found';
		tags = data_wordnet;
		$( "#objEnter" ).autocomplete({
        
			  source: function( request, response ) {
          if (request.term.length > 0){
            var matcher2 = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term )+'$', "i" );
    			  var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), "i" );
            res = $.grep( tags, function( item ){
              aux = matcher.test( item );
              return aux
            }); 
            res2 = $.grep( tags, function( item ){
              aux = matcher2.test( item );
              return aux
            });
            if (res2.length == 0){
              $("#objEnter").css('color', 'red');
            }
            else {
              $("#objEnter").css('color', 'black');
            }
            if (res.length == 0){
              res = [NoResultsLabel];
            }
    			  response(res);
          }
          else {
            $("#objEnter").css('color', 'black');
            response(false);
          }
        },
        select: function (event, ui) {
            $("#objEnter").css('color', 'black');
            if (ui.item.label === NoResultsLabel || event.which == 13) {
                event.preventDefault();
            }
        },
        focus: function (event, ui) {
            if (ui.item.label === NoResultsLabel) {
                event.preventDefault();
            }
        },

        minLength: 0  
		}).data("ui-autocomplete")._renderItem =  function( ul, item ) {
            
            
             var newText = String(item.value).replace(
                new RegExp("^" + $.ui.autocomplete.escapeRegex( this.term ), "i"),
                "<strong>$&</strong>");
            return $("<li></li>")
                .data("ui-item.autocomplete", item)
                .append("<a>" + newText + "</a>")
                .appendTo(ul);
              
          };
    $(".ui-autocomplete").css('font-size', '11px')
    $(".ui-autocomplete").css('font-family', 'BlinkMacSystemFont')
	});	

}

function CreatePopupBubbleCloseButton(dom_bubble,close_function) {
  if(arguments.length==1) {
    close_function = function() {return;};
  }
  var html_str = '<img id="' + dom_bubble + '_closebutton" style="border: 0pt none; width:14px; height:14px; z-index:4; -moz-user-select:none; position:absolute; cursor:pointer; right:8px; top: 8px;" src="Icons/close.png" height="14" width="14" />';
  $('#'+dom_bubble).append(html_str);
  $('#'+dom_bubble+'_closebutton').mousedown(function () {
      $('#'+dom_bubble).remove();
      close_function();
      return;
    });
}

function mkPopup(left,top,scribble_popup) {
  wait_for_input = 1;
  var innerHTML = GetPopupFormDraw(scribble_popup);
  CreatePopupBubble(left,top,innerHTML,'main_section');
  setTimeout("$('#objEnter').focus();",1);
}

function mkEditPopup(left,top,anno) {
  edit_popup_open = 1;
  var innerHTML = GetPopupFormEdit(anno);
  var dom_bubble = CreatePopupBubble(left,top,innerHTML,'main_section');
  CreatePopupBubbleCloseButton(dom_bubble,StopEditEvent);

  $('#objEnter').select();
  $('#objEnter').focus();
}

function CloseQueryPopup() {
  wait_for_input = 0;
  $('#myPopup').remove();
}

function CloseEditPopup() {
  edit_popup_open = 0;
  $('#myPopup').remove();
}

function GetPopupFormDraw(scribble_form) {
  wait_for_input = 1;
  part_bubble = false;
  html_str = "<b>Enter object name</b><br />";
  if (add_parts_to != null){
    html_str = "<b>Enter part name</b><br />";
    part_bubble = true;
  }
  html_str += HTMLobjectBox("");
  if(use_attributes) {
    html_str += HTMLoccludedBox("");
    html_str += "<b>Enter attributes</b><br />";
    html_str += HTMLattributesBox("");
  }
  if(use_parts) {
    html_str += HTMLpartsBox("");
  }
  html_str += "<br />";
  
  
  html_str += '<input type="button" value="Done" title="Press this button after you have provided all the information you want about the object." onclick="main_handler.SubmitQuery();" tabindex="0" />';
  
  
  html_str += '<input type="button" style="float:right" value="Delete" title="Press this button if you wish to delete the polygon." onclick="main_handler.WhatIsThisObjectDeleteButton();" tabindex="0" />';
  html_str += '<br />' 
  
  if (!scribble_form) if (!bounding_box) html_str += '<input type="button" value="Undo close" title="Press this button if you accidentally closed the polygon. You can continue adding control points." onclick="UndoCloseButton();" tabindex="0" />';
  else if (scribble_form) html_str += '<input type="button" value="Edit Scribble" title="Press this button if to keep adding scribbles." onclick="KeepEditingScribbles();" tabindex="0" />';
  
  if (add_parts_to == null) html_str += '<input type="button" value="Add parts" title="Press this button if you want to start adding parts" onclick="main_handler.StartAddParts();" tabindex="0" />';
  else html_str += '<input type="button" value="Stop parts" title="Press this button if you want to stop adding parts" onclick="main_handler.StopAddParts();" tabindex="0" />';
    
  return html_str;
}

function GetPopupFormEdit(anno) {
  
  edit_popup_open =  1;
  part_bubble = false;
  var obj_name = LMgetObjectField(LM_xml,anno.anno_id,'name');
  if(obj_name=="") obj_name = "?";
  var attributes = LMgetObjectField(LM_xml,anno.anno_id,'attributes');
  var occluded = LMgetObjectField(LM_xml,anno.anno_id,'occluded');
  var parts = LMgetObjectField(LM_xml, anno.anno_id, 'parts');
  
  html_str = "<b>Enter object name</b><br />"; 
  html_str += HTMLobjectBox(obj_name);
  
  if(use_attributes) {
    html_str += HTMLoccludedBox(occluded);
    html_str += "<b>Enter attributes</b><br />";
    html_str += HTMLattributesBox(attributes);
  }
  
  if(use_parts) {
    html_str += HTMLpartsBox(parts);
  }
  
  html_str += "<br />";
  
  
  if (video_mode) html_str += '<input type="button" value="Done" title="Press this button when you are done editing." onclick="main_media.SubmitEditObject();" tabindex="0" />';
  
  else html_str += '<input type="button" value="Done" title="Press this button when you are done editing." onclick="main_handler.SubmitEditLabel();" tabindex="0" />';
  html_str += '<input type="button" style="float:right" value="Delete" title="Press this button if you wish to delete the polygon." onclick="main_handler.EditBubbleDeleteButton();" tabindex="0" /><br />';
  
  if (anno.GetType() == 0) {
    html_str += '<input type="button" value="Adjust polygon" title="Press this button if you wish to update the polygon\'s control points." onclick="javascript:AdjustPolygonButton();" />';
  }
  else {
    html_str += '<input type="button" value="Edit Scribbles" title="Press this button if you wish to update the segmentation." onclick="javascript:EditBubbleEditScribble();" />';  
  }
  
  
  
  
  if (add_parts_to == null) html_str += '<input type="button" value="Add parts" title="Press this button if you want to start adding parts" onclick="main_handler.StartAddParts();" tabindex="0" />';
  
  return html_str;
}






function HTMLobjectBox(obj_name) {
  var html_str="";

  
  objEnter1 = "核心";objEnter1_e = "core";
  objEnter2 = "水肿";objEnter2_e = "edema";
  objEnter3 = "坏死";objEnter3_e = "necrosis";
  
  console.log("123321"+obj_name);
  html_str += '<input name="objEnter" id="objEnter1" type="radio" value="core" ';
  if(obj_name === objEnter1_e || (obj_name !== objEnter2_e && obj_name !== objEnter3_e)) {
    html_str += ' checked="checked" ';
  }
  html_str += '/>'+objEnter1;
  html_str += '<input name="objEnter" id="objEnter2" type="radio" value="edema" ';
  if(obj_name === objEnter2_e) {
    html_str += ' checked="checked" ';
  }
  html_str += '/>'+objEnter2;
  html_str += '<input name="objEnter" id="objEnter3" type="radio" value="necrosis" ';
  if(obj_name === objEnter2) {
    html_str += ' checked="checked" ';
  }
  html_str += ' onkeyup="var c;if(event.keyCode)c=event.keyCode;if(event.which)c=event.which;if(c==13){';
  
  
  if (obj_name=='') {
    
    if (video_mode) html_str += 'main_media.SubmitObject()};if(c==27) main_handler.WhatIsThisObjectDeleteButton();" ';
    else html_str += 'main_handler.SubmitQuery()};if(c==27)main_handler.WhatIsThisObjectDeleteButton();" ';
  }
  else {
    
    if (video_mode) html_str += 'main_media.SubmitEditObject()};" ';
    else html_str += 'main_handler.SubmitEditLabel()};" ';
  }
  
  
  if(object_choices=='...') {
    html_str += '/> '+objEnter3; 
  }
  else {
    html_str += 'list="datalist1" />'; 
    html_str += '<datalist id="datalist1"><select style="display:none">';
    for(var i = 0; i < object_choices.length; i++) {
      html_str += '<option value="' + object_choices[i] + '">' + object_choices[i] + '</option>';
    }
    html_str += '</select></datalist>';
  }
  
  html_str += '<br />';
  
  return html_str;
}







function HTMLoccludedBox(occluded) {
  var html_str="";
  
  
  if (!(occluded=="no" || occluded=="yes")) {
    occluded="no";
  }
  
  
  html_str += 'Is occluded? <input type="hidden" name="occluded" id="occluded" value="'+occluded+'"/>';
  
  
  if (occluded=='yes') {
    html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="yes" checked="yes" onclick="document.getElementById(\'occluded\').value=\'yes\';" />yes';
    html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="no"  onclick="document.getElementById(\'occluded\').value=\'no\';" />no';
  }
  else {
    html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="yes"  onclick="document.getElementById(\'occluded\').value=\'yes\';" />yes';
    html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="no" checked="yes"  onclick="document.getElementById(\'occluded\').value=\'no\';" />no';
  }
  html_str += '<br />';
  
  return html_str;
}


function HTMLattributesBox(attList) {    
  return '<textarea name="attributes" id="attributes" type="text" style="width:220px; height:3em;" tabindex="0" title="Enter a comma separated list of attributes, adjectives or other object properties">'+attList+'</textarea>';
}





function HTMLpartsBox(parts) {
  var html_str="";
  if (parts.length>0) {
    if (parts.length==1) {
      html_str = 'Object has 1 part.';
    }
    else {
      html_str = 'Object has '+parts.length+' parts.';
    }
  }
  else {
    html_str = 'Object has no parts.';
  }
  
  return html_str;
}
