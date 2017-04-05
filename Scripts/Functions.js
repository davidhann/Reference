'use strict'

Foo.controller('CommonScopeCtrl', ['$scope', '$window', '$timeout', function ($scope, $window, $timeout) {
    // Common Scope
    $scope.com = {};
    // Common Variable
    $scope.com.var = {};
    // Common Function
    $scope.com.fn = {};
    // Is undefined or empty
    $scope.com.fn.IsUndefineOrEmpty = function (val) {
        return angular.isUndefined(val) || val == '';
    };
    // Open window
    $scope.com.fn.OpenWindow = function (url, width, height, option, target) {
        var iWidth = 1018;
        var iHeight = 680;
        if (width != null) iWidth = width;
        if (height != null) iHeight = height;
        var iOption = 'status=yes,scrollbars=yes';
        var iTarget = '_blank';
        if (option != null) iOption = option;
        if (target != null) iTarget = target;
        var iLeft = (screen.width / 2) - (iWidth / 2) - 3;
        var iTop = (screen.height / 2) - (iHeight / 2) - 44;
        $window.open(url, iTarget);
    };
    // Get url parameter object
    $scope.com.fn.GetUrlParameterObject = function () {
        var vars = [], hash;
        var hashes = $window.location.href.slice($window.location.href.indexOf('?') + 1).split('&');
        if (hashes.length == 1) {
            if (hashes[0].indexOf('=') != -1) {
                for (var i = 0; i < hashes.length; i++) {
                    hash = hashes[i].split('=');
                    vars.push(hash[0]);
                    vars[hash[0]] = hash[1];
                }
            }
        }
        return vars['Tabs'];
    };
    // Is undefine or empty or null
    $scope.com.fn.IsUndefineOrEmptyOrNull = function (val) {
        return angular.isUndefined(val) || val == '' || val == null
    };
    // Is english (true/false)
    $scope.com.fn.IsEnglish = function (languageCode) {
        if ($scope.com.fn.IsUndefineOrEmptyOrNull(languageCode)) {
            return true;
        } else {
            if (languageCode.indexOf("en") == 0) {
                return true;
            } else {
                return false;
            }
        }
    };
    // Get string
    $scope.com.fn.GetString = function (val) {
        var result = val;
        if (angular.isUndefined(val) || val == null) {
            result = '';
        }
        return result;
    };
    // FixIE
    $scope.com.fn.FixIE = function () {
        //check if IE so the other browsers don't get this ugly hack.
        var selectLists = document.querySelectorAll(".selectListForIE");
        for (var x = 0; x < selectLists.length; x++) {
            selectLists[x].parentNode.insertBefore(selectLists[x], selectLists[x]);
        }
    };
    // Get column title
    $scope.com.fn.GetColumnTitle = function (obj) {
        var columnTitle = [];
        columnTitle.push('Company');
        columnTitle.push('Branch');
        columnTitle.push('Status');
        // Insurer
        if (obj.insurerFlag) {
            if (!$scope.com.fn.IsEnglish(obj.language)) {
                if (obj.businessType != obj.retailCode) {                    
                    columnTitle.push('Abbr / Full Name / Local Name');
                } else {
                    columnTitle.push('Full Name/ Local Name');
                }
            } else {
                if (obj.businessType != obj.retailCode) {
                    columnTitle.push('Abbr / Full Name');
                } else {
                    columnTitle.push('Full Name');
                }
            }
        } else {
            /*
            2015.12 Taiwan DocGen Code(Will be deleted).
            if (obj.companyId == 10) {
                if (obj.businessType != obj.retailCode) {
                    columnTitle.push('Insurer Abbr / Full Name');
                } else {
                    columnTitle.push('Abbr / Full Name');
                }
                columnTitle.push('business');
                columnTitle.push('addressee');
                columnTitle.push('ae');
                columnTitle.push('am');
                columnTitle.push('streetAddress');
            } else {*/

            if (obj.isDisplayLocalName) {
                if (obj.businessType != obj.retailCode) {
                    columnTitle.push('Abbr / Full Name / Local Name');
                } else {
                    columnTitle.push('Full Name/ Local Name');
                }
            } else {
                if (obj.businessType != obj.retailCode) {
                    //columnTitle.push('Abbr / Full Name');
                    columnTitle.push('Abbr / Full Name / Local Name');
                } else {
                    columnTitle.push('Full Name');
                }
            }

            //}
        }
        return columnTitle;
    };
    // fixed length string
    $scope.com.fn.FixedLengthString = function (str, fixed) {
        if (str == null) str = '0';
        var tempLength = fixed - str.length;
        var temp = '';
        for (var i = 0; i < tempLength; i++) temp += '0';
        return temp + str;
    };
    // get scroll off set
    $scope.com.fn.GetScrollOffsets = function (w) {
        w = w || window;
        if (w.pageXOffset != null) return {
            x: w.pageXOffset,
            y: w.pageYOffset
        };
        var d = w.document;
        if (document.compatMode == "CSS1Compat") {
            return {
                x: d.documentElement.scrollLeft,
                y: d.documentElement.scrollTop
            };
        }
        return {
            x: d.body.scrollLeft,
            y: d.body.scrollTop
        };
    };

    // keep alive function
    $scope.com.fn.keepAlive = function () {
        angular.element(document.querySelector('#frmKeepAlive')).attr(
            'src', rootPath + '/PlacementNew/PlacementNewBase/keepAlive');
        // cancel timeout promise
        $timeout.cancel($scope.com.var.keepPromise);
        // call the function
        $scope.com.var.keepPromise = $timeout(function () {
            $scope.com.fn.keepAlive();
        }, intervalKeepAlive);
    };
    // focus
    $scope.com.fn.Focus = function (dom) {
        angular.element(document.querySelector(dom)).focus();
    };
    $scope.com.fn.Init = function () {
        $scope.com.var = {
            config: {
                loadingBarImgUrl: rootPath + '/Areas/PlacementNew/Content/Images/loading_small.gif',
                dateFormat: angular.element(document.querySelector('#hdnConfigDateFormat')).val()                
            }
        };
        $scope.com.var.config.datePickerFormat = $scope.com.var.config.dateFormat.toLowerCase().replace('yyyy', 'yy');        
    };
    angular.element(document).ready(function () {
        $scope.com.fn.Init();
        // keep alive
        $scope.com.fn.keepAlive();        
    });
}])
.filter('offset', function () {
    return function (input, start) {
        start = parseInt(start, 10);
        return input.slice(start);
    };
})
.filter('formatDate', function () {
    var result = function (date, formatstring) {
        if (typeof formatstring == 'undefined' || formatstring === null) {
            formatstring = angular.element(document.querySelector('#hdnConfigDateFormat')).val().toUpperCase();
        }
        return moment(date).format(formatstring);
    }
    return result;
})
.filter('formatDateTime', function () {
    var result = function (date, formatstring) {
        if (typeof formatstring == 'undefined' || formatstring === null) {
            formatstring = angular.element(document.querySelector('#hdnConfigDateFormat')).val().toUpperCase() + ' HH:mm:ss';
        }
        return moment(date).format(formatstring);
    }
    return result;
})
.filter('toHtml', ['$sce', function ($sce) {
    return function (str) {
        return $sce.trustAsHtml(str);
    };
}])
.filter('nl2br', ['$sanitize', function ($sanitize) {
    var tag = (/xhtml/i).test(document.doctype) ? '<br />' : '<br>';
    return function (msg) {
        msg = (msg + '').replace(/(\r\n|\n\r|\r|\n|&#10;&#13;|&#13;&#10;|&#10;|&#13;)/g, tag + '$1');
        if (msg == 'null') return '';
        return $sanitize(msg);
    };
}]);
/*
window.onload = function () {
    $(document.getElementsByTagName('input')).each(function () {
        $(this).click(function () {
            $(this).focus();
        });
    });
};
*/