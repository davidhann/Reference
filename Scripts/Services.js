'use strict'

Foo.factory('HttpService', ['$resource', '$window', '$http', function ($resource, $window, $http) {
    return {                
        getDataList: function (token) {
            var result = $resource($window.rootPath + '', {}, {
                post: {
                    method: 'POST',
                    headers: { 'RequestVerificationToken': token },
                    isArray: true
                }
            });
            return result;
        },
        download: function (url) {
            $http.get(url, { responseType: 'arraybuffer' }).success(function (data, status, headers) {
                headers = headers();
                var filename = headers['x-filename'] || 'download.pdf';
                var contentType = headers['content-type'] || 'application/octet-stream';
                var success = false;
                // step 1.
                try {
                    var blob = new Blob([data], { type: contentType });
                    if (navigator.msSaveBlob) {
                        navigator.msSaveOrOpenBlob(blob, filename);
                    } else {
                        var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
                        if (saveBlob === undefined) throw "Not supported";
                        saveBlob(blob, filename);
                    }
                    success = true;
                } catch (e) {
                }
                // step 2.
                if (!success) {
                    var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
                    if (urlCreator) {
                        var link = document.createElement('a');
                        if ('download' in link) {
                            try {
                                var blob = new Blob([data], { type: contentType });
                                var tempUrl = urlCreator.createObjectURL(blob);
                                link.setAttribute('href', tempUrl);
                                link.setAttribute("download", filename);
                                var event = document.createEvent('MouseEvents');
                                event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                                link.dispatchEvent(event);
                                success = true;
                            } catch (e) {
                            }
                        }
                    }
                }
                // step. 3
                if (!success) {
                    try {
                        window.open(url, '_blank', '');
                        success = true;
                    } catch (e) {
                    }
                }
            }).error(function (data, status) {
                window.open(url, '_blank', '');
            });
        }
    }
}])
.service("modals", function ($rootScope, $q) {
    // I represent the currently active modal window instance.
    var modal = {
        deferred: null,
        params: null
    };
    // Return the public API.
    return ({
        open: open,
        params: params,
        proceedTo: proceedTo,
        reject: reject,
        resolve: resolve
    });
    function open(type, params, pipeResponse) {
        var previousDeferred = modal.deferred;
        // Setup the new modal instance properties.
        modal.deferred = $q.defer();
        modal.params = params;
        // We're going to pipe the new window response into the previous 
        // window's deferred value.
        if (previousDeferred && pipeResponse) {
            modal.deferred.promise
				.then(previousDeferred.resolve, previousDeferred.reject);
            // We're not going to pipe, so immediately reject the current window.
        } else if (previousDeferred) {
            previousDeferred.reject();
        }
        // NOTE: We could have accomplished this with a $watch() binding in
        // the directive; but, that would have been a poor choice since it
        // would require a chronic watching of acute application events.
        $rootScope.$emit("modals.open", type);
        return (modal.deferred.promise);
    }
    // I return the params associated with the current params.
    function params() {
        return (modal.params || {});
    }
    // This is just a convenience method for .open() that enables the 
    // pipeResponse flag; it helps to make the workflow more intuitive. 
    function proceedTo(type, params) {
        return (open(type, params, true));
    }
    // I reject the current modal with the given reason.
    function reject(reason) {
        if (!modal.deferred) {
            return;
        }
        modal.deferred.reject(reason);
        modal.deferred = modal.params = null;
        // Tell the modal directive to close the active modal window.
        $rootScope.$emit("modals.close");
    }
    // I resolve the current modal with the given response.
    function resolve(response) {
        if (!modal.deferred) {
            return;
        }
        modal.deferred.resolve(response);
        modal.deferred = modal.params = null;
        // Tell the modal directive to close the active modal window.
        $rootScope.$emit("modals.close");
    }
});