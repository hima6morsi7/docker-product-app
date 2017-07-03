regions = [
{name: "All regions", value: ""},
{name: "Cairo", value: "Cairo"},

];

categories = [
{name: "All Categories", value: ""},
{name: "car", value: "car"},

];
appControllers.controller('mainController', function($scope, $route, $routeParams, AuthenticationService,UserService){
	
	$scope.params = $routeParams;
    $scope.isAuth = AuthenticationService.isAuthenticated;
    $scope.refresh = function(){

        UserService.refresh(window.sessionStorage.token).success(function(data) {
                console.log(data);
            })
                .error(function(status, data) {
                    console.log(status, data);
                });
        }    

});

appControllers.controller('productsController', ['$scope', '$sce', 'ProductsService','$window','UserService',
    function productsController($scope, $sce, ProductsService,$window,UserService) {
        $scope.regions = regions;
        $scope.categories = categories;
        $scope.products = [];
        //DEFINITIONS
        //Filter search
        $scope.searchTerm = ''; //sets a blank string to hold a breweryname

        //Pagination Controllers
        $scope.pageSize = 6; //displays 6 items per page
        $scope.pageIndex = 1; //indicates the index of a certain page - default start at 1
        $scope.maxSize = 6; //indicates the number of indexes to display in the pagination element - triggers ellipses
        
        // ProductsService.all().success(function(data) {
        //     $scope.products = data;
        // }).error(function(data, status) {
        //     console.log(status);
        //     console.log(data);
        // });
         $scope.getProducts = function() {
         ProductsService.allByPage($scope.pageSize, $scope.pageIndex).success(function(data) {
             console.log(data);
            $scope.products = data.docs;
        }).error(function(data, status) {
            console.log(status);
            console.log(data);
        });
         }
       $scope.getProducts();
    }
    ]);

appControllers.controller('productController', ['$scope', '$routeParams', '$location', '$sce', 'ProductsService', 'AuthenticationService','$window','UserService',
    function productController($scope, $routeParams, $location, $sce, ProductsService, AuthenticationService,$window,UserService) {

        $scope.product = {};
        var id = $routeParams.id;
        ProductsService.get(id).success(function(data) {
            console.log(data);
            $scope.product = data;
            $scope.isAuth = AuthenticationService.isAuthenticated;
        }).error(function(data, status) {
            console.log(status);
            console.log(data);
            $location.path("/products");
        });
        $scope.deleteProduct = function deleteProduct(id) {
            if (id != undefined) {
                ProductsService.delete(id).success(function(data) {
                    $location.path("/products");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }
    }
    ]);

appControllers.controller('productMessageController', function($scope, $routeParams){

	var id = $routeParams.id;
	$scope.product = products[id-1];
});

appControllers.controller('productNewController', ['$scope', '$location', 'ProductsService', 'AuthenticationService',
    function productNewController($scope, $location, ProductsService, AuthenticationService) {
        $scope.regions = regions;
        $scope.categories = categories;
        
        $scope.save = function save(product) {
            if (product != undefined 
                && product.name != undefined
                && product.category != undefined
                && product.region != undefined) {
                ProductsService.create(product).success(function(data) {
                    console.log(data);
                    $location.path("/products");
                }).error(function(status, data) {
                    swal("Session expired please refresh", "error");
                    swal({
                    title: "Error",
                    text: "Session expired please refresh!",
                    type: "warning",
                    confirmButtonClass: "btn-danger",
                    confirmButtonText: "OK",
                    closeOnConfirm: false,
                    });

                    console.log(status);
                    console.log(data);
                });
            }
        }
    }
    ]);

appControllers.controller('productEditController', ['$scope', '$routeParams', '$location', '$sce', 'ProductsService', 'AuthenticationService',
    function productEditController($scope, $routeParams, $location, $sce, ProductsService, AuthenticationService) {

        $scope.product = {};
        var id = $routeParams.id;
        if (!AuthenticationService.isAuthenticated)
            $location.path("/product/"+id);
        $scope.regions = regions;
        $scope.categories = categories;
        ProductsService.get(id).success(function(data) {
            console.log(data);
            $scope.product = data;

        }).error(function(data, status) {
            console.log(status);
            console.log(data);
        });

        $scope.save = function save(product) {
            console.log(product);
            if (product != undefined 
                && product.name != undefined
                && product.category != undefined
                && product.region != undefined) {                  
                ProductsService.update(product).success(function(data) {
                    $location.path("/product/"+product.id);
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }
    }
    ]);

appControllers.controller('adminUserController', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',
	function adminUserController($scope, $location, $window, UserService, AuthenticationService){

     $scope.signIn = function signIn (username, password) {
        if (username != null && password != null) {
            UserService.signIn(username, password).success(function(data) {
               console.log(data);
               AuthenticationService.isAuthenticated = true;
               $window.sessionStorage.token = data.token;
               $location.path("/products");
           })
            .error(function(status, data) {
                $scope.error_login = true;
            });
        }
    }

    $scope.register = function register (username, email, phone, password, passwordConfirm){
     console.log(username);
     if (false){
        console.log("already connected");
    }
    else {
        UserService.register(username, email, phone, password, passwordConfirm)
        .success(function(){
           $location.path("/signin");
       })
        .error(function(status, data){
           $scope.error_signup = true;
           console.log(status);
           console.log(data);
       })
    }
}

$scope.logOut = function logOut() {
    
    if (AuthenticationService.isAuthenticated) {    
       UserService.logOut().success(function(data) {
           console.log("logout");
           AuthenticationService.isAuthenticated = false;
           delete $window.sessionStorage.token;
           $location.path("/");
       }).error(function(status, data) {
        console.log(status);
        console.log(data);
    });
   }
   else {
    $location.path("/signin");
}
}
}
]);