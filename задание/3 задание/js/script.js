$(document).ready(function(){
	//вызов плагина для создания контрола описание методов и параметров в файле /myLike/jQuery.fn.myLike.js
	$("#myLikeContainer").myLike({
		// "buttonPosition":"right",
		// "tabindex":1,
		// "showButton":false,
		"buttonName":"Оценить",
		"currentValue":3,
		"starsCount" : 5,
		"onClick" : function(value){
			alert(value===false?"Значение не выбрано":("Выбранное значение : "+value));
		}
	});
	
	$("#removeControl").on("click",function(){
		//удаление контрола
		$("#myLikeContainer").myLike("remove");
	})
});