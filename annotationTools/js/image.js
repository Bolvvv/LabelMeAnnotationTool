/** @file File containing the image class. 
* Fetches and manipulates the main image that will be annotated.
* From the HTML code, create a <img src...> tag with an id and pass
* this id in as the argument when creating the class.

*/
/**
 * Creates an image object
 * @constructor
 * @param {string} id - The id of the dom element containing the image
*/
function image(id) {
    
    // *******************************************
    // Private variables:
    // *******************************************
    
    this.file_info = new file_info();
    this.contrast = 128;
    this.id = id;
    this.im = document.getElementById(this.id);
    this.width_orig;
    this.height_orig;
    this.width_curr;  //current width and height of the image itself
    this.height_curr;
    this.im_ratio; // Ratio of (displayed image dims) / (orig image dims)
    this.browser_im_ratio; // Initial im_ratio; this should not get changed!!
    this.curr_frame_width;  // Current width of main_media.
    this.curr_frame_height; // Current height of main_media.
    
    // *******************************************
    // Public methods:
    // *******************************************
    
    /** Fetches a new image based on the URL string or gets a new one at
     * @param {function} onload_helper - pointer to a helper function that 
     * is called when the image is loaded.  Typically, this
     * will call obj.SetImageDimensions().
    */
    this.GetNewImage = function(onload_helper) {
	console.log('new image');
        document.getElementById('loading').style.visibility = 'visible';
        if(IsMicrosoft()) this.im.style.visibility = 'hidden';
        else this.im.style.display = 'none';
        this.image =  new Image();
        this.image.src  =  this.file_info.GetImagePath();
        this.image.onload = function (){
            onload_helper();
            main_media.contrast = 128;
            main_media.im.getContext('2d').drawImage(main_media.image,0,0,main_media.width_curr, main_media.height_curr);
            main_media.DisplayWithContrast(main_media.contrast);
        }
        wait_for_input = 0;
        edit_popup_open = 0;
    };
    
    /** Returns the ratio of the available width/height to the original
     width/height.
     */
    this.GetImRatio = function() {
        return this.im_ratio;
    };
    
    /** Returns file_info object that contains information about the
      * displayed image.
     */
    this.GetFileInfo = function() {
        return this.file_info;
    };
 
    
    /** Sets the dimensions of the image based on browser setup. */
    this.SetImageDimensions = function() {
        this.SetOrigImDims(this.image);
        var avail_width = this.GetAvailWidth();
        var avail_height = this.GetAvailHeight();
        var width_ratio = avail_width/this.width_orig;
        var height_ratio = avail_height/this.height_orig;
        
        if(width_ratio<height_ratio) this.im_ratio = width_ratio;
        else this.im_ratio = height_ratio;
        this.browser_im_ratio = this.im_ratio;
        
        this.width_curr = Math.round(this.im_ratio*this.width_orig);
        this.height_curr = Math.round(this.im_ratio*this.height_orig);
        
        this.im.width = this.width_curr;
        this.im.height = this.height_curr;
        $("#myCanvas_bg").width(this.width_curr).height(this.height_curr);
        $("#select_canvas").width(this.width_curr).height(this.height_curr);
        $("#draw_canvas").width(this.width_curr).height(this.height_curr);
        $("#query_canvas").width(this.width_curr).height(this.height_curr);
        
        
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
    
    /** Turn off image scrollbars if zoomed in. */
    this.ScrollbarsOff = function () {
        if(!this.IsFitImage()) {
            document.getElementById('main_media').style.overflow = 'hidden';
        }
    };
    
    /** Turn on image scrollbars if zoomed in. */
    this.ScrollbarsOn = function () {
        if(!this.IsFitImage()) {
            document.getElementById('main_media').style.overflow = 'auto';
        }
    };
    
    /** Zoom the image given a zoom level (amt) between 0 and inf (or 'fitted'). 
     * @param {float} amt - amount of zoom
    */
    this.Zoom = function(amt) {
        // if a new polygon is being added while the user press the zoom button then do nothing.
        if(wait_for_input) return;
        
        // if an old polygon is being edited while the user press the zoom button then close the polygon and zoom.
        if(edit_popup_open) StopEditEvent();
        
        if(amt=='fitted') {
                this.im_ratio = this.browser_im_ratio;
        } else {
                this.im_ratio = this.im_ratio * amt;
        }
        
        // if the scale factor is bellow the original scale, then do nothing (do not make the image too small)
        if(this.im_ratio < this.browser_im_ratio) {this.im_ratio=this.browser_im_ratio; return;}
        
        // New width and height of the rescaled picture
        this.width_curr = Math.round(this.im_ratio*this.width_orig);
        this.height_curr = Math.round(this.im_ratio*this.height_orig);
        
        // Scale and scroll the image so that the center stays in the center of the visible area
        this.ScaleFrame(amt);
        
    	// Remove polygon from draw canvas:
    	var anno = null;
    	if(draw_anno) {
    	  draw_anno.DeletePolygon();
    	  anno = draw_anno;
    	  draw_anno = null;
        }

        // set the size of the image (this.im is the image object)
        this.im.width = this.width_curr;
        this.im.height = this.height_curr;
        // set the size of all the canvases
        $("#myCanvas_bg").width(this.width_curr).height(this.height_curr);
        $("#select_canvas").width(this.width_curr).height(this.height_curr);
        $("#draw_canvas").width(this.width_curr).height(this.height_curr);
        $("#query_canvas").width(this.width_curr).height(this.height_curr);
        
        // Draw Image in canvas

        
        main_media.DisplayWithContrast(main_media.contrast);
        // Redraw polygons.
    	main_canvas.RenderAnnotations();

    	if(anno) {
    	  // Draw polyline:
    	  draw_anno = anno;
    	  draw_anno.SetDivAttach('draw_canvas');
    	  draw_anno.DrawPolyLine(draw_x, draw_y);
    	}
        if (adjust_event){
            adjust_event.scale = main_media.GetImRatio();
            $('#'+adjust_event.polygon_id).parent().remove();
            adjust_event.polygon_id = adjust_event.DrawPolygon(adjust_event.dom_attach,adjust_event.x,adjust_event.y,adjust_event.obj_name,adjust_event.scale);
            select_anno.polygon_id = this.polygon_id;
            adjust_event.RemoveControlPoints();
            adjust_event.RemoveCenterOfMass();
            adjust_event.ShowCenterOfMass();
            adjust_event.ShowControlPoints();
        }

    	/*************************************************************/
    	/*************************************************************/
    	// Scribble: 
    	if (drawing_mode == 1){
    	  scribble_canvas.redraw();
    	  scribble_canvas.drawMask();
        }
    	/*************************************************************/
    	/*************************************************************/
    };
    
    
    
    // *******************************************
    // Private methods:
    // *******************************************
    
    /** Tells the picture to take up the available space in the browser, if it needs it. 6.29.06*/
    this.ScaleFrame = function(amt) {
        // Look at the available browser (height,width) and the image (height,width),
        // and use the smaller of the two for the main_media (height,width).
        // also center the image so that after rescaling, the center pixels visible stays at the same location
        //var avail_height = this.GetAvailHeight();
        this.curr_frame_height = Math.min(this.GetAvailHeight(), this.height_curr);
        
        //var avail_width = this.GetAvailWidth();
        this.curr_frame_width = Math.min(this.GetAvailWidth(), this.width_curr);
        
        // also center the image so that after rescaling, the center pixels visible stays at the same location
        cx = $("#main_media").scrollLeft()+this.curr_frame_width/2.0; // current center
        cy = $("#main_media").scrollTop()+this.curr_frame_height/2.0;
        Dx = Math.max(0, $("#main_media").scrollLeft()+(amt-1.0)*cx); // displacement needed
        Dy = Math.max(0, $("#main_media").scrollTop()+(amt-1.0)*cy);
        
        // set the width and height and scrolls
        $("#main_media").scrollLeft(Dx).scrollTop(Dy);
        $("#main_media").width(this.curr_frame_width).height(this.curr_frame_height);
        
    };
    
    
    /** Retrieves and sets the original image's dimensions (width/height).
     * @param {image} im
    */
    this.SetOrigImDims = function (im) {
        this.width_orig = im.naturalWidth;
        this.height_orig = im.naturalHeight;
        return;
    };
    
    /** gets available width (6.14.06) */
    this.GetAvailWidth = function() {
        return $(window).width() - $("#main_media").offset().left -10 - 200;
        // we could include information about the size of the object box using $("#anno_list").offset().left
    };
    
    /** gets available height (6.14.06) */
    this.GetAvailHeight = function() {
        var m = main_media.GetFileInfo().GetMode();
        if(m=='mt') {
            return $(window).height() - $("#main_media").offset().top -75;
        }
        return $(window).height() - $("#main_media").offset().top -10;
    };
    
    
    
    /** Returns true if the image is zoomed to the original (fitted) resolution. */
    this.IsFitImage = function () {
        return (this.im_ratio < 0.01+this.browser_im_ratio);
    };
    
    /** Returns true if (x,y) is viewable. */
    this.IsPointVisible = function (x,y) {        
        var scrollLeft = $("#main_media").scrollLeft();
        var scrollTop = $("#main_media").scrollTop();
        
        if(((x*this.im_ratio < scrollLeft) ||
            (x*this.im_ratio - scrollLeft > this.curr_frame_width - 160)) || 
           ((y*this.im_ratio < scrollTop) || 
            (y*this.im_ratio - scrollTop > this.curr_frame_height))) 
            return false;  //the 160 is about the width of the right-side div
        return true;
    };
	this.ObtainImagePixels = function(){
		var c = document.getElementById('imcanvas');
		c.width = this.width_curr;
		c.height = this.height_curr;
		var ctx = c.getContext('2d');
		ctx.drawImage(this.image,0,0, main_media.width_curr, main_media.height_curr);
		data = ctx.getImageData(0,0, c.width, c.height);
        return data;
	}
    this.AugmentContrast = function(){
        this.contrast = this.contrast + 5;
        this.contrast = Math.min(this.contrast, 254);
        this.DisplayWithContrast(this.contrast);
    }
    this.ReduceContrast = function(){
        this.contrast = this.contrast - 5;
        this.contrast = Math.max(this.contrast, 1);
        this.DisplayWithContrast(this.contrast);
    }
	this.DisplayWithContrast = function(alpha){
		var data_im = this.ObtainImagePixels();
        var data = data_im.data;
		for (var i = 0; i < data.length; i+=4){
			for (var j = 0; j < 3; j++){
				var elem = data[i+j];
				if (elem < alpha){
					var elem_new = 128*(elem/alpha)
				}
				else {
					var elem_new = 128*(1+(elem - alpha)/(255-alpha));
				}
				data[i+j] = elem_new;
			}
		}
        data_im.data = data;
        main_media.im.getContext('2d').putImageData(data_im,0,0,0,0,main_media.width_curr, main_media.height_curr);

	}
    
}

