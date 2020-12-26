/**@file包含视频类的文件视频是image.js的镜像类。大多数函数都是相似，可以加入
*/

/**
 * Creates a video object
 * @constructor
 * @param {string} id - The id of the dom element containing the video
*/
function video(id) {
    
    this.page_in_use = 0; 
    this.id = id;
    this.dir_name = null;
    this.collection = "LabelMe";
    this.im = document.getElementById("im");
    this.dir_name;
    this.video_name = null;
    this.width_orig;
    this.height_orig;
    this.width_curr;  
    this.height_curr;
    this.im_ratio; 
    this.browser_im_ratio; 
    this.curr_frame_width;  
    this.curr_frame_height; 
    
    this.GetNewVideo = function(onload_helper) {

        var videodiv = '<div id="'+id+'" videosrc="" videoautoplay="true" style="vertical-align:bottom;z-index:-4;"></div>';
        $('#main_section').append(videodiv);
        $('#main_media').detach().appendTo('#'+id);
        document.getElementById('loading').style.display = '';
        if(IsMicrosoft()) this.im.style.visibility = 'hidden';
        else this.im.style.display = '';
        wait_for_input = 0;
        edit_popup_open = 0;
         $.getScript("annotationTools/js/player.js", function(){
            oVP = new JSVideo();
            console.time('Load video');
            main_media.SetImageDimensions();
            onload_helper();
            console.time('Load LabelMe XML file');
            oVP.loadChunk(1, 1, true, false);

        });
        
    };
    
    /**返回可用宽高与原始宽高之比*宽度/高度。目前，始终为1*/
    this.GetImRatio = function() {
        return this.im_ratio;
    };
    
    
    this.GetFileInfo = function() {
        return this;
    };
    
    
    
    this.SetImageDimensions = function() {
        this.im_ratio = 1.;
        this.width_curr = 640;
        this.height_curr = 480;
        this.width_orig = 640;
        this.height_orig = 480;
        
        
        
        $("#myCanvas_bg").width(this.width_curr).height(this.height_curr);
        $("#select_canvas").width(this.width_curr).height(this.height_curr);
        $("#draw_canvas").width(this.width_curr).height(this.height_curr);
        $("#query_canvas").width(this.width_curr).height(this.height_curr);
        
        $("#main_media").width(this.width_curr).height(this.height_curr);
        this.curr_frame_width = this.width_curr;
        this.curr_frame_height = this.height_curr;
        document.getElementById('loading').style.visibility = 'hidden';
        document.getElementById('main_media').style.visibility = 'visible';

        if(IsMicrosoft()) {
            this.im.style.visibility = '';
            document.getElementById('main_media').style.overflow = 'visible';
            this.ScaleFrame();
        }
        else this.im.style.display = '';
    };
    
    
    /** If (x,y) is not in view, then scroll it into view.  Return adjusted
     * (x,y) point that takes into account the slide offset.
     * @param {int} x
     * @param {int} y
     * @returns {intarray}
    */
    this.SlideWindow = function (x,y) {
        var pt = Array(2);
        if(!this.IsPointVisible(x,y)) {
            document.getElementById('main_media').scrollLeft = x-100;
            document.getElementById('main_media').scrollTop = y-100;
        }
        pt[0] = x-$("#main_media").scrollLeft();
        pt[1] = y-$("#main_media").scrollTop();
        return pt;
    };
    
        
    this.ScrollbarsOff = function () {
        if(!this.IsFitImage()) {
            document.getElementById('main_media').style.overflow = 'hidden';
        }
    };
    
    

    this.ScrollbarsOn = function () {
        if(!this.IsFitImage()) {
            document.getElementById('main_media').style.overflow = 'auto';
        }
    };
    
    
    this.Zoom = function(amt) {
        
        if(wait_for_input) return;
        
        
        if(edit_popup_open) StopEditEvent();
        
        if(amt=='fitted') {
                this.im_ratio = this.browser_im_ratio;
        } else {
                this.im_ratio = this.im_ratio * amt;
        }
        
        
        if(this.im_ratio < this.browser_im_ratio) {this.im_ratio=this.browser_im_ratio; return;}
        
        
        this.width_curr = Math.round(this.im_ratio*this.width_orig);
        this.height_curr = Math.round(this.im_ratio*this.height_orig);
        
        
        this.ScaleFrame(amt);
        
    
    var anno = null;
    if(draw_anno) {
      draw_anno.DeletePolygon();
      anno = draw_anno;
      draw_anno = null;
        }

        
        this.im.width = this.width_curr;
        this.im.height = this.height_curr;
        
        $("#myCanvas_bg").width(this.width_curr).height(this.height_curr);
        $("#select_canvas").width(this.width_curr).height(this.height_curr);
        $("#draw_canvas").width(this.width_curr).height(this.height_curr);
        $("#query_canvas").width(this.width_curr).height(this.height_curr);
        
        
    main_canvas.RenderAnnotations();

    if(anno) {
      
      draw_anno = anno;
      draw_anno.SetDivAttach('draw_canvas');
      draw_anno.DrawPolyLine();
    }

    
    
    
    if (drawing_mode == 1){
      scribble_canvas.redraw();
      scribble_canvas.drawMask();
        }
    
    
    };

    this.ScaleFrame = function(amt) {
        //查看可用的浏览器(Height，Width)和图片(Height，Width)
        //并将两者中较小的一个用于main_media(高度、宽度)。
        //也使图片居中，调整比例后，可见的中心像素保持在同一位置
        //var avail_Height=this.GetAvailHeight()；
        this.curr_frame_height = Math.min(this.GetAvailHeight(), this.height_curr);
        
        //var avail_width = this.GetAvailWidth();
        this.curr_frame_width = Math.min(this.GetAvailWidth(), this.width_curr);
        
        
        cx = $("#main_media").scrollLeft()+this.curr_frame_width/2.0; 
        cy = $("#main_media").scrollTop()+this.curr_frame_height/2.0;
        Dx = Math.max(0, $("#main_media").scrollLeft()+(amt-1.0)*cx); 
        Dy = Math.max(0, $("#main_media").scrollTop()+(amt-1.0)*cy);
        
        
        $("#main_media").scrollLeft(Dx).scrollTop(Dy);
        $("#main_media").width(this.curr_frame_width).height(this.curr_frame_height);
        
    };
    
    
    /** Retrieves and sets the original image's dimensions (width/height).
     * @param {image} im
    */
    this.SetOrigImDims = function (im) {
        this.width_orig = im.width;
        this.height_orig = im.height;
        return;
    };
    
    
    this.GetAvailWidth = function() {
        return $(window).width() - $("#main_media").offset().left -10 - 200;
        
    };
    
    
    this.GetAvailHeight = function() {
        var m = main_media.GetFileInfo().GetMode();
        if(m=='mt') {
            return $(window).height() - $("#main_media").offset().top -75;
        }
        return $(window).height() - $("#main_media").offset().top -10;
    };
    
    
    
    
    this.IsFitImage = function () {
        return (this.im_ratio < 0.01+this.browser_im_ratio);
    };
    
    
    this.IsPointVisible = function (x,y) {        
        var scrollLeft = $("#main_media").scrollLeft();
        var scrollTop = $("#main_media").scrollTop();
        
        if(((x*this.im_ratio < scrollLeft) ||
            (x*this.im_ratio - scrollLeft > this.curr_frame_width - 160)) || 
           ((y*this.im_ratio < scrollTop) || 
            (y*this.im_ratio - scrollTop > this.curr_frame_height))) 
            return false;  
        return true;
    };

    
    this.ParseURL = function () {
        var labelme_url = document.URL;
        var idx = labelme_url.indexOf('?');
        if((idx != -1) && (this.page_in_use == 0)) {
            this.page_in_use = 1;
            var par_str = labelme_url.substring(idx+1,labelme_url.length);
            var isMT = false; 
            var default_view_ObjList = false;
            do {
                idx = par_str.indexOf('&');
                var par_tag;
                if(idx == -1) par_tag = par_str;
                else par_tag = par_str.substring(0,idx);
                var par_field = this.GetURLField(par_tag);
                var par_value = this.GetURLValue(par_tag);
                if(par_field=='mode'){
                    this.mode = par_value;
                    if(this.mode=='im' || this.mode=='mt') view_ObjList = false;
                }
                if(par_field=='username') {
                    username = par_value;
                }
                
                if(par_field=='folder') {
                    this.dir_name = par_value;
                    console.log(par_value);
                }
                if(par_field=='videoname') {
                    this.video_name = par_value;
                    
                }
                
                if((par_field=='scribble')&&(par_value=='true')) {
                    scribble_mode = true;
                }
                if((par_field=='video')&&(par_value=='true')) {
                    video_mode = true;
                }
                par_str = par_str.substring(idx+1,par_str.length);
            } while(idx != -1);

            
            
            if((this.mode=='i') || (this.mode=='c') || (this.mode=='f')) {
                document.getElementById('body').style.visibility = 'visible';
            }
            
            else {
                this.mode = 'i';
                document.getElementById('body').style.visibility = 'visible';
            }
            
            if(!view_ObjList) {
                var p = document.getElementById('anno_anchor');
                p.parentNode.removeChild(p);
            }
            
        }
        
        return 1;
    };

    
    this.GetMode = function() {
        return 'v';
    };
    
    
    this.GetCollection = function () {
        return "LabelMe";
    };

    
    this.GetDirName = function () {
        return this.dir_name;
    };

    
    this.GetImName = function () {
        return this.video_name;
    };

    
    this.GetImagePath = function () {
        if((this.mode=='i') || (this.mode=='c') || (this.mode=='f') || (this.mode=='im') || (this.mode=='mt')) return 'VLMFrames/' + this.dir_name + '/' + this.video_name;
    };

    
    this.GetVideoPath = function (){
      if((this.mode=='i') || (this.mode=='c') || (this.mode=='f') || (this.mode=='im') || (this.mode=='mt')) return '/LabelMeVideo/VLMVideos/' + this.dir_name + '/' + this.video_name+'.flv';
    };  

    
    this.GetFullName = function () {
        if((this.mode=='i') || (this.mode=='c') || (this.mode=='f') || (this.mode=='im') || (this.mode=='mt')) return this.dir_name + '/' + this.video_name;
    };

    
    this.GetTemplatePath = function () {
        if(!this.dir_name) return 'annotationCache/XMLTemplates/labelme.xml';
        return 'annotationCache/XMLTemplates/' + this.dir_name + '.xml';
    };

    /** String is assumed to have field=value form.  Parses string to
    return the field. */
    this.GetURLField = function (str) {
        var idx = str.indexOf('=');
        return str.substring(0,idx);
    };
    
    /** String is assumed to have field=value form.  Parses string to
    return the value. */
    this.GetURLValue = function (str) {
        var idx = str.indexOf('=');
        return str.substring(idx+1,str.length);
    };
    
    this.GetAnnotationPath = function () {
        if((this.mode=='i') || (this.mode=='c') || (this.mode=='f') || (this.mode=='im') || (this.mode=='mt')) return 'VLMAnnotations/' + this.dir_name + '/' + this.video_name + '.xml';
    };

    this.SetURL = function (url) {
        this.FetchVideo();
        var idx = url.indexOf('?');
        if(idx != -1) {
            url = url.substring(0,idx);
        }
        
        
        extra_field = '&video=true';
        if (bbox_mode) extra_field += '&bbox=true';
        if(username != 'anonymous') extra_field += '&username=' + username;
        
        if(this.mode=='i') window.location = url + '?collection=' + this.collection + '&mode=' + this.mode + '&folder=' + this.dir_name + '&videoname=' + this.video_name + extra_field;
        else if(this.mode=='im') window.location = url + '?collection=' + this.collection + '&mode=' + this.mode + '&folder=' + this.dir_name + '&videoname=' + this.video_name + extra_field;
        else if(this.mode=='mt') window.location = url + '?collection=' + this.collection + '&mode=' + this.mode + '&folder=' + this.dir_name + '&videoname=' + this.video_name + extra_field;
        else if(this.mode=='c') window.location = url + '?mode=' + this.mode + '&username=' + username + '&collection=' + this.collection + '&folder=' + this.dir_name + '&videoname=' + this.video_name + extra_field;
        else if(this.mode=='f') window.location = url + '?mode=' + this.mode + '&folder=' + this.dir_name + '&videoname=' + this.video_name + extra_field;
        
        return false;
    };

    
    this.FetchVideo = function () {
        var url = 'annotationTools/perl/fetch_video.cgi?mode=' + this.mode + '&username=' + username + '&collection=' + this.collection.toLowerCase() + '&folder=' + this.dir_name + '&videoname=' + this.video_name;
        var im_req;
        console.log(url);
        
        if (window.XMLHttpRequest) {
            im_req = new XMLHttpRequest();
            im_req.open("GET", url, false);
            im_req.send('');
        }
        else if (window.ActiveXObject) {
            im_req = new ActiveXObject("Microsoft.XMLHTTP");
            if (im_req) {
                im_req.open("GET", url, false);
                im_req.send('');
            }
        }
        if(im_req.status==200) {
            this.dir_name = im_req.responseXML.getElementsByTagName("dir")[0].firstChild.nodeValue;
            this.video_name = im_req.responseXML.getElementsByTagName("file")[0].firstChild.nodeValue;
        }
        else {
            alert('Fatal: there are problems with fetch_video.cgi');
        }
    };


    /** Computes a set of points representing a linearly interpolated polygon.
     * @param {array} xinit - xcoordinates of the polygon at tinit
     * @param {array} yinit - ycoordinates of the polygon at tinit
     * @param {array} xend - xcoordinates of the polygon at tend
     * @param {array} yend - ycoordinates of the polygon at tend
     * @param {int} tinit - first ground truth frame number
     * @param {int} tend - last ground truth frame number
     * @param {int} tcurrent - frame that has to be interpolated
    */
    this.GetInterpolatedPoints = function (xinit, yinit, xend, yend, tinit, tend, tcurrent){
        Xresp = Array(xinit.length);
        Yresp = Array(xinit.length);
        for (var i = 0; i <Xresp.length; i++){
            alfa = (tend - tcurrent)/(tend-tinit);
            Xresp[i] = parseInt(alfa*xinit[i] + (1-alfa)*xend[i]);
            Yresp[i] = parseInt(alfa*yinit[i] + (1-alfa)*yend[i]);
        }
        return [Xresp, Yresp];
    }

    /** Update the position of an annotation. Modifies the xml file information about a given annotation.
     *  @param {annotation} anno - annotation containing the info about the polygon
    */
    this.UpdateObjectPosition = function (anno, newx, newy){
      var obj_ndx = anno.anno_id;
      var curr_obj = $(LM_xml).children("annotation").children("object").eq(obj_ndx);
      var framestamps = (curr_obj.children("polygon").children("t").text()).split(',');
      var userlabeledframes = (curr_obj.children("polygon").children("userlabeled").text()).split(',');
      var pts_x = (curr_obj.children("polygon").children("x").text()).split(';');
      var pts_y = (curr_obj.children("polygon").children("y").text()).split(';');

      for(var ti=0; ti<framestamps.length; ti++) { 
        framestamps[ti] = parseInt(framestamps[ti], 10); 
      }
      for (var ti = 0; ti < userlabeledframes.length; ti++){
        userlabeledframes[ti] = parseInt(userlabeledframes[ti],10);
      }
      while (framestamps[0] > oVP.getcurrentFrame()){
        framestamps.unshift(framestamps[0]-1);
        pts_x.unshift(pts_x[0]);
        pts_y.unshift(pts_y[0]);
      }
      var ti = 0;
      while (ti < userlabeledframes.length && userlabeledframes[ti] <= oVP.getcurrentFrame()) ti++;
      var ti2 = 0;
      while (ti2 < userlabeledframes.length && userlabeledframes[ti2] < oVP.getcurrentFrame()) ti2++;
      ti2--;

      var framenext = framestamps.length;
      var frameprior = -1;
      if (ti2 >= 0) frameprior = framestamps.indexOf(userlabeledframes[ti2]);
      if (ti < userlabeledframes.length) framenext = framestamps.indexOf(userlabeledframes[ti]);
      var objectind = framestamps.indexOf(oVP.getcurrentFrame());
      
      for (var i = frameprior+1; i < objectind; i++){
        var coords = [newx, newy];
        if (frameprior > -1){
            var Xref = pts_x[frameprior].split(',');
            var Yref = pts_y[frameprior].split(',');
            coords = this.GetInterpolatedPoints(Xref, Yref, newx, newy, framestamps[frameprior], framestamps[objectind], framestamps[i]);
        }
        
        pts_x[i] = coords[0].join();
        pts_y[i] = coords[1].join();
      }
      pts_y[objectind] = newy;
      pts_x[objectind] = newx;
      
      for (var i = objectind+1; i < framenext; i++){
        var coords = [newx, newy];
        if (framenext < framestamps.length){
            var Xref = pts_x[framenext].split(',');
            var Yref = pts_y[framenext].split(',');
            coords = this.GetInterpolatedPoints(newx, newy, Xref, Yref, framestamps[objectind], framestamps[framenext], framestamps[i]);
        }
        pts_x[i] = coords[0].join();
        pts_y[i] = coords[1].join();
      }
      userlabeledframes.push(oVP.getcurrentFrame());
      jQuery.unique(userlabeledframes);
      userlabeledframes.sort(function(a, b){return a-b});
      new_x_str = pts_x.join(';');
      new_y_str = pts_y.join(';');
      LMsetObjectField(LM_xml, obj_ndx, "t", framestamps.join(','));
      LMsetObjectField(LM_xml, obj_ndx, "x", new_x_str);
      LMsetObjectField(LM_xml, obj_ndx, "y", new_y_str);
      LMsetObjectField(LM_xml, obj_ndx, "userlabeled", userlabeledframes.join());
        
    }

    
    this.SubmitEditObject = function (){
        submission_edited = 1;
        var anno = select_anno;
      
      
      old_name = LMgetObjectField(LM_xml,anno.anno_id,'name');
      if(document.getElementById('objEnter')) new_name = RemoveSpecialChars(document.getElementById('objEnter').value);
      else new_name = RemoveSpecialChars(adjust_objEnter);
      
      var re = /[a-zA-Z0-9]/;
      if(!re.test(new_name)) {
        alert('Please enter an object name');
        return;
      }
      
      if (use_attributes) {
        
        if (document.getElementById('occluded')) new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
        else new_occluded = RemoveSpecialChars(adjust_occluded);
        
        
        if(document.getElementById('attributes')) new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
        else new_attributes = RemoveSpecialChars(adjust_attributes);
      }
      
      
      
      
      if(editedControlPoints) InsertServerLogData('cpts_modified');
      else InsertServerLogData('cpts_not_modified');

      
      var obj_ndx = anno.anno_id;
      
      
      LMsetObjectField(LM_xml, obj_ndx, "name", new_name);
      LMsetObjectField(LM_xml, obj_ndx, "automatic", "0");
      
      

      LMsetObjectField(LM_xml, obj_ndx, "attributes", new_attributes);
      LMsetObjectField(LM_xml, obj_ndx, "occluded", new_occluded);
      WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
    
      StopEditEvent();
      oVP.DisplayFrame(oVP.getcurrentFrame());    
      
    }

    
    this.SubmitObject = function (){
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
            active_canvas = REST_CANVAS;
            
            document.getElementById('draw_canvas').style.zIndex = -2;
            document.getElementById('draw_canvas_div').style.zIndex = -2;
            var anno = null;
            if(draw_anno) {
              anno = draw_anno;
              draw_anno = null;
            }
            var re = /[a-zA-Z0-9]/;
            if(!re.test(nn)) {
                alert('Please enter an object name');
                return;
            }
        }
        else {
            nn = RemoveSpecialChars(document.getElementById('objEnter').value);
            var re = /[a-zA-Z0-9]/;
            if(!re.test(nn)) {
                alert('Please enter an object name');
                return;
            }
            anno = main_handler.QueryToRest();
        }
        
        
    
        
        submission_edited = 0;
        global_count++;
        new_name = nn;
        old_name = nn;
        
        InsertServerLogData('cpts_not_modified');
        
        var html_str = '<object>';
        html_str += '<name>' + nn + '</name>';
        if(use_attributes) {
            html_str += '<occluded>' + new_occluded + '</occluded>';
            html_str += '<attributes>' + new_attributes + '</attributes>';
        }
        html_str += '<parts><hasparts></hasparts><ispartof></ispartof></parts>';
        var ts = 0;
        if(ts.length==20) html_str += '<date>' + ts + '</date>';
        html_str += '<id>' + anno.anno_id + '</id>';
        if (bounding_box){
           html_str += '<type> bounding_box </type>';
        } 
        html_str += '<polygon>';
        html_str += '<username>' + username + '</username>';
        var t_str = '<t>';
        var x_str = '<x>';
        var y_str = '<y>';
        for (var fr = oVP.getcurrentFrame(); fr < oVP.getnumFrames(); fr++){
            if (fr > oVP.getcurrentFrame()){ 
                t_str += ', ';
                x_str += '; ';
                y_str += '; ';
            }
            t_str += fr;
            for(var jj=0; jj < draw_x.length; jj++) {
                if (jj > 0){
                    x_str += ', ';
                    y_str += ', ';
                }
                x_str += draw_x[jj];
                y_str += draw_y[jj];
            }
        }
        t_str += '</t>';
        x_str += '</x>';
        y_str += '</y>';
        html_str += t_str;
        html_str += x_str;
        html_str += y_str;
        html_str += '<userlabeled>'+oVP.getcurrentFrame()+'</userlabeled>';
        html_str += '</polygon>';
        html_str += '<parts>'
        html_str += '<hasparts/>'
        html_str += '<ispartof/>'
        html_str += '</parts>'
        html_str += '</object>';
        $(LM_xml).children("annotation").append($(html_str));
        
        $('#select_canvas').css('z-index','0');
        $('#select_canvas_div').css('z-index','0');
          select_anno = anno;
          if(!LMgetObjectField(LM_xml, LMnumberOfObjects(LM_xml)-1, 'deleted') ||view_Deleted) {
            main_canvas.AttachAnnotation(anno);

            
            }
              if(view_ObjList) RenderObjectList();
          
        adjust_event = new AdjustEvent('select_canvas',LMgetObjectField(LM_xml,anno.anno_id,'x', oVP.getcurrentFrame()),
            LMgetObjectField(LM_xml,anno.anno_id,'y', oVP.getcurrentFrame()),
            LMgetObjectField(LM_xml,anno.anno_id,'name'),function(x,y,_editedControlPoints) {
          
          if(username_flag) submit_username();

          
          anno = select_anno;
          anno.DrawPolygon(main_media.GetImRatio(),x, y);

          

          
          editedControlPoints = _editedControlPoints;
          
          var slidervalues = $('#oTempBar').slider("option", "values");
          if (oVP.getcurrentFrame() >= slidervalues[0] && oVP.getcurrentFrame() <= slidervalues[1]){
            main_media.UpdateObjectPosition(anno, x, y);
          }
          StopEditEvent();
          WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
          this.adjust_event = null;
        },main_media.GetImRatio(), bounding_box);
      
      adjust_event.StartEvent();
    };


    
}
