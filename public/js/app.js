var productApp = angular.module('productApp', ['ngRoute', 'appControllers', 'appServices']);
var appControllers = angular.module('appServices', []);
var appServices = angular.module('appControllers', []);

var options = {};
options.api = {};
options.api.base_url = "http://localhost:3001";

///Routes

productApp.config(function($routeProvider) {
	$routeProvider

		//home
		.when('/', {
			templateUrl: 'pages/home.html',
			controller: 'mainController'
		})

		//product list

		.when('/products', {
			templateUrl: 'pages/list_product.html',
			controller: 'productsController'
		})

		//product new

		.when('/product/new', {
			templateUrl: 'pages/new_product.html',
			controller: 'productNewController'
		})

		//product

		.when('/product/:id', {
			templateUrl: 'pages/product.html',
			controller: 'productController'
		})

		//product message

		.when('/product/:id/message', {
			templateUrl: 'pages/send_message.html',
			controller: 'productMessageController'
		})

		//poduct edit

		.when('/product/:id/edit', {
			templateUrl: 'pages/edit_product.html',
			controller: 'productEditController'
		})

		//signIn

		.when('/signin', {
			templateUrl: 'pages/signIn.html',
			controller: 'adminUserController'
		})
		
		//signup

		.when('/register', {
			templateUrl: 'pages/register.html',
			controller: 'adminUserController'
		})

		.when('/logout', {
			templateUrl: 'pages/logOut.html',
			controller: 'adminUserController'
		})

		.otherwise({redirectTo:'/'})

		;
});

productApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

productApp.run(function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        //redirect only if both isAuthenticated is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAuthentication 
            && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {

            $location.path("/signin");
        }
    });
});