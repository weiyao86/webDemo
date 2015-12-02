/*
 name: jquery ajax
 desc: server side data access  
*/
define('ajax', ['consts', 'settings'], function (c, settings) {
    var Types = c.Types;
    return {

        //common
        
        getCommonSearch: function (options) {
            this.invoke(options);
        }, 

        //permission search
        getPermissionResult: function (options) {
            options.url = settings.searchUrl.permission;
            this.invoke(options);
        },

        //ajax main method
        invoke: function (options) {
            var self = this;

            self.before(options);

            var ajaxXHR = $.ajax({
                url: options.url,
                contentType: options.contentType || 'application/x-www-form-urlencoded; charset=UTF-8',
                type: options.type || 'POST',
                cache: (typeof options.cache === Types.Undefined ? false : true),
                data: options.params || {},
                timeout: options.timeout || 28000,
                dataType: options.dataType || 'json',
                traditional: options.traditional || true,
                success: function (result) {
                    self.success(options, result);
                },
                error: function (error) {
                    self.error(options, error);
                }
            });

            return ajaxXHR;
        },

        //ajax invoke before
        before: function (options) {
            if (typeof options.loadingShow === Types.Function) {
                options.loadingShow();
            }
        },

        //ajax success callback
        success: function (options, result) {
            if (typeof options.loadingHide === Types.Function) {
                options.loadingHide();
            }
            if (result.IsSuccess) {
                options.onsuccess(result);
            } else if (typeof options.onfailed === Types.Function) {
                options.onfailed({ reason: (result.Error || "服务端发生异常：‘未明确指出错信息。’") });
            }
        },

        //ajax error callback
        error: function (options, error) {
            if (typeof options.loadingHide === Types.Function) {
                options.loadingHide();
            }
            if (typeof options.onfailed === Types.Function) {
                options.onfailed({ reason: error });
            }
        }
    };

});