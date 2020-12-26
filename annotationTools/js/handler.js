/**@file
这包含用于在不同注释工具状态之间转换的高级命令。它们是：睡觉、抽签、选定、查询。
*/

//处理用户的所有操作并将任务委托给其他类。
//还跟踪全局信息。
var REST_CANVAS = 1;
var DRAW_CANVAS = 2;
var SELECTED_CANVAS = 3;
var QUERY_CANVAS = 4;

//表示哪个画布处于活动状态的全局变量：
var active_canvas = REST_CANVAS;

//检查我们是否处于添加部件模式
var add_parts_to = null;

function handler() {
    this.StartAddParts = function(){
      
      if (select_anno){
        var anno_id = select_anno.anno_id;
        this.SubmitEditLabel();
        add_parts_to = anno_id;
      }
      else {
        var anno = this.SubmitQuery();
        add_parts_to = anno.anno_id;
      }
      $('#Link'+add_parts_to).css('font-weight',700);
    }

    this.StopAddParts = function(){
      if (select_anno) this.SubmitEditLabel();
      else this.SubmitQuery();
      $('#Link'+add_parts_to).css('font-weight', 400);
      add_parts_to = null;
    }

    //当用户按下DELETE按钮以响应
    //“这是什么对象？”弹出式泡沫。
    this.WhatIsThisObjectDeleteButton = function () {
      submission_edited = 0;
      this.QueryToRest();
      if (scribble_canvas.scribblecanvas) scribble_canvas.cleanscribbles();
    };
    
    //提交对象标签以响应编辑/删除弹出泡沫
    this.SubmitEditLabel = function () {

      if (scribble_canvas.scribblecanvas){
        scribble_canvas.annotationid = -1;
        scribble_canvas.cleanscribbles();
      } 
      submission_edited = 1;
      var anno = select_anno;
      
      //对象名称
      old_name = LMgetObjectField(LM_xml,anno.anno_id,'name');
      if($("input[name='objEnter']:checked").val()) new_name = RemoveSpecialChars($("input[name='objEnter']:checked").val());
      else new_name = RemoveSpecialChars(adjust_objEnter);
      
      var re = /[a-zA-Z0-9]/;
      if(!re.test(new_name)) {
	alert('Please enter an object name');
	return;
      }
      
      if (use_attributes) {
      	//遮挡字段
      	if (document.getElementById('occluded')) new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
      	else new_occluded = RemoveSpecialChars(adjust_occluded);
      	
      	//属性字段
      	if(document.getElementById('attributes')) new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
      	else new_attributes = RemoveSpecialChars(adjust_attributes);
      }
      
      StopEditEvent();
      
      //插入要写入日志文件的数据：
      if(editedControlPoints) InsertServerLogData('cpts_modified');
      else InsertServerLogData('cpts_not_modified');
      
      //Object索引：
      var obj_ndx = anno.anno_id;
      
      //设置字段：
      LMsetObjectField(LM_xml, obj_ndx, "name", new_name);
      LMsetObjectField(LM_xml, obj_ndx, "automatic", "0");
      
      //插入属性(如果字段不在，则创建字段)：
      LMsetObjectField(LM_xml, obj_ndx, "attributes", new_attributes);
        
      
      LMsetObjectField(LM_xml, obj_ndx, "occluded", new_occluded);
      
      //将XML写入服务器：
      WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
      
      //刷新Object列表：
      if(view_ObjList) {
      	RenderObjectList();
      	ChangeLinkColorFG(anno.GetAnnoID());
      }
    };
    
    //当用户按下DELETE按钮以响应
    //编辑弹出泡沫。
    this.EditBubbleDeleteButton = function () {
        var idx = select_anno.GetAnnoID();

        if((IsUserAnonymous() || (!IsCreator(LMgetObjectField(LM_xml, idx, 'username')))) && (!IsUserAdmin()) && (idx<num_orig_anno) && !action_DeleteExistingObjects) {
            alert('You do not have permission to delete this polygon');
            return;
        }
        
        if(idx>=num_orig_anno) {
            global_count--;
        }
        
        submission_edited = 0;
        
        //插入服务器日志文件数据：
        old_name = LMgetObjectField(LM_xml,select_anno.anno_id,'name');
        new_name = old_name;
        WriteLogMsg('*Deleting_object');
        InsertServerLogData('cpts_not_modified');
        
        //在LM_XML中设置<Delete>：
        LMsetObjectField(LM_xml, idx, "deleted", "1");
        
        //移除已删除对象的所有部件依赖
        removeAllParts(idx);
        
        //将XML写入服务器：
        WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
        if(view_ObjList) RenderObjectList();
        selected_poly = -1;
        unselectObjects(); // Perhaps this should go elsewhere...
        StopEditEvent();
        if (scribble_canvas.scribblecanvas){
          scribble_canvas.annotationid = -1;
          scribble_canvas.cleanscribbles();
        } 
    };
    
    
    this.AnnotationLinkClick = function (idx) {
      if (adjust_event) return;
      if (video_mode && LMgetObjectField(LM_xml, idx, 'x', oVP.getcurrentFrame()).length == 0){
        

        var frames = LMgetObjectField(LM_xml, idx, 't');
        var id1 = -1;
        var id2 = frames.length;
        var i = 0;
        while (i < frames.length){
          if (frames[i] >= oVP.getcurrentFrame()) id2 = Math.min(id2, i);
          else id1 = Math.max(id1, i);
          i++;
        }
        if (id2 < frames.length) oVP.GoToFrame(frames[id2]);
        else oVP.GoToFrame(frames[id1]);
      }
      if(active_canvas==REST_CANVAS) StartEditEvent(idx,null);
      else if(active_canvas==SELECTED_CANVAS) {
      	var anno_id = select_anno.GetAnnoID();
      	if(edit_popup_open){ 
          StopEditEvent();
          ChangeLinkColorBG(idx);
        }
        if (idx != anno_id){
          if (video_mode) oVP.HighLightFrames(LMgetObjectField(LM_xml, idx, 't'), LMgetObjectField(LM_xml, idx, 'userlabeled'));
          ChangeLinkColorFG(idx);
          StartEditEvent(idx,null);
        } 
      }
    };
    
    
    this.AnnotationLinkMouseOver = function (a) {
        if (active_canvas != SELECTED_CANVAS && video_mode && LMgetObjectField(LM_xml, a, 'x', oVP.getcurrentFrame()).length == 0){ 
          ChangeLinkColorFG(a);
          oVP.HighLightFrames(LMgetObjectField(LM_xml, a, 't'), LMgetObjectField(LM_xml, a, 'userlabeled'));
          selected_poly = a;
        } 
        else if(active_canvas!=SELECTED_CANVAS){
          selectObject(a);
          console.log('select');
        } 
        
    };
    
    
    this.AnnotationLinkMouseOut = function () {
       
      if(active_canvas!=SELECTED_CANVAS){
        unselectObjects();
      }
    };
    
    
    
    this.CanvasMouseMove = function (event,pp) {
        var x = GetEventPosX(event);
        var y = GetEventPosY(event);
        if(IsNearPolygon(x,y,pp)) selectObject(pp);
        else unselectObjects();
    };
    
    
    
    this.SubmitQuery = function () {
      var nn;
      var anno;
      
      
      if (use_attributes) {
	
	if(document.getElementById('attributes')) new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
	else new_attributes = "";
	
	
	if (document.getElementById('occluded')) new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
	else new_occluded = "";
      }
      
      if((object_choices!='...') && (object_choices.length==1)) {
	nn = RemoveSpecialChars(object_choices[0]);
	  var re = /[a-zA-Z0-9]/;
	  if(!re.test(nn)) {
	    alert('Please enter an object name');
	    return;
	  }
	active_canvas = REST_CANVAS;
	
	
	document.getElementById('draw_canvas').style.zIndex = -2;
	document.getElementById('draw_canvas_div').style.zIndex = -2;
	
	
	var anno = null;
	if(draw_anno) {
	  draw_anno.DeletePolygon();
	  anno = draw_anno;
	  draw_anno = null;
	}
      }
      else {
  
  nn = RemoveSpecialChars($("input[name='objEnter']:checked").val());
	var re = /[a-zA-Z0-9]/;
	if(!re.test(nn)) {
	   alert('Please enter an object name');
	   return;
	}
	anno = this.QueryToRest();
      }
      new_name = nn;
      old_name = nn;
      submission_edited = 0;
      global_count++;
      InsertServerLogData('cpts_not_modified');
      var html_str = '<object>';
      html_str += '<name>' + new_name + '</name>';
      html_str += '<deleted>0</deleted>';
      html_str += '<verified>0</verified>';
      if(use_attributes) {
	html_str += '<occluded>' + new_occluded + '</occluded>';
	html_str += '<attributes>' + new_attributes + '</attributes>';
      }
      html_str += '<parts><hasparts></hasparts><ispartof></ispartof></parts>';
      var ts = GetTimeStamp();
      if(ts.length==20) html_str += '<date>' + ts + '</date>';
      html_str += '<id>' + anno.anno_id + '</id>';
      if (bounding_box){
          html_str += '<type>'
          html_str += 'bounding_box';
          html_str += '</type>'
        } 
      if(anno.GetType() == 1) {
	html_str += '<segm>';
	html_str += '<username>' + username + '</username>';
	html_str += '<box>';
	html_str += '<xmin>' + scribble_canvas.object_corners[0] + '</xmin>'; 
	html_str += '<ymin>' + scribble_canvas.object_corners[1] + '</ymin>';
	html_str += '<xmax>' + scribble_canvas.object_corners[2] + '</xmax>'; 
	html_str += '<ymax>' + scribble_canvas.object_corners[3] + '</ymax>';
	html_str += '</box>';
	html_str += '<mask>'+ scribble_canvas.image_name +'</mask>';
	html_str += '<scribbles>';
	html_str += '<xmin>' + scribble_canvas.image_corners[0] + '</xmin>'; 
	html_str += '<ymin>' + scribble_canvas.image_corners[1] + '</ymin>';
	html_str += '<xmax>' + scribble_canvas.image_corners[2] + '</xmax>'; 
	html_str += '<ymax>' + scribble_canvas.image_corners[3] + '</ymax>';
	html_str += '<scribble_name>'+ scribble_canvas.scribble_name +'</scribble_name>'; 
	html_str += '</scribbles>';
	html_str += '</segm>';
	html_str += '</object>';
	$(LM_xml).children("annotation").append($(html_str));
      }
      else {
	html_str += '<polygon>';
	html_str += '<username>' + username + '</username>';
	for(var jj=0; jj < draw_x.length; jj++) {
	  html_str += '<pt>';
	  html_str += '<x>' + draw_x[jj] + '</x>';
	  html_str += '<y>' + draw_y[jj] + '</y>';
	  html_str += '</pt>';
	}
	html_str += '</polygon>';
	html_str += '</object>';
	$(LM_xml).children("annotation").append($(html_str));
      }
      if(!LMgetObjectField(LM_xml, LMnumberOfObjects(LM_xml)-1, 'deleted') ||view_Deleted) {
	main_canvas.AttachAnnotation(anno);
	anno.RenderAnnotation('rest');
      }
      if(anno.GetType() == 1) {
      	scribble_canvas.cleanscribbles();
      	scribble_canvas.scribble_image = "";
      	scribble_canvas.colorseg = Math.floor(Math.random()*14);
      }
      if (add_parts_to != null) addPart(add_parts_to, anno.anno_id);
      WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
      if(view_ObjList) RenderObjectList();
      var m = main_media.GetFileInfo().GetMode();
      if(m=='mt') {
      	document.getElementById('object_name').value=new_name;
      	document.getElementById('number_objects').value=global_count;
      	document.getElementById('LMurl').value = LMbaseurl + '?collection=LabelMe&mode=i&folder=' + main_media.GetFileInfo().GetDirName() + '&image=' + main_media.GetFileInfo().GetImName();
      	if(global_count >= mt_N) document.getElementById('mt_submit').disabled=false;
      }
      return anno;
    };
    this.QueryToRest = function () {
        active_canvas = REST_CANVAS;
	document.getElementById('query_canvas').style.zIndex = -2;
	document.getElementById('query_canvas_div').style.zIndex = -2;
	if(query_anno) query_anno.DeletePolygon();
	var anno = query_anno;
	query_anno = null;
	CloseQueryPopup();
	main_media.ScrollbarsOn();

        return anno;
    };
    this.KeyPress = function (event) {
        if(((event.keyCode==46) || (event.keyCode==8)) && !wait_for_input && !edit_popup_open && !username_flag) {  
            if(!main_handler.EraseSegment()) DeleteSelectedPolygon();
        }
        if(event.keyCode==27 && edit_popup_open) StopEditEvent();
    };
    this.EraseSegment = function () {
        if(draw_anno && !draw_anno.DeleteLastControlPoint()) {
            submission_edited = 0;
            StopDrawEvent();
        }
        return draw_anno;
    }; 
}
