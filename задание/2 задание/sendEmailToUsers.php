<?//файл для крона?>
<?
error_reporting(E_ALL);
if(!$_SERVER["DOCUMENT_ROOT"]) $_SERVER["DOCUMENT_ROOT"] = dirname(dirname(__FILE__));
require_once($_SERVER['DOCUMENT_ROOT'] . "/bitrix/modules/main/include/prolog_before.php");
CModule::IncludeModule('iblock');
CModule::IncludeModule('sale');

set_time_limit(0);
//вызов функции для отправки писем
// возможные входные параметры
//		$EMAIL_TYPE - Тип почтового события. по умолчанию - "BASKET_PRODUCTS_EMAIL",
//		$SITE_ID - ID сайта. по уммолчанию - "s1"
//		$TIME_FROM - дата создание товаров в корзине не раньше чем $TIME_FROM. по умолчанию 1 месяц назад
sendEmailToUsers();

function sendEmailToUsers($EMAIL_TYPE = "BASKET_PRODUCTS_EMAIL", $SITE_ID = "s1", $TIME_FROM = false){
	if(!$TIME_FROM){
		$TIME_FROM = ConvertTimeStamp(strtotime("-1 months"),"SHORT");
	}
	//массив товаров в корзинах пользователей имеет следующую структуру
	/*
		$basketProductsArray = array(
			// массив разбивает товары по пользователям,где ключ = ID пользователя
			array(
				// массив, элементами которого являются товары одного пользователя,где ключ = ID товара корзины
				array(
					"DATA" => array(),	//список полей товара в корзине
					"IN_ORDER" => ""	//если значение = "Y", значит товар есть в заказе пользователя
				)
			)
		)
	*/
	$basketProductsArray = array();
	//запрос товаров из корзины с датой создания >= 1 месяц назад
	$dbBasketItems = CSaleBasket::GetList(
		array("ID" => "DESC"),
		array(
			"!USER_ID" => false,
			">=DATE_INSERT" => $TIME_FROM
		),
		false,
		false,
		array()
	);

	while($items = $dbBasketItems->Fetch()){
		//если есть ID пользователя добавляем в массив элемент
		if($items["USER_ID"]){
			$basketProductsArray[$items["USER_ID"]][$items["PRODUCT_ID"]] = array("DATA"=>$items);
			if($items["ORDER_ID"]){ //если товар есть в заказе добавляем метку
				$basketProductsArray[$items["USER_ID"]][$items["PRODUCT_ID"]]["IN_ORDER"] = "Y";
			}
		}
	}

	//получаем данные о пользователях
	/*
		$usersArray = array(
			// массив, элементами которого являются пользователи,где ключ = ID пользователя
			array(
				"NAME" => "",	//Имя [Фамилия]
				"EMAIL" => ""	//Адрес почты
			)
		)
	*/
	$usersArray = array();
	$userIDfilterValue = implode("|",array_keys($basketProductsArray));	//ID всех нужных пользователей
	$rsUsers = CUser::GetList(($by="name"), ($order="asc"), array("ID" => $userIDfilterValue));
	while($rsUser = $rsUsers->Fetch()){
		$usersArray[$rsUser["ID"]] = array(
			"NAME" => $rsUser["NAME"].($rsUser["LAST_NAME"]?" ".$rsUser["LAST_NAME"]:""),
			"EMAIL" => $rsUser["EMAIL"]
		);
	}

	//проходим по всем нужным пользователям
	foreach($basketProductsArray as $k1=>$users){
		$productsList = "";
		//заполняем список товаров пользователя
		foreach($users as $k2=>$userProducts){
			//если товар есть в заказе - пропускаем его
			if($userProducts["IN_ORDER"]&&$userProducts["IN_ORDER"]=="Y"){
				continue;
			}
			$productsList .= "<li><a target='_blank' href='".((CMain::IsHTTPS() ? "https://" : "http://").$_SERVER["SERVER_NAME"].$userProducts["DATA"]["DETAIL_PAGE_URL"])."'>".$userProducts["DATA"]["NAME"]."</a></li>";
		}
		//если список не пустой, отправляем письмо
		if($productsList!=""){
			$arMailFields = Array(
				"PRODUCTS_LIST" => $productsList,			//список товаров
				"USER" => $usersArray[$k1]["NAME"],			//Имя пользователя
				"EMAIL_TO" => $usersArray[$k1]["EMAIL"],	//Адрес почты пользователя
			);
			$eId = CEvent::Send($EMAIL_TYPE, $SITE_ID, $arMailFields);
		}
	}
}
?>

<!--Создаем Тип почтового события = $EMAIL_TYPE (Настройки - Почтовые события - Тип почтовых событий)-->
<!--Создаем Почтовый шаблон (Настройки - Почтовые события - Почтовые шаблоны)-->
<p>Добрый день, #USER#</p>
<p>
	В вашем вишлисте хранятся товары :
	<ul>
		#PRODUCTS_LIST#
	</ul>
</p>