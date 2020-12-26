function getPartsTree() {
    var tree;
    tree = getFormatedTree(-1, -1);
    return tree;
}

function addPartFields() {
    var Npolygons = $(LM_xml).children("annotation").children("object").length;
        
    for(var obj_i=0; obj_i < Npolygons; obj_i++) {
        var curr_obj = $(LM_xml).children("annotation").children("object").eq(obj_i);
        
        if (curr_obj.children("parts").length>0) {
            if (!curr_obj.children("parts").children("ispartof").length>0) {
                $(LM_xml).children("annotation").children("object").eq(obj_i).children("parts").append("<ispartof></ispartof>");
            }
            if (!curr_obj.children("parts").children("hasparts").length>0) {
                $(LM_xml).children("annotation").children("object").eq(obj_i).children("parts").append("<hasparts></hasparts>");
            }
        } else {
            $(LM_xml).children("annotation").children("object").eq(obj_i).append("<parts><hasparts></hasparts><ispartof></ispartof></parts>");
        }
    }
}



function addPart(object_id, part_id) {
    var parts;
    var childrens;
    var Npolygons = $(LM_xml).children("annotation").children("object").length;
    for(var obj_i=0; obj_i < Npolygons; obj_i++) {
        removePart(obj_i, part_id);
    }


    if (object_id!=-1){
        childrens = getPartChildrens(part_id);
        for (var i=0; i<childrens.length; i++) {
            removePart(childrens[i], object_id);
        }
        var curr_obj = $(LM_xml).children("annotation").children("object").eq(object_id);
        if (curr_obj.children("parts").length>0) {
            parts = getParts(object_id);
            parts = parts.concat(part_id).sort();
            curr_obj.children("parts").children("hasparts").text(parts.toString());
        } else {
            curr_obj.append("<parts><hasparts>" + part_id + "</hasparts></parts>");
        }

        var curr_part = $(LM_xml).children("annotation").children("object").eq(part_id);
        if (curr_part.children("parts").length>0) {
            if (curr_part.children("parts").children("ispartof").length>0) {
                curr_part.children("parts").children("ispartof").text(object_id.toString());
            } else {
                curr_part.children("parts").append("<ispartof>" + object_id + "</ispartof>");
            }
        } else {
            curr_part.append("<parts><ispartof>" + object_id + "</ispartof></parts>");
        }
    }
}


function removePart(object_id, part_id) {
    //将多边形part_id从多边形object_id的Part列表中移除
    //它删除所有合适的依赖项。
    var parts = getParts(object_id);
    var remove=-1;
    for (var i=0; i<parts.length; i++){
        if (parts[i]==part_id){remove = i;}
    }
    if (remove!=-1) {
        parts.splice(remove, 1);
        $(LM_xml).children("annotation").children("object").eq(object_id).children("parts").children("hasparts").text(parts.toString());
        $(LM_xml).children("annotation").children("object").eq(part_id).children("parts").children("ispartof").text("");
    }
}


function removeAllParts(object_id) {
    parent_id = getParent(object_id);
    
    var parts = getParts(object_id); 
    
    for (var j=0; j<parts.length; j++) {
        removePart(object_id, parts[j]);
    }
    
    if (parent_id!=-1) {
        for (var j=0; j<parts.length; j++) {
            addPart(parent_id, parts[j]);
        }
    }
}


function getPartChildrens(object_id) {
    var childrens = new Array();
    childrens[0] = object_id;
    
    var parts = getParts(object_id); 
    for (var j=0; j<parts.length; j++) {
        var child_subtree = getPartChildrens(parts[j]);
        childrens = childrens.concat(child_subtree);
    }
    return childrens;
}



function getFormatedTree(object_id, level) {
    var tree = new Array(2);
    var parts;
    tree[0] = new Array();
    tree[1] = new Array();
    
    if (object_id==-1) {
        parts = getNonParts();
        level = -1;
    } else {
        tree[0][0] = object_id;
        tree[1][0] = level;
        parts = getParts(object_id);
    }
    
    for (var j=0; j<parts.length; j++) {
        var child_subtree = getFormatedTree(parts[j], level+1);
        tree[0] = tree[0].concat(child_subtree[0]);
        tree[1] = tree[1].concat(child_subtree[1]);
    }
    return tree;
}


function getNonParts() {
    var nonparts = new Array();
    var listofparts = new Array();
    
    var Npolygons = $(LM_xml).children("annotation").children("object").length;
    for (var i=0; i<Npolygons; i++) {
        var parts = getParts(i);
        listofparts = listofparts.concat(parts);
    }
    
    for (var i=0; i<Npolygons; i++) {
        if (listofparts.indexOf(i)==-1) {
            nonparts.push(i);
        }
    }

    return nonparts;
}


function getParts(object_id){
    return LMgetObjectField(LM_xml, object_id, "parts");
}


function getParent(object_id){
    var parent = -1;
    var curr_obj = $(LM_xml).children("annotation").children("object").eq(object_id);

    if (curr_obj.children("parts").length>0 && curr_obj.children("parts").children("ispartof").length>0) {
        var tmp = curr_obj.children("parts").children("ispartof").text();
        if (tmp.length>0) {
            //如果不为空，拆分转换为数字
            parent = parseInt(tmp, 10);
        }
    }
    return parent;
}


function alertParts(title) {
    var message = "PARTS:\n";
    var Npolygons = $(LM_xml).children("annotation").children("object").length;
    
    message += title +"\n";
    
    for (var i=0; i < Npolygons; i++) {
        parts = getParts(i);
        name = LMgetObjectField(LM_xml, i,"name");
        message += "object = "+name+" ("+i+") has parts = ["+parts.toString()+"]\n";
    }
        
    tree = getFormatedTree(-1, -1);
    
    message += "\n\n Final tree = ["+tree[0]+"],["+tree[1]+"]";
    alert(message);
}
