/*
 ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ

 ---- 1 ----
 INIT
 $(selector).myLike({
	"buttonPosition" 	: "bottom",				// положение кнопки для отправки данных. свойство имеет значения - bottom|left|right - внизу|слева|справа соответственно
	"currentValue" 		: 0,					// текущее значение. по умолчанию 0
	"tabindex" 			: 0,					// аттрибут для кнопки, для использования клавиши табуляции. по умолчанию 0
	"showButton" 		: true,					// если значение false, то функционал голосования будет не доступен. по умолчанию true
	"buttonName" 		: "Кнопка",				// текст на кнопке. по умолчанию "Кнопка"
	"starsCount" 		: 5,					// максимальное количество баллов (звезд). по умолчанию 5
	//events
	"onClick" 			: function(value){},	// функция возвращает число - показывающее текущее выбранное значение для голосования или false если значение не указано
 });

 ---- 2 ----
REMOVE //удаляет контрол вместе с контейнером
 $(selector).myLike("remove")

 ---- - ----

 */
(function($){
    var methods = {
		//метод удаляет конторл с контейнером
        remove : function(){
            var elem = $(this);
			//удаляются слушатели
			elem.find(".starsContainer").off("mouseenter.myLike mouseleave.myLike");
			elem.find(".star").off("click.myLike");
			elem.find(".myLikeButton").off("click.myLike");
            //удаляется контрол с контейнером
			elem.remove();
        },

		//инициализация контрола
        init : function(options){
			
			//параметры инициализации. описаны в начале
            var settings = $.extend( {
				"buttonPosition" 	: "bottom",
				"currentValue" 		: 0,
				"tabindex" 			: 0,
				"showButton" 		: true,
				"buttonName" 		: "Кнопка",
				"starsCount" 		: 5,
				//events
				"onClick" 			: function(value){},
            }, options);

            return this.each(function() {
                var elem = $(this);
				//добавляем класс принадлежности к нашему контролу
				elem.addClass("myLike");

				// стили для правильного отображения контрола при определенных входных параметрах
				var myLikeContainerClasses = "myLikeContainer "+settings.buttonPosition+(settings.buttonPosition!="bottom"?" inline":"")+(settings.showButton?" showButton":" hideButton");
				
				//начало наполнения контрола
				var content = "<div class='"+myLikeContainerClasses+"'>";
				var stars = "<div class='starsContainer'>";
				//"звезды"
				for(var i=0;i<settings.starsCount;i++){
					var active = settings.currentValue>i?"active":"";
					stars += "<div class='star "+active+"'></div>";
				}
				stars += "</div>";
				content += stars;
				if(settings.showButton){ // добавить кнопку для голосования,
					var button = "<div class='myLikeButtonContainer'><div class='myLikeButton' tabindex='"+(settings.tabindex>=0?settings.tabindex:"-1")+"'>"+settings.buttonName+"</div></div>"; 
					content += button;
				}
				content += "</div>";
				// разместить контрол в DOM'e
				elem.append(content);
				
				//если кнопка не скрыта, навешать слушателей
				if(settings.showButton){
					//если необходимо разместить несколько таких контролов, то необходимо отказаться от переменной stars, определять ее в слушателях
					var stars = elem.find(".starsContainer");
					//нажатие на кнопку голосования
					elem.find(".myLikeButton").on("click.myLike",function(){
						var target = $(this);
						var value = false;
						$.each(stars.find(".star"),function(i){
							var selectedStar = $(this);
							//если из всех звезд есть выбранная запомнить ее позицию и на этом основании вычислить значение
							if(selectedStar.hasClass("selected")){
								value = i+1;
								return false;
							}
						});
						//callback функция при голосовании
						settings.onClick(value);
					});
					// наведение на блок со звездами. для скрытия текущего значения.
					stars.on( "mouseenter.myLike mouseleave.myLike", function(e){
						var target = $(this);
						if(e.type=="mouseenter"){
							target.find(".star").addClass("onHover");
						}else{
							target.find(".star").removeClass("onHover");
						}
					});
					// нажатие на звезду. выделяет выбранную звезду. По желанию дизайн можно переделать.
					stars.find(".star").on("click.myLike",function(){
						var target = $(this);
						target.addClass("selected").siblings().removeClass("selected");
					});
				}
            });
        }
    };

	//вызов требуемого метода, если существуует
    $.fn.myLike = function(method ) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Метод с именем ' +  method + ' не существует для jQuery.fn.myLike' );
        }
    };

})(jQuery);