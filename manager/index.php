<?php
	session_start();
	if (!$_SESSION['user']) {
		header('Location: /');
		exit();
	}
?>
<!DOCTYPE html>
<html data-ng-app="shop">
<head>
	<meta charset="UTF-8">
	<title>Управление магазином</title>
	<base href="/manager/">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic">
	<link rel="stylesheet" href="css/angular-material.min.css">
	<link rel="stylesheet" href="css/style.css">
</head>
<body>

<div ng-controller="mainController" ng-cloak>
		<md-nav-bar md-selected-nav-item="currentNavItem">
			<md-nav-item md-nav-href="orders" name="orders">
			  Заказы
			</md-nav-item>
			<md-nav-item md-nav-href="products" name="products">
			  Товары
			</md-nav-item>
			<md-nav-item md-nav-href="product" name="product">
				Добавить товар
			</md-nav-item>
		</md-nav-bar>
</div>	  

	<div ng-view></div>

	<script src="js/angular.min.js"></script>
	<script src="js/angular-route.js"></script>
	<script src="js/angular-animate.min.js"></script>
	<script src="js/angular-aria.min.js"></script>
	<script src="js/angular-messages.min.js"></script>
	<script src="js/angular-material.min.js"></script>
	<script src="js/script.js"></script>
</body>
</html>