/** @file Generic rendering canvas.
在高层次上，有4个布局的画布。它们对应于：(I)主画布、(Ii)绘图画布、(Iii)查询画布、(Iv)多边形选择画布。任何时候，都有一块画布在前面，接受鼠标功能。其他画布隐藏在下面，不接受鼠标功能。所有画布都是透明的，这意味着它们的内容始终可见。该工具的任务是在这些画布之间切换并刷新其内容。
 */
function canvas(div_attach) {
  this.annotations = Array(); 
  $('#'+div_attach).empty()
  this.div_attach = div_attach; 
  this.AttachAnnotation = function (anno) {
    this.annotations.push(anno);
    anno.SetDivAttach(this.div_attach);
  };
  this.DetachAnnotation = function(anno_id) {
    var i;
    var is_matched = false;
    for(i=0; i<this.annotations.length; i++) {
      if(this.annotations[i].GetAnnoID()==anno_id) {
	is_matched = true;
	break;
      }
    }
    if(!is_matched) return null;
    var anno = this.annotations.splice(i,1)[0];
    anno.DeletePolygon();
    return anno;
  }; 
  this.UnhideAllAnnotations = function () {
    for(var pp=0; pp < this.annotations.length; pp++) {
      this.annotations[pp].hidden = false;
    }
  };

  
  this.RenderAnnotations = function () {
    
    for(var i=0;i<this.annotations.length;i++) {
      this.annotations[i].DeletePolygon();
    }

    
    for(var pp=0; pp < this.annotations.length; pp++) {
      if(!this.annotations[pp].hidden) {
	     this.annotations[pp].RenderAnnotation('rest');
      }
    }
  };
  this.ShadePolygons = function (){
    for(var i=0;i<this.annotations.length;i++) {
      this.annotations[i].ShadePolygon();
    }
  }
  this.GetAnnoIndex = function(id){
    var anid = -1;
    for (var i = 0; i < this.annotations.length; i++) if (this.annotations[i].anno_id == id) anid = i;
    return anid;
  };
  
}
