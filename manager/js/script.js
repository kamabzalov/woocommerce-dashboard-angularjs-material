'use strict'

let statuses = new Map();
statuses.set('processing', 'в обработке');
		
let app = angular.module('shop', ['ngMaterial', 'ngMessages', 'ngRoute']);
app.constant('API_URL', 'https://codetogether.ru/wp-json/wc/v3/');
app.constant('STATUSES', statuses);
app.constant('DUMMY_IMAGE', 'https://via.placeholder.com/460/460');

app.config(function($httpProvider){
	let auth = window.btoa('ck_000e1f9b7fd5200992a3fdb46f982c495ac721f8:cs_93ff2e592ee90b6c54d45abe78277b0992684979');
	$httpProvider.defaults.headers.common.Authorization = 'Basic ' + auth;
});

app.config(function($mdThemingProvider, $routeProvider, $locationProvider){
	$mdThemingProvider.theme('primary').primaryPalette('blue').accentPalette('orange');
	$routeProvider
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
			templateUrl: 'templates/orders.html',
			controller: 'ordersController'
        }) 
		$locationProvider.html5Mode({
			enabled: true
		});
});

app.filter('ordersStatus', function(STATUSES){
	return function(status) {
		if (STATUSES.get(status)) {
			return STATUSES.get(status);
		} else {
			return '';
		}
	}
});

app.filter('removeTags', function(){
	return function(string) {
		return string ? String(string).replace(/<[^>]+>/gm, '')  : '';
	}
})

app.controller('mainController', function($scope, $location) {
	$scope.currentNavItem = $location.path().split('/')[1];
});

app.controller('ordersController', function ($scope, $http, $mdDialog, API_URL) {
	$scope.pageName = 'Заказы';
	$scope.orders = [];
	$scope.hideProgress = false;
	
	$scope.getOrders = function() {
		$http.get(API_URL + 'orders').then(
			result => {
				if(result.data.length) {
					$scope.orders = result.data
				} else {
					$scope.hideProgress = true;
				}
			}
		);
	}

	$scope.deleteOrder = function(orderId) {
		$http.delete(API_URL + `orders/${orderId}`).then(
				result => {
					$scope.getOrders();
					$mdDialog.show(
						$mdDialog.alert()
						.clickOutsideToClose(true)
						.title('Ошибка удаления заказа')
						.ok('Закрыть')
					);
				},
				_ => $mdDialog.show(
						$mdDialog.alert()
						.clickOutsideToClose(true)
						.title('Ошибка удаления заказа')
						.ok('Закрыть')
					)
			)
	};
});

app.controller('productsController', function ($scope, $http, $mdDialog, API_URL, DUMMY_IMAGE) {

	$scope.pageName = 'Товары';
	$scope.hideProgress = false;
	$scope.dummyImage = DUMMY_IMAGE;
	$scope.page = 0;
	$scope.disabled = false;
	$scope.products = [];

    $scope.getProducts = function () {
        $scope.page++;
        $http.get(API_URL + `products?page=${$scope.page}`).then(
            result => {
                if (result.data.length > 0) {
                    result.data.forEach(item => $scope.products.push(item));
                    $scope.hideProgress = true;
                } else {
                    $scope.disabled = true;
                }
            }
        );
	};
	
	$scope.deleteProduct = function(id) {
		$http.delete(API_URL + `products/${id}`).then(
			_ => $scope.getProducts(),
			_ => $mdDialog.show(
						$mdDialog.alert()
						.clickOutsideToClose(true)
						.title('Ошибка удаления заказа')
						.ok('Закрыть')
					)
			)
	}
});

app.controller('productController', function ($scope, $http, $routeParams, $mdDialog, $filter, $location, API_URL) {
	$scope.productName = '';
	$scope.productPrice = '';
	$scope.productDesc = '';
	$scope.productCats = [];
	$scope.categories = [];
	$scope.productId = -1;

	if($routeParams.id) {
		$scope.productId = $routeParams.id;
		$http.get(API_URL + `products/${$scope.productId}`).then(
			product => {
				$scope.productName = product.data.name;
				$scope.productPrice = product.data.price;
				$scope.productDesc = $filter('removeTags')(product.data.description);
				product.data.categories.forEach(category => {
					$scope.productCats.push(category.id);
				})
			}
		)
	}

	$scope.saveProduct = function() {
		const categories = [];
		const newProduct = {
			name: $scope.productName,
			type: 'simple',
			regular_price: $scope.productPrice,
			description: $scope.productDesc,
			short_description: $scope.productDesc,
			categories: categories
		};
		if($scope.productId == -1) {
			if(!$scope.productCats.length) {
				$mdDialog.show(
					$mdDialog.alert()
					.clickOutsideToClose(true)
					.title('Ошибка сохранения товара')
					.ok('Закрыть')
				);
				return;
			}
			$scope.productCats.forEach(id => {
				categories.push({'id': id});
			});
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
		} else {
			$http.put(API_URL + `products/${$scope.productId}`, newProduct).then(
				res => $location.url('/products')
			);
		}

	}

	$scope.getCategories = function() {
		$http.get(API_URL + `products/categories`).then(
			res => {
				if (res.data.length) {
					$scope.categories = res.data;
				}
			}
		)}
});