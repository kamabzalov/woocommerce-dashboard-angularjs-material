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

app.controller('mainController', function($scope, $http, API_URL) {
	$scope.currentNavItem = 'orders';
});

app.controller('ordersController', function($scope, $http, API_URL, $mdDialog) {
	$scope.pageName = 'Заказы';
	$scope.hideProgress = false;
	$http.get(API_URL + 'orders').then(
		result => $scope.orders = result.data,
		error => {
					$scope.hideProgress = true;
					$mdDialog.show(
						$mdDialog.alert()
							.clickOutsideToClose(true)
							.title('Ошибка получения списка заказов')
							.ok('Закрыть')
					);
				}
	);
});

app.controller('productsController', function($scope, $http) {
	$scope.pageName = 'Товары';
});