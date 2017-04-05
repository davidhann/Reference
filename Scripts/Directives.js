'use strict'

Foo.directive('tabclick', ['$location', function ($location) {
    // item list header tab click
    return function (scope, element, attrs) {
        var clickingCallback = function () {
            // raise infinite digest loop error, but no problem page action.
            // https://github.com/angular/angular.js/issues/9635
            var selectedtab = attrs.tabclick;
            $location.hash(selectedtab);
            scope.$broadcast(selectedtab + 'TabClick');
        }
        element.bind('click', clickingCallback);
    }
}])
.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
            if (event.which == 13) {
                scope.$apply(function () {
                    event.target.blur();
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
})
.directive('ckEditor', ['$timeout', function ($timeout) {
    return {
        require: '?ngModel',
        scope: false,
        link: function (scope, elm, attr, ngModel) {
            var ck = CKEDITOR.replace(elm[0]);
            if (!ngModel) return;
            function updateModel() {
                scope.$apply(function () {
                    ngModel.$setViewValue(ck.getData());
                });
            }
            function instanceReady() {
                ck.setData(ngModel.$viewValue);
                $timeout(function () {
                    ck.focus();
                });
            }
            ngModel.$render = function () {
                ck.setData(ngModel.$viewValue);
            };
            ck.on('instanceReady', instanceReady);            
            ck.on('change', updateModel);
            ck.on('key', updateModel);
            ck.on('dataReady', updateModel);
        }
    };
}])
.directive('loading', ['$http', 'LoadingService', function ($http, LoadingService) {
    return {
        restrict: 'A',
        replace: true,
        template: function (scope) {
            var result = '';
            return result;
        },
        link: function (scope, elm, attrs) {
            scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };
            angular.element(document).ready(function () {
                scope.$watch(scope.isLoading, function (v) {
                    // loading
                    if (v) {
                        angular.element(elm).show();
                    } else {
                        angular.element(elm).hide();
                    }
                });
            });
        }
    }
}])
.directive('loadtemplate', ['$compile', '$templateRequest', function ($compile, $templateRequest) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            angular.element(document).ready(function () {
                var templateUrl = '';
                $templateRequest(templateUrl).then(function (html) {
                    var template = angular.element(html);
                    element.append(template);
                    $compile(template)(scope);
                });
            });
        }
    }
}])
.directive('bnModals', ['$rootScope', 'modals', function ($rootScope, modals) {
    // Return the directive configuration.
    return (link);
    // I bind the JavaScript events to the scope.
    function link(scope, element, attributes) {
        // I define which modal window is being rendered. By convention, 
        // the subview will be the same as the type emitted by the modals
        // service object.
        scope.subview = null;
        // If the user clicks directly on the backdrop (ie, the modals 
        // container), consider that an escape out of the modal, and reject
        // it implicitly.
        element.on(
			'click',
			function handleClickEvent(event) {
			    if (element[0] !== event.target) {
			        return;
			    }
			    scope.$apply(modals.reject);
			}
		);
        // Listen for "open" events emitted by the modals service object.
        $rootScope.$on(
			'modals.open',
			function handleModalOpenEvent(event, modalType) {
			    scope.subview = modalType;
			}
		);
        // Listen for "close" events emitted by the modals service object.
        $rootScope.$on(
			'modals.close',
			function handleModalCloseEvent(event) {
			    scope.subview = null;
			}
		);
    }
}])
.directive('onlyNum', function () {
    return function (scope, element, attrs) {
        var keyCode = [8, 9, 17, 37, 39, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 109, 110, 189, 190];
        element.bind("keydown", function (event) {
            if ($.inArray(event.which, keyCode) == -1) {
                scope.$apply(function () {
                    scope.$eval(attrs.onlyNum);
                    event.preventDefault();
                });
                event.preventDefault();
            }

        });
    };
})
.directive('datepicker', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            angular.element(document).ready(function () {
                $timeout(function () {
                    element.datepicker({
                        changeMonth: true,
                        changeYear: true,
                        dateFormat: scope.com.var.config.datePickerFormat,
                        onSelect: function (date) {
                            scope.$apply(function () {
                                ngModelCtrl.$setViewValue(date);
                            });
                        }
                    });
                });
            });
        }
    }
}])
.directive('currency', ['$filter', function ($filter) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {
            if (!ngModel) {
                return;
            }
            elem.bind('keypress', function () {
                var val = angular.element(elem).val().replace(/[\,]/g, '');
                if (val.indexOf('.') > -1) val = val.split('.')[0];
                if (val.length > 15) return false;
                if (Number(val) > 100000000000000) return false;
            });
            ngModel.$formatters.unshift(function () {
                if (ngModel.$modelValue == '') return '';
                var result = Number(ngModel.$modelValue);
                var fraction = 2;
                if ((result + '').indexOf('.') > -1) fraction = (result + '').split('.')[1].length;
                else fraction = 0;
                if (result == 0) fraction = 0;
                return $filter('number')(ngModel.$modelValue, fraction);
            });
            ngModel.$parsers.unshift(function (viewValue) {
                if (viewValue == '') {
                    elem.val('');
                    return '';
                }
                var plainNumber = viewValue.replace(/[\,]/g, '');
                var containsComma = plainNumber.indexOf('.');
                if (containsComma == -1) {
                    var result = $filter('number')(plainNumber);
                    elem.val(result);
                } else {
                    var numbers = plainNumber.split('.');
                    var number = numbers[0];
                    var fraction = numbers[1].substr(0, 2);
                    plainNumber = number;
                    if (fraction.length > 0) plainNumber += '.' + fraction;
                    var result = $filter('number')(number) + '.' + fraction;
                    ngModel.$setViewValue(plainNumber);
                    elem.val(result);
                }
                if (isNaN(plainNumber)) plainNumber = '0';
                return Number(plainNumber) + '';
            });
        }
    };
}])
.directive('compile', ['$compile', function ($compile) {
    return function (scope, element, attrs) {
        scope.$watch(
          function (scope) {
              // watch the 'compile' expression for changes
              return scope.$eval(attrs.compile);
          },
          function (value) {              
              // when the 'compile' expression changes
              // assign it into the current DOM
              element.html(value);
              // compile the new DOM and link it to the current
              // scope.
              // NOTE: we only compile .childNodes so that
              // we don't get into infinite loop compiling ourselves
              $compile(element.contents())(scope);
          }
      );
    };
}])