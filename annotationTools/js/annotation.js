


function annotation(anno_id) {
    this.anno_id = anno_id;
    this.div_attach = 'myCanvas_bg';
    this.hidden = false;
    this.scribble;
    this.anno_type = 0;
    this.bounding_box = false;
    this.polygon_id = null;
    this.line_ids = null;
    this.point_id = null;
    this.mask_id = null; 
    this.GetType = function (){
        return this.anno_type;
    };

    this.SetType = function (type){
        this.anno_type = type;
    };
     this.GetUsername = function () {
        
        
        
        if (this.anno_type == 1) return $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("segm").children("username").text();
        else return $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("polygon").children("username").text();
        
        
    };
    this.GetAutomatic = function() {
        if($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("automatic").length > 0) {
            return parseInt($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("automatic").text());
        }
        return 0;
    };
    this.GetDeleted = function () {
        return parseInt($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("deleted").text());
    };
    
    this.GetVerified = function () {
        return parseInt($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("verified").text());
    };
    
    this.GetParts = function() {
        parts = [];
        if ($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("parts").length>0) {
            tmp = $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("parts").children("hasparts").text();
            if (tmp.length>0) {
                
                parts = tmp.split(",");
                for (var j=0; j<parts.length; j++) {parts[j] = parseInt(parts[j], 10);}
            }
        }
        return parts;
    };

    this.SetDivAttach = function(da) {
        this.div_attach = da;
    };
    
    this.GetAnnoID = function () {
        return this.anno_id;
    };
    
    this.GetPtsX = function () {
        if (video_mode) return LMgetObjectField(LM_xml, this.anno_id, 'x', oVP.getcurrentFrame());
        else {
            if (this.anno_type == 0) return LMgetObjectField(LM_xml, this.anno_id, 'x');
            else {
                var arr = LMgetObjectField(LM_xml, this.anno_id,'bboxcorners');
                return [arr[0], arr[2], arr[2], arr[0]];
            }
        }
    };
    
    this.GetPtsY = function () {
        if (video_mode) return LMgetObjectField(LM_xml, this.anno_id, 'y', oVP.getcurrentFrame()); 
        else {
            if (this.anno_type == 0) return LMgetObjectField(LM_xml, this.anno_id, 'y');
            else {
                var arr = LMgetObjectField(LM_xml, this.anno_id,'bboxcorners');
                return [arr[1], arr[1], arr[3], arr[3]];
            }
        }
    };
    
    this.SetAttribute = function(field,value) {
        $('#'+this.polygon_id).attr(field,value);
    };
    
    this.SetCSS = function(field,value) {
        $('#'+this.polygon_id).css(field,value);
    };

    this.RenderAnnotation = function (action_type) {
        
        this.DrawPolygon(main_media.GetImRatio(), this.GetPtsX(), this.GetPtsY());
        
        switch(action_type) {
            case 'rest':
                this.SetAttribute('onmousedown','StartEditEvent(' + this.anno_id + ',evt); return false;');
                this.SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,'+ this.anno_id +'); return false;');
                this.SetAttribute('oncontextmenu','return false');
                this.SetCSS('cursor','pointer');
                break;
            default:
            alert('Unknown action_type');
        }
    };

    this.DrawPolygon = function (im_ratio, xp, yp) {
        var obj_name = LMgetObjectField(LM_xml,this.anno_id,'name');

        
        var strtok = obj_name.split(/ /);
        var isAngle = 0;
        for(var i = 0; i < strtok.length; i++) if(strtok[i]=='angle') isAngle = 1;
      
        if(xp.length==1) {
            this.polygon_id = DrawFlag(this.div_attach,xp[0],yp[0],obj_name,im_ratio);
        }
        else if((xp.length==3) && isAngle) {
            var attr = 'fill="none" stroke="' + HashObjectColor(obj_name) + '" stroke-width="4"';
            this.polygon_id = DrawPolyLine(this.div_attach,xp,yp,obj_name,attr,im_ratio);
        }
        else if(this.GetAutomatic()==1) {
            
            var attr = 'fill="none" stroke="' + HashObjectColor(obj_name) + '" stroke-width="4" stroke-dasharray="9,5"';
            this.polygon_id = DrawPolygon(this.div_attach,xp,yp,obj_name,attr,im_ratio);
        }
        else {
            
            var attr = 'fill="none" stroke="' + HashObjectColor(obj_name) + '" stroke-width="4"';
            this.polygon_id = DrawPolygon(this.div_attach,xp,yp,obj_name,attr,im_ratio);
        }
        return this.polygon_id;
    };
    
    this.DrawPolyLine = function (xp, yp) {
        
        var im_ratio = main_media.GetImRatio();
        this.line_ids = Array();
        for(var i = 0; i < xp.length-1; i++) {
            
            this.line_ids.push(DrawLineSegment(this.div_attach, xp[i],yp[i],xp[i+1],yp[i+1],'stroke="#0000ff" stroke-width="4"',im_ratio));

            
            $('#'+this.line_ids[i]).css('cursor','crosshair');
        }

          
          if(this.point_id) $('#'+this.point_id).remove();
          this.point_id = DrawPoint(this.div_attach,xp[0],yp[0],'r="6" fill="#00ff00" stroke="#ffffff" stroke-width="3"',im_ratio);

          
          $('#'+this.point_id).css('cursor','pointer');

          
          $('#'+this.point_id).attr('onmousedown','DrawCanvasClosePolygon();');
          $('#'+this.point_id).attr('onmouseover',"$('#'+draw_anno.point_id).attr('r',8,'stroke-width',4);");
          $('#'+this.point_id).attr('onmouseout',"if(draw_anno) {$('#'+draw_anno.point_id).attr('r',6,'stroke-width',3);}");
    };
    
    
    this.DeletePolygon = function () {
      
        if(this.polygon_id) {
            console.log('deleting polygon: ',this.polygon_id);
            $('#'+this.polygon_id).parent().remove();
            this.polygon_id = null;
        }

        
        if(this.line_ids) {
            for(var i = 0; i < this.line_ids.length; i++) $('#'+this.line_ids[i]).remove();
            this.line_ids = null;
        }
        ClearMask(this.mask_id);
        this.RemoveFirstPoint();
    };
    this.DeleteLastControlPoint = function () {
        if(draw_x.length>1) {
            var l = this.line_ids.length;
            $('#'+this.line_ids[l-1]).remove();
            this.line_ids = this.line_ids.slice(0,l-1);
            
            var l = draw_x.length;
            draw_x = draw_x.slice(0,l-1);
            draw_y = draw_y.slice(0,l-1);

            return 1;
        }
        return 0;
    };
    
    
    this.FillPolygon = function () {
        if (this.anno_type == 0) {  
            FillPolygon(this.polygon_id);
        }
        else { 
            this.mask_id = DrawSegmentation('myCanvas_bg',this.scribble.GetMaskURL(), main_media.width_curr, main_media.height_curr, this.scribble.cache_random_number);
        }
    };
    this.ShadePolygon = function(){
        ShadePolygon(this.polygon_id);
    }

    this.UnfillPolygon = function () {
        if (this.anno_type == 0) {
            if(this.polygon_id) $('#'+this.polygon_id).attr("fill","none");
        }
        else {
            ClearMask(this.mask_id);
        }
    };
    
    this.ClosestPoint = function (x,y) {
        var eps = 1e-3;
        var shortestDist = Infinity;
        var pt = new Array(3);
        var xs = this.GetPtsX();
        var ys = this.GetPtsY();
        var thisdist;
        
        for(var i=0, j=xs.length-1;i<xs.length;j=i,i++) {
            thisdist = this.dist(x,y,xs[j],ys[j]); 
            if(thisdist<shortestDist) {
                shortestDist = thisdist;
                pt[0] = xs[j];
                pt[1] = ys[j];
                pt[2] = thisdist;
            }
            
            var xi = xs[i], yi = ys[i];
            var xj = xs[j], yj = ys[j];
            
            var l = (xj-xi)*(xj-xi) + (yj-yi)*(yj-yi);
            var k = ((x-xi)*(xj-xi) + (y-yi)*(yj-yi))/l;
            var xt = k*(xj-xi)+xi;
            var yt = k*(yj-yi)+yi;
            
            if(Math.min(xi,xj)-eps <= xt && xt <= Math.max(xi,xj)+eps &&
               Math.min(yi,yj)-eps <= yt && yt <= Math.max(yi,yj)+eps) {
                thisdist = this.dist(x,y,xt,yt);
                if(thisdist<shortestDist) {
                    shortestDist = thisdist;
                    pt[0] = xt;
                    pt[1] = yt;
                    pt[2] = thisdist;
                }
            }
        }
        return pt;
    };
    this.RemoveFirstPoint = function () {
        if(this.point_id) {
            $('#'+this.point_id).remove();
            this.point_id = null;
        }
    };
    
    this.dist = function (x0,y0,x1,y1) {
        return Math.sqrt((x0-x1)*(x0-x1)+(y0-y1)*(y0-y1));
    };
}
