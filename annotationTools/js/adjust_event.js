/** @file 此文件包含调整现有多边形的函数。 */
/**
 * @constructor

 
 * @param {string} dom_attach
 * @param {array} x
 * @param {array} y
 * @param {string} obj_name
 * @param {function} ExitFunction
 * @param {float} scale
*/
function AdjustEvent(dom_attach,x,y,obj_name,ExitFunction,scale, bounding_box_annot) {

  this.bounding_box = bounding_box_annot;

  this.dom_attach = dom_attach;
  this.scale_button_pressed = false;
  this.x = x;
  this.y = y;

  this.obj_name = obj_name;

  this.ExitFunction = ExitFunction;

  this.scale = scale;

  this.editedControlPoints = false;

  this.isEditingControlPoint = false;

  this.isEditingScalingPoint = false;

  this.isMovingCenterOfMass = false;

  this.selectedControlPoint;

  this.selectedScalingPoint;

  this.center_x;
  this.center_y;

  this.control_ids = null;

  this.scalepoints_ids = null;

  this.center_id = null;

     this.polygon_id;

  

  
  this.StartEvent = function() {
    console.log('LabelMe: Starting adjust event...');
     
    this.polygon_id = this.DrawPolygon(this.dom_attach,this.x,this.y,this.obj_name,this.scale);
    select_anno.polygon_id = this.polygon_id;
    FillPolygon(this.polygon_id);
    if (video_mode){
      oVP.ShowTemporalBar();
      oVP.CreateLabeledFramesNavigationButtons();
      $('#myCanvas_bg').css('opacity', 0.5);
    }
    
    $('#'+this.dom_attach).unbind();
    $('#'+this.dom_attach).mousedown({obj: this},function(e) {
      return e.data.obj.StopAdjustEvent();
      });

      
          if (this.bounding_box){
      this.ShowScalingPoints();
      this.ShowCenterOfMass();
      return;

    }
    this.ShowControlPoints();
          this.ShowCenterOfMass();
    
    
    $(window).keydown({obj: this}, function (e){
      if (!e.data.obj.scale_button_pressed && e.keyCode == 17 && !e.data.obj.isEditingControlPoint){
        e.data.obj.RemoveScalingPoints();
        e.data.obj.RemoveControlPoints();
        e.data.obj.RemoveCenterOfMass();
        e.data.obj.ShowScalingPoints();
        e.data.obj.scale_button_pressed = true;
      }
      
    });
    $(window).keyup({obj: this}, function (e){
      if (e.keyCode == 17 && !e.data.obj.isEditingControlPoint){
      e.data.obj.scale_button_pressed = false;
      e.data.obj.RemoveScalingPoints();
      e.data.obj.RemoveControlPoints();
      e.data.obj.RemoveCenterOfMass();
      e.data.obj.ShowControlPoints();
      e.data.obj.ShowCenterOfMass();
      }
    });
  };
  
  
  this.StopAdjustEvent = function() {
          $('#'+this.polygon_id).parent().remove();

          $(window).unbind("keydown");
    $(window).unbind("keyup");
          this.RemoveControlPoints();
    this.RemoveCenterOfMass();
    this.RemoveScalingPoints();
    console.log('LabelMe: Stopped adjust event.');
    if (video_mode){
      oVP.HideTemporalBar();
      oVP.RemoveLabeledFramesNavigationButtons();
    }
    
    if (video_mode) $('#myCanvas_bg').css('opacity', 1);
      
    this.ExitFunction(this.x,this.y,this.editedControlPoints);
  };

  
  this.ShowScalingPoints = function (){
    if(!this.scalepoints_ids) this.scalepoints_ids = new Array();
    for (var i = 0; i < this.x.length; i++){
      this.scalepoints_ids.push(DrawPoint(this.dom_attach,this.x[i],this.y[i],'r="5" fill="#0000ff" stroke="#ffffff" stroke-width="2.5"',this.scale));
    }
    for (var i = 0; i < this.scalepoints_ids.length; i++) $('#'+this.scalepoints_ids[i]).mousedown({obj: this,point: i},function(e) {
    return e.data.obj.StartMoveScalingPoint(e.data.point);
  });

  }

  
  this.RemoveScalingPoints = function (){
    if(this.scalepoints_ids) {
      for(var i = 0; i < this.scalepoints_ids.length; i++) $('#'+this.scalepoints_ids[i]).remove();
      this.scalepoints_ids = null;
    }
  }

  
  this.ShowControlPoints = function() {
    if(!this.control_ids) this.control_ids = new Array();
    for(var i = 0; i < this.x.length; i++) {
              this.control_ids.push(DrawPoint(this.dom_attach,this.x[i],this.y[i],'r="5" fill="#00ff00" stroke="#ffffff" stroke-width="2.5"',this.scale));
      
              $('#'+this.control_ids[i]).mousedown({obj: this,point: i},function(e) {
         return e.data.obj.StartMoveControlPoint(e.data.point);
      });
    }
  };

  
  this.RemoveControlPoints = function() {
    if(this.control_ids) {
      for(var i = 0; i < this.control_ids.length; i++) $('#'+this.control_ids[i]).remove();
      this.control_ids = null;
    }
  };

  
  this.ShowCenterOfMass = function() {
    var MarkerSize = 8;
    if(this.x.length==1) MarkerSize = 6;
    
          this.CenterOfMass(this.x,this.y);
    
          this.center_id = DrawPoint(this.dom_attach,this.center_x,this.center_y,'r="' + MarkerSize + '" fill="red" stroke="#ffffff" stroke-width="' + MarkerSize/2 + '"',this.scale);
    
          $('#'+this.center_id).mousedown({obj: this},function(e) {
       return e.data.obj.StartMoveCenterOfMass();
      });
  };

  
  this.RemoveCenterOfMass = function() {
    if(this.center_id) {
      $('#'+this.center_id).remove();
      this.center_id = null;
    }
  };
  

  /** This function is called when one scaling point is clicked
   * It prepares the polygon for scaling.
   * @param {int} i - the index of the scaling point being modified
  */
  this.StartMoveScalingPoint = function(i) {
    if(!this.isEditingScalingPoint) {
      $('#'+this.dom_attach).unbind();
      $('#'+this.dom_attach).mousemove({obj: this},function(e) {
      return e.data.obj.MoveScalingPoint(e.originalEvent, !e.data.obj.bounding_box);
    });
      $('#body').mouseup({obj: this},function(e) {
        return e.data.obj.StopMoveScalingPoint(e.originalEvent);
      });
      this.RemoveCenterOfMass();      
      this.selectedScalingPoint = i;
      this.isEditingScalingPoint = true;
      this.editedControlPoints = true;
    }
  };
  /** This function is called when one scaling point is being moved
   * It computes the position of the scaling point in relation to the polygon's center of mass
   * and resizes the polygon accordingly
   * @param {event} event - Indicates a point is being moved and the index of such point
  */
  this.MoveScalingPoint = function(event, proportion) {
    var x = GetEventPosX(event);
    var y = GetEventPosY(event);
    if(this.isEditingScalingPoint && (this.scale_button_pressed || this.bounding_box)) {
      var origx, origy, pointx, pointy, prx, pry;
      pointx = this.x[this.selectedScalingPoint];
      pointy = this.y[this.selectedScalingPoint];
      this.CenterOfMass(this.x,this.y);
      
      var sx = pointx - this.center_x;
      var sy = pointy - this.center_y;
      if (sx < 0) origx = Math.max.apply(Math, this.x);
      else origx = Math.min.apply(Math, this.x);
      if (sy < 0) origy = Math.max.apply(Math, this.y);
      else origy = Math.min.apply(Math, this.y);
      prx = (Math.round(x/this.scale)-origx)/(pointx-origx);
      pry = (Math.round(y/this.scale)-origy)/(pointy-origy);
      if (proportion) pry = prx;
      if (prx <= 0 || pry  <= 0 ) return;
      for (var i = 0; i < this.x.length; i++){
                var dx = (this.x[i] - origx)*prx;
        var dy = (this.y[i] - origy)*pry;
        x = origx + dx;
        y = origy + dy;
        this.x[i] = Math.max(Math.min(x,main_media.width_orig),1);
        this.y[i] = Math.max(Math.min(y,main_media.height_orig),1);
      }
              $('#'+this.polygon_id).parent().remove();
              this.polygon_id = this.DrawPolygon(this.dom_attach,this.x,this.y,this.obj_name,this.scale);
      select_anno.polygon_id = this.polygon_id;
        
      this.RemoveScalingPoints();
      this.ShowScalingPoints();
    }
  };

  /** This function is called when one scaling point stops being moved
   * It updates the xml with the new coordinates of the polygon.
   * @param {event} event - Indicates a point is being moved and the index of such point
   */
  this.StopMoveScalingPoint = function(event) {
    console.log('Moving scaling point');
    if(this.isEditingScalingPoint) {
      this.MoveScalingPoint(event, !this.bounding_box);
      FillPolygon(this.polygon_id);
      this.isEditingScalingPoint = false;
      if (video_mode) main_media.UpdateObjectPosition(select_anno, this.x, this.y);

      this.ShowCenterOfMass();
              $('#'+this.dom_attach).unbind();
      $('#'+this.dom_attach).mousedown({obj: this},function(e) {
        return e.data.obj.StopAdjustEvent();
      });

    }
  };

  /** This function is called when one control point is clicked
   * @param {int} i - the index of the control point being modified
  */  

  this.StartMoveControlPoint = function(i) {
    if(!this.isEditingControlPoint) {
      $('#'+this.dom_attach).unbind();
      $('#'+this.dom_attach).mousemove({obj: this},function(e) {
      return e.data.obj.MoveControlPoint(e.originalEvent);
    });
      $('#body').mouseup({obj: this},function(e) {
        return e.data.obj.StopMoveControlPoint(e.originalEvent);
      });      

      this.RemoveCenterOfMass();
      this.selectedControlPoint = i;
      
      this.isEditingControlPoint = true;
      this.editedControlPoints = true;
    }
  };

  /** This function is called when one control point is being moved
   * @param {event} event - Indicates a point is being moved and the index of such point
  */
  this.MoveControlPoint = function(event) {
    if(this.isEditingControlPoint) {
      var x = GetEventPosX(event);
      var y = GetEventPosY(event);
      
              this.x[this.selectedControlPoint] = Math.max(Math.min(Math.round(x/this.scale),main_media.width_orig),1);
      this.y[this.selectedControlPoint] = Math.max(Math.min(Math.round(y/this.scale),main_media.height_orig),1);

      this.originalx = this.x;
      this.originaly = this.y;
      
                      $('#'+this.polygon_id).parent().remove();
              this.polygon_id = this.DrawPolygon(this.dom_attach,this.x,this.y,this.obj_name,this.scale);
      select_anno.polygon_id = this.polygon_id;
              this.RemoveControlPoints();
      this.ShowControlPoints();
    }
  };

  /** This function is called when one control point stops being moved
   * It updates the xml with the new coordinates of the polygon.
   * @param {event} event - Indicates a point is being moved and the index of such point
   */
  this.StopMoveControlPoint = function(event) {
    console.log('Moving control point');
    if(this.isEditingControlPoint) {
      this.MoveControlPoint(event);
      FillPolygon(this.polygon_id);
      this.ShowCenterOfMass();
      this.isEditingControlPoint = false;
      if (video_mode) main_media.UpdateObjectPosition(select_anno, this.x, this.y);
              $('#'+this.dom_attach).unbind();
      $('#'+this.dom_attach).mousedown({obj: this},function(e) {
        return e.data.obj.StopAdjustEvent();
      });

    }
  };

  /** This function is called when the middle grab point is clicked
   * It prepares the polygon for moving.
  */
  this.StartMoveCenterOfMass = function() {
    if(!this.isMovingCenterOfMass) {
      $('#'+this.dom_attach).unbind();
      $('#'+this.dom_attach).mousemove({obj: this},function(e) {
        return e.data.obj.MoveCenterOfMass(e.originalEvent);
      });
      $('#body').mouseup({obj: this},function(e) {
        return e.data.obj.StopMoveCenterOfMass(e.originalEvent);
      });
      this.RemoveScalingPoints();
      this.RemoveControlPoints();
      
      this.isMovingCenterOfMass = true;
      this.editedControlPoints = true;
    }
  };

  /** This function is called when the middle grab point is being moved
   * @param {event} event - Indicates the middle grab point is moving
   * It modifies the control points to be consistent with the polygon shift
  */
  this.MoveCenterOfMass = function(event) {
    if(this.isMovingCenterOfMass) {
      var x = GetEventPosX(event);
      var y = GetEventPosY(event);
      
              var dx = Math.round(x/this.scale)-this.center_x;
      var dy = Math.round(y/this.scale)-this.center_y;
      
              for(var i = 0; i < this.x.length; i++) {
        dx = Math.max(this.x[i]+dx,1)-this.x[i];
        dy = Math.max(this.y[i]+dy,1)-this.y[i];
        dx = Math.min(this.x[i]+dx,main_media.width_orig)-this.x[i];
        dy = Math.min(this.y[i]+dy,main_media.height_orig)-this.y[i];
      }
              for(var i = 0; i < this.x.length; i++) {
        this.x[i] = Math.round(this.x[i]+dx);
        this.y[i] = Math.round(this.y[i]+dy);
      }
      this.center_x = Math.round(this.scale*(dx+this.center_x));
      this.center_y = Math.round(this.scale*(dy+this.center_y));
      
                      $('#'+this.polygon_id).parent().remove();
      this.polygon_id = this.DrawPolygon(this.dom_attach,this.x,this.y,this.obj_name,this.scale);
      select_anno.polygon_id = this.polygon_id;

              this.RemoveCenterOfMass();
      this.ShowCenterOfMass();
    }
  };


  /** This function is called when the middle grab point stops being moved
   * It updates the xml with the new coordinates of the polygon.
   * @param {event} event - Indicates the middle grab point is being moved and the index of such point
   */
  this.StopMoveCenterOfMass = function(event) {
    if(this.isMovingCenterOfMass) {
              this.MoveCenterOfMass(event);
      
              if (this.bounding_box){
        this.RemoveScalingPoints();
        this.RemoveCenterOfMass();
        this.ShowScalingPoints();
        this.ShowCenterOfMass();
      }
      else {
        this.RemoveControlPoints();
        this.RemoveCenterOfMass();
        this.ShowControlPoints();
        this.ShowCenterOfMass();
      }

      FillPolygon(this.polygon_id);
      this.isMovingCenterOfMass = false;
      if (video_mode) main_media.UpdateObjectPosition(select_anno, this.x, this.y);
              $('#'+this.dom_attach).unbind();
      $('#'+this.dom_attach).mousedown({obj: this},function(e) {
        return e.data.obj.StopAdjustEvent();
      });

    }
  };

  

  /** Compute center of mass for a polygon given array of points (x,y):

  */
  this.CenterOfMass = function(x,y) {
    var N = x.length;
    
          if(N==1) {
      this.center_x = x[0];
      this.center_y = y[0];
      return;
    }
                this.center_x = 0; this.center_y = 0;
    var perimeter = 0;
    for(var i = 1; i <= N; i++) {
      var length = Math.round(Math.sqrt(Math.pow(x[i-1]-x[i%N], 2) + Math.pow(y[i-1]-y[i%N], 2)));
      this.center_x += length*Math.round((x[i-1] + x[i%N])/2);
      this.center_y += length*Math.round((y[i-1] + y[i%N])/2);
      perimeter += length;
    }
    this.center_x /= perimeter;
    this.center_y /= perimeter;
  };


  this.DrawPolygon = function(dom_id,x,y,obj_name,scale) {
    if(x.length==1) return DrawFlag(dom_id,x[0],y[0],obj_name,scale);
    
    var attr = 'fill="none" stroke="' + HashObjectColor(obj_name) + '" stroke-width="4"';
    return DrawPolygon(dom_id,x,y,obj_name,attr,scale);
  };
}
