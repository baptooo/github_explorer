// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic']);

app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

app.config(function ($stateProvider) {
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'views/home.html'
        })
        .state('user', {
            url: '/user/{name}',
            templateUrl: 'views/user_single.html'
        })
        .state('repos', {
            url: '/user/{name}/repos',
            templateUrl: 'views/user_repos.html'
        })
        .state('repo', {
            url: '/repo/{name}',
            templateUrl: 'views/user_single_repo.html'
        })
        .state('doge', {
            url: '/doge',
            templateUrl: 'views/doge.html'
        })
        .state('settings', {
            url: '/settings',
            templateUrl: 'views/settings.html'
        });
    location.hash = '/home';
});

app.directive('shake', function () {
    return {
        restrict: 'E',
        transclude: true,
        template: '<div ng-transclude></div>',
        link: function (scope, elt, attr) {
            setTimeout(function() {
                if(!navigator.accelerometer) {
                    return false;
                }
                shake.startWatch(function () {
                    scope.$parent.$emit('shake');
                });
            }, 2e3);
        }
    }
});

var currentUser = null,
    settings = {
        cache: true,
        option: true,
        wonderful: true,
        gorgeous: true,
        ugly: false,
        crappy: false
    };

app.controller('SearchCtrl', ['$scope', '$http', function ($scope, $http) {
    var baseUri = 'https://api.github.com/users/';

    if(settings.cache) {
        if (!sessionStorage.getItem('githubSearchedUsers')) {
            sessionStorage.setItem('githubSearchedUsers', JSON.stringify({}));
        }
        $scope.cache = JSON.parse(sessionStorage.getItem('githubSearchedUsers'));
    }

    $scope.isCacheEmpty = function() {
        return settings.cache ? Object.keys($scope.cache).length : false;
    };

    $scope.searchForUser = function () {
        var name = $scope.githubUser;
        if (!name) {
            return false;
        }

        if (settings.cache && $scope.cache[name]) {
            $scope.updateCurrentUser($scope.cache[name]);
            return false;
        }
        $http.get(baseUri + name).success(function (data) {
            if(settings.cache) {
                $scope.cache[name] = data;
                sessionStorage.setItem('githubSearchedUsers', JSON.stringify($scope.cache));
            }
            $scope.updateCurrentUser(data);
            location.hash = '#user/' + data.login;
        });
    };

    $scope.updateCurrentUser = function (user) {
        currentUser = user;
    };

    $scope.$on('shake', function() {
        $scope.$apply(function() {
            $scope.shaked = true;
        });
    });
}]);

app.controller('UserSingleCtrl', ['$scope', function ($scope) {
    $scope.user = currentUser;
}]);

var currentRepo = null;
app.controller('UserReposCtrl', ['$scope', '$http', function ($scope, $http) {
    var cache = null;
    if(settings.cache) {
        if (!sessionStorage.getItem('githubUsersRepos')) {
            sessionStorage.setItem('githubUsersRepos', JSON.stringify({}));
        }
        cache = JSON.parse(sessionStorage.getItem('githubUsersRepos'));
    }
    $scope.user = currentUser;

    if (settings.cache && cache[currentUser.login]) {
        $scope.repos = cache[currentUser.login];
    } else {
        $scope.loading = true;
        $http.get(currentUser.repos_url).success(function (data) {
            if(settings.cache) {
                cache[currentUser.login] = data;
            }
            sessionStorage.setItem('githubUsersRepos', JSON.stringify(cache));
            $scope.repos = data;
            $scope.loading = false;
        });
    };

    $scope.setCurrentRepo = function (repo) {
        currentRepo = repo;
    }
}]);

app.controller('SingleRepoCtrl', ['$scope', function ($scope) {
    $scope.repo = currentRepo;
}]);

app.controller('SettingsCtrl', ['$scope', function($scope) {
    $scope.settings = settings;

    $scope.set = function(option, state) {
        $scope.settings[option] = !state;

        if(option == 'cache' && state) {
            $scope.emptyCache();
        }
    }

    $scope.emptyCache = function() {
        sessionStorage.removeItem('githubSearchedUsers');
        sessionStorage.removeItem('githubUsersRepos');
        $scope.cache = {};
    }
}]);