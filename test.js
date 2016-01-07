
;(function(win){
	var Carousel = function(options){	
		this.init(options);
	};
	//element 父元素
	Carousel.prototype = {
		_default : {
			time : 2000, //时间间隔
			cycle : false, //是否循环
			method : "hover",// hover   click
			origins : [], //控制圆点父容器 argument[element, string] string 聚焦class
			items : [],/* 必需  argument[element, string] string 元素名
			sourcePoints : null,*/
			direction : 'left', // left, top
			moveType : 'easeOut', //运动方式 linear swing easeIn easeOut easeInOut
			index : 0, //起始位置
			optionObj : [] //左右操作元素 typeof object
		},
		_init : function(options){
			this.flg = false;
			this.defaults = {};
			this.extend(options);
			this.itemParent = this.defaults.items[0];
			this.items = this.$tag(this.defaults.items[1], this.itemParent);	
			this.itmeAttr = {
				'width' : this.items[0].offsetWidth,
				'height' : this.items[0].offsetHeight
			}; 
			this.moveFrame = this.itmeAttr[this.defaults.direction == " left" ? "width" : "height"];
			this.cloneNum = this.defaults.direction == " left" ? parseInt(this.itemParent.parentNode.offsetWidth / this.moveFrame) : 
			parseInt(this.itemParent.parentNode.offsetHeight / this.moveFrame);
			
		},
		init : function(options){
			this._init(options);
			if(this.defaults.optionObj.length == 2){
				this.$clone(this.itemParent, this.items, this.cloneNum, true);
			}else{
				this.$clone(this.itemParent, this.items, this.cloneNum);
			}
			this.items = this.$tag(this.defaults.items[1], this.itemParent);
			this.initPosition();
			if(this.defaults.direction == "left") this.elmLimit();
			if(this.defaults.origins.length == 2){ 
				this.createOrigin();
				this.origins = this.$tag('a', this.defaults.origins[0]);
				if(this.defaults.method == "hover"){
					this.originHover();
				}else{
					this.originClick();
				}
			}
			if(this.defaults.optionObj.length == 2) this.operation();
			if(this.defaults.cycle) this.play();
			if(this.defaults.cycle) this.parentHover();
		},
		extend : function(options){
			for( var i in this._default){
				this.defaults[i] = options[i] || this._default[i]
			}
		},
		$id:function(id){return document.getElementById(id);},
		$tag:function(tagName,obj){return (obj ?obj : document).getElementsByTagName(tagName);	},
		$c: function (claN,obj){
			var tag = this.$tag('*'),reg = new RegExp('(^|\\s)'+claN+'(\\s|$)'),arr=[];
			for(var i=0;i<tag.length;i++){
				if (reg.test(tag[i].className)){
					arr.push(tag[i]);
				}
			}
			return arr;
		},
		$add:function(obj,claN){
			reg = new RegExp('(^|\\s)'+claN+'(\\s|$)');
			if (!reg.test(obj.className)){
				
				obj.className += ' '+claN;
			}
		},
		$remve:function(obj,claN){var cla=obj.className,reg="/\\s*"+claN+"\\b/g";obj.className=cla?cla.replace(eval(reg),''):''},
		css:function(obj,attr,value){
			if(value){
			  obj.style[attr] = value;
			}else{
		   return  typeof window.getComputedStyle != 'undefined' ? window.getComputedStyle(obj,null)[attr] : obj.currentStyle[attr];
		   }
		},
		$clone : function(parent, elms, num, opera){
			var elm_c, elm_c2;
			if(!opera){
				if(num == 1){
					elm_c = elms[0].cloneNode(true);
					parent.appendChild(elm_c);
				}else{
					for(var i=0; i< num; i++){
						elm_c = elms[i].cloneNode(true);
						parent.appendChild(elm_c);
					}
				}
			}else{
				elm_c = elms[0].cloneNode(true);
				elm_c2 = elms[elms.length - 1].cloneNode(true);
				parent.appendChild(elm_c);
				parent.insertBefore(elm_c2, elms[0]);
			}
		},
		animate : function(obj,attr,val,fn){
			var d = 1000, me = this;//动画时间一秒完成。
			if(obj[attr+'timer']) clearInterval(obj[attr+'timer']);
			var start = parseInt(this.css(obj,attr));//动画开始位置
			//space = 动画结束位置-动画开始位置，即动画要运动的距离。
			var space =  val- start,st=(new Date).getTime(),m=space>0? 'ceil':'floor';
			obj[attr+'timer'] = setInterval(function(){
				var t=(new Date).getTime()-st;//表示运行了多少时间，
				if (t < d){//如果运行时间小于动画时间
					me.css(obj,attr,Math[m](me.easing[me.defaults.moveType](t,start,space,d)) +'px');
				}else{
					clearInterval(obj[attr+'timer']);
					me.css(obj,attr,top+space+'px');
					fn && fn.call(this)
				}
			},20); 
		},
		easing : {
			linear:function(t,b,c,d){return c*t/d + b;},
			swing:function(t,b,c,d) {return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;},
			easeIn:function(t,b,c,d){return c*(t/=d)*t*t*t + b;},
			easeOut:function(t,b,c,d){return -c*((t=t/d-1)*t*t*t - 1) + b;},
			easeInOut:function(t,b,c,d){return ((t/=d/2) < 1)?(c/2*t*t*t*t + b):(-c/2*((t-=2)*t*t*t - 2) + b);}
		},
		createOrigin : function(){ //生成控制点
			var str = "";
			for(var i = 0, l = (this.defaults.optionObj.length == 2 ? this.items.length -2 : this.items.length -1); i < l; i++){
				if(i == this.defaults.index){
					str += '<a href="#" class="'+ this.defaults.origins[1] +'">●</a>'
				}else{
					str += '<a href="#">●</a>'
				}
			}
			this.defaults.origins[0].innerHTML = str;
		},
		elmLimit : function(){ //设置父元素样式
			this.css(this.itemParent, 'width', this.items.length * this.itmeAttr['width'] + "px")
		},
		initPosition : function(){
			this.css(this.itemParent, this.defaults.direction, -this.defaults.index * this.moveFrame + "px");
		},
		play : function(){
			var me = this;			
			this.flg = setInterval(function(){ 
				me.defaults.index++;
				me.animate(me.itemParent, me.defaults.direction, 
					-me.defaults.index * me.moveFrame,
					function(){
						if(me.defaults.optionObj.length == 2){
							if(me.defaults.index >= me.items.length - 1){
								me.defaults.index = 1;
								me.itemParent.style[me.defaults.direction] = -me.defaults.index * me.moveFrame + "px";
								//me.css(me.itemParent, me._default.direction, 0);
							}
						}else{
							if(me.defaults.index >= me.items.length - me.cloneNum){
								me.defaults.index = 0;
								me.itemParent.style[me.defaults.direction] = 0;
								//me.css(me.itemParent, me._default.direction, 0);
							}
						}						
					});
					if(me.defaults.origins.length == 2){
						me.removeAllClass(me.origins);
						if(me.defaults.optionObj.length == 2){
							me.$add(me.origins[me.defaults.index >= me.items.length - 1 ? 0 : me.defaults.index - 1], me.defaults.origins[1]);
						}else{
							me.$add(me.origins[me.defaults.index >= me.items.length - 1 ? 0 : me.defaults.index], me.defaults.origins[1]);
						}
					}					
			}, this.defaults.time)
		},
		originHover : function(){ 
			var me = this;
			for(var i = 0, l = this.origins.length; i < l; i++){
				this.origins[i].index = i;
				this.origins[i].onmouseover = function(){	
					if(me.flg) clearInterval(me.flg)				
					me.removeAllClass(me.origins);
					me.$add(this, me.defaults.origins[1])
					me.defaults.index = me.defaults.optionObj.length == 2 ? this.index + 1 : this.index;
					me.animate(me.itemParent, me.defaults.direction, -me.defaults.index * me.moveFrame);
				};
				this.origins[i].onmouseout = function(){
					if(me.defaults.cycle) me.play();
				}
			}
		},
		originClick : function(){
			var me = this;
			for(var i = 0, l = this.origins.length; i < l; i++){
				this.origins[i].index = i;
				this.origins[i].onclick = function(e){	
					var e = e || window.event; 

					if(me.flg) clearInterval(me.flg)				
					me.removeAllClass(me.origins);
					me.$add(this, me.defaults.origins[1])
					me.defaults.index = this.index;
					me.animate(me.itemParent, me.defaults.direction, -me.defaults.index * me.moveFrame, function(){
						me.delayPlay();
					});
					if ( e && e.preventDefault ){
						e.preventDefault(); 
					}else{
						e.returnValue = false;
					} 
					return false;	
				};				
			}
		},
		operation : function(){
			var me = this;
			this.defaults.index++;
			this.css(this.itemParent, this.defaults.direction, -this.moveFrame + "px");
			this.defaults.optionObj[0].onclick = function(){
				if(me.flg) clearInterval(me.flg)
				setTimeout(function(){
					me.defaults.index--
					me.animate(me.itemParent, me.defaults.direction, -me.defaults.index * me.moveFrame, function(){
						if(me.defaults.index <= 0){
							me.defaults.index = me.items.length - 2;
							me.itemParent.style[me.defaults.direction] = -me.defaults.index * me.moveFrame + "px";
						}
						me.delayPlay();
					});
					me.removeAllClass(me.origins);
					me.$add(me.origins[me.defaults.index <= 0 ? me.items.length - 3 : me.defaults.index - 1], me.defaults.origins[1]);
				}, 300)
			};
			this.defaults.optionObj[1].onclick = function(){
				if(me.flg) clearInterval(me.flg)
				setTimeout(function(){
					me.defaults.index++
					me.animate(me.itemParent, me.defaults.direction, -me.defaults.index * me.moveFrame, function(){
						if(me.defaults.index >= me.items.length - 1){
							me.defaults.index = 1;
							me.itemParent.style[me.defaults.direction] = -me.defaults.index * me.moveFrame + "px";
							//me.css(me.itemParent, me._default.direction, 0);
						}
						me.delayPlay();
					});
					me.removeAllClass(me.origins);
					me.$add(me.origins[me.defaults.index >= me.items.length - 1 ? 0 : me.defaults.index - 1], me.defaults.origins[1]);
				}, 300)
			};
		},
		removeAllClass : function(elms){
			for(var j = 0, k = elms.length; j < k; j++){
				this.$remve(elms[j], this.defaults.origins[1])
			}
		},
		delayPlay : function(){
			var me = this;
			setTimeout(function(){
				if(me.defaults.cycle) me.play();
			}, 2000);
		},
		parentHover :function(){
			var me = this;
			this.itemParent.onmouseover = function(){
				clearInterval(me.flg)
			}
			this.itemParent.onmouseout = function(){
				me.play();
			}
		}
	};	

	win.Carousel = Carousel;
})(window)