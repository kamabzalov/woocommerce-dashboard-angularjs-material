'use strict'

let statuses = new Map();
// TODO: add another statuses
statuses.set("processing", "в обработке");
		
let app = angular.module('shop', ['ngMaterial', 'ngMessages', 'ngRoute']);
app.constant('API_URL', 'https://codetogether.ru/wp-json/wc/v3/');
app.constant('STATUSES', statuses);

app.config(function($httpProvider) {
	let auth = window.btoa('ck_000e1f9b7fd5200992a3fdb46f982c495ac721f8:cs_93ff2e592ee90b6c54d45abe78277b0992684979');
	$httpProvider.defaults.headers.common.Authorization = 'Basic ' + auth;
});

app.config(function($mdThemingProvider, $routeProvider, $locationProvider, $httpProvider){
	$mdThemingProvider.theme('primary').primaryPalette('blue').accentPalette('orange');
	$routeProvider
		.when(
			'/orders', {
				templateUrl: 'templates/orders.html',
				controller: 'ordersController'
			}
		)
		.when(
			'/products', {
				templateUrl: 'templates/products.html',
			    controller: 'productsController'
			}
		)
		.when(
			'/add-product', {
				templateUrl: 'templates/add-product.html',
				controller: 'addProductController'
			}
		)
		.otherwise({
			templateUrl: "templates/orders.html",
			controller: 'ordersController'
        }) 
	$locationProvider.html5Mode(true);
});

app.filter("orderStatus", function(STATUSES) {
	return function(status) {
		if (STATUSES.get(status)) {
			return STATUSES.get(status);
		} else {
			return '';
		}
	}
});

app.filter("removeTags", function() {
	return function(string) {
		return  string ? String(string).replace(/<[^>]+>/gm, '') : '';
	}
})

app.controller('mainController', function($scope, $http, API_URL) {
	$scope.currentNavItem = 'orders';
});

app.controller('ordersController', function($scope, $http, API_URL, $mdDialog) {
	$scope.pageName = 'Заказы';
	$scope.hideProgress = false;

	$scope.getOrders = function() {
		$http.get(API_URL + 'orders').then(
			result => {
				if (result.data.length) {
					$scope.orders = result.data
				} else {
					$scope.hideProgress = true;
				}
			},
			_ => {
					$scope.hideProgress = true;
					$mdDialog.show(
						$mdDialog.alert()
							.clickOutsideToClose(true)
							.title('Ошибка получения списка заказов')
							.ok('Закрыть')
					);
				}
		);
	}

	$scope.deleteOrder = function(orderId) {
		$http.delete(API_URL + `orders/${orderId}`).then(
			result => $scope.getOrders(),
			_ => $mdDialog.show(
					$mdDialog.alert()
					.clickOutsideToClose(true)
					.title('Ошибка удаления заказа')
					.ok('Закрыть')
			)
		);
	}
});

app.controller('productsController', function($scope, $http, API_URL, $mdDialog) {
	$scope.pageName = 'Товары';
	$scope.hideProgress = false;
	$scope.products = [];

	// TODO: добавить infinite scroll https://sroze.github.io/ngInfiniteScroll/
	$scope.getProducts = function() {
		$http.get(API_URL + 'products').then(
			result => {
				if (result.data.length) {
					this.hideProgress = true;
					$scope.products = result.data;
				}
			}
		);
	};

	$scope.deleteProduct = function(id) {
		$http.delete(API_URL + `products/${id}`).then(
			result => $scope.getProducts(),
			error => $mdDialog.show(
						$mdDialog.alert()
						.clickOutsideToClose(true)
						.title('Ошибка удаления товара')
						.ok('Закрыть')
					)	
		);
	}
});