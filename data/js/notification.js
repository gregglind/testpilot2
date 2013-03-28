function render(id, data){
    var template = _.template($(id).html());
    var s = template(data);
    return s
};

self.port.on("customize",function(){
	console.log("ready to rock!");
	$('#noticebox').html(
		render('#pilot-notification-template',self.options.pagedata)
	);
	instrumentButtons();
	var w = window.document.getElementsByTagName('body')[0].scrollWidth,
			h = window.document.getElementsByTagName('body')[0].scrollWidth;
	self.port.emit("resize",[w,h])
});

var instrumentButtons = function(){
	$(':button').click(function(evt){
		var t = $(this);
		var d = {id:t.attr('id'),name:t.attr('name'),data:t.data(),value:t.val()};
		self.port.emit("action",d);
		console.log(JSON.stringify(d));
	})
};