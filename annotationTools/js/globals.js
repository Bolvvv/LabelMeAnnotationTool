/**@file包含LabelMe中使用的全局变量。*/

//解析后的LabelMe XML文件使用jQuery操作此变量。
var LM_xml;

//提交XML批注的CGI脚本URL：
var SubmitXmlUrl = 'annotationTools/perl/submit.cgi';

//LabelMe用户名：
var username = 'anonymous';

//指示用户当前是否正在登录的布尔值(应该抽象到类中)：
var username_flag = 0;

//指示我们是否将使用属性的布尔值。它应该从URL中读取，默认情况下设置为0。
var use_attributes = 1; //如果为0，则从泡沫中移除所有属性
var use_parts = 1; //如果为0，则从泡沫中消失消息

//现在，让我们先移除MT模式下的属性。以防有人尝试这个。
if (getQueryVariable('mode')=='mt'){
    //use_attributes=0;
    //use_parts = 0;
}

//指示是否编辑控制点的布尔值：
var editedControlPoints = 0;

//标量，表示选择哪个多边形，-1表示不选择多边形
var selected_poly = -1;

//具有处理操作/事件的函数的类。
var main_handler;

//在睡觉状态渲染多边形的画布。
var main_canvas;

//保存镜像。
var main_media;

//XHTML命名空间的URL这是生成SVG元素所需的。
var xhtmlNS = 'http://www.w3.org/1999/xhtml';

//引用LabelMe的网站：
var ref;

//指示我们是处于分段模式还是多边形模式
var drawing_mode = 0;
var showImgName = false;

//Scribble模式：
var scribble_mode = true;
var threed_mode = false;
var video_mode = false;
var bounding_box = false;
var bbox_mode = true;
var autocomplete_mode = false;


var wait_for_input;
var edit_popup_open = 0;
var num_orig_anno;
var global_count = 0;
var req_submit;

//指示多边形是否已编辑。
var submission_edited = 0;

//允许的用户操作：
var action_CreatePolygon = 1;
var action_RenameExistingObjects = 0;
var action_ModifyControlExistingObjects = 0;
var action_DeleteExistingObjects = 0;

//哪些多边形可见：
var view_Existing = 1;
var view_Deleted = 0;

//右侧对象列表标志：
var view_ObjList = true;

var LMbaseurl = 'http://' + window.location.host + window.location.pathname;
var MThelpPage = 'annotationTools/html/mt_instructions.html';
var externalSubmitURL = 'https://www.mturk.com/mturk/externalSubmit';
var externalSubmitURLsandbox = 'https://workersandbox.mturk.com/mturk/externalSubmit';
var mt_N = 'inf';

var object_choices = '...';

var loaded_once = false;
