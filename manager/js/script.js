'use strict'

// TODO: add another statuses
let statuses = new Map();
statuses.set("processing", "в обработке");
		
let app = angular.module('shop', ['ngMaterial', 'ngMessages', 'ngRoute']);
app.constant('API_URL', 'https://codetogether.ru/wp-json/wc/v3/');
app.constant('STATUSES', statuses);
app.constant('DUMMY_IMAGE', 'https://via.placeholder.com/460/460');

app.config(function($httpProvider) {
	let auth = window.btoa('ck_000e1f9b7fd5200992a3fdb46f982c495ac721f8:cs_93ff2e592ee90b6c54d45abe78277b0992684979');
	$httpProvider.defaults.headers.common.Authorization = 'Basic ' + auth;
});

app.config(function($mdThemingProvider, $routeProvider, $locationProvider){
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
			'/product', {
				templateUrl: 'templates/product.html',
				controller: 'productController'
			}
		)
		.when(
			'/product/:id', {
				templateUrl: 'templates/product.html',
				controller: 'productController'
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
		return string ? String(string).replace(/<[^>]+>/gm, '') : '';
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

app.controller('productsController', function($scope, $http, API_URL, DUMMY_IMAGE, $mdDialog) {
	$scope.pageName = 'Товары';
	$scope.hideProgress = false;
	$scope.products = [];
	$scope.dummyImage = DUMMY_IMAGE;

	$scope.getProducts = function() {
			$http.get(API_URL + 'products').then(
				result => {
					$scope.products = result.data;
					$scope.hideProgress = true;
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

app.controller('productController', function($scope, $http, $routeParams, API_URL, $mdDialog, $filter, $location) {
	$scope.productName = '';
	$scope.productPrice = '';
	$scope.productDescription = '';
	$scope.productCategories = [];
	$scope.categories = [];
	if ($routeParams.id) {
		let productId = +$routeParams.id;
		$http.get(API_URL + `products/${productId}`).then(
			product => {
				$scope.productName = product.data.name;
				$scope.productPrice = product.data.price;
				$scope.productDescription = $filter('removeTags')(product.data.description);
				product.data.categories.forEach(category => {
					$scope.productCategories.push(category.id);
				})
			},
			error => {
				$mdDialog.show(
					$mdDialog.alert()
					.clickOutsideToClose(true)
					.title('Ошибка. Товар не найден')
					.ok('Закрыть')
				);
			}
		)
	}

	$scope.addProduct = function() {
		const categories = [];
		if (!$scope.productCategories.length) {
			$mdDialog.show(
				$mdDialog.alert()
				.clickOutsideToClose(true)
				.title('Ошибка добавления товара')
				.ok('Закрыть')
			);
			return;	
		}
		$scope.productCategories.forEach(id => {
			categories.push({'id': id});
		});
		const newProduct = {
			name: $scope.productName,
			type: 'simple',
			regular_price: $scope.productPrice,
			description: $scope.productDescription,
			short_description: $scope.productDescription,
			categories: categories
		}
		$http.post(API_URL + 'products', newProduct).then(
			res => {
				if (res) {
					$mdDialog.show(
						$mdDialog.alert()
						.clickOutsideToClose(true)
						.title('Успех')
						.ok('Закрыть')
					);
					$location.url('/products');
				}
			}
		)
	}

	$scope.getCategories = function() {
		$http.get(API_URL + 'products/categories').then(
			res => {
				if (res.data.length) {
					$scope.categories = res.data;
				}
			}
		)
	}

});

