  ;

  (function($) {


    "use strict"

    function setup($) {
      var noOp = $.noop || function() {},
        ajaxXhr;

      $.extend({
        customAutoComplete: function(config) {
          var $target;
          typeof config.target === "string" && ($target = $(config.target));
          if (!$target.size()) return log("目标元素为空!");
          $target.customAutoComplete(config, $target);
        }

      });

      $.fn.customAutoComplete = function(config) {
        var self = this,
          $this, isBool;
        self.config = $.extend({}, self.config, config);


        if (self.config && !self.config["autocompleteContainer"]) {
          return log("config.autocompleteContainer 为空!");
        }

        //设置全局属性并取出唯一容器ID,只执行一次
        if (!$.fn.customAutoComplete.config.isExtend) {
          $.fn.customAutoComplete.config = $.extend({}, self.config, $.fn.customAutoComplete.config);
        }

        self.$autocompleteContainer = $(self.config.autocompleteContainer);
        self.$container = self.$autocompleteContainer.find($.fn.customAutoComplete.config.containerSelector);

        if (!self.$container.size()) {
          return log("config.container 为空!");
        }
        if ($.isFunction(self.each)) {
          return self.each(function(idx, val) {
            $this = $(val);
            if (!$this.data("install")) {
              $this.data("install", new $.fn.customAutoComplete(config));
              $this.data("install").startup($this);
            }
          });
        }
      };

      $.fn.customAutoComplete.config = {
        containerSelector: "[data-field='render_scope']",
        acplContainerSelector: "[data-field='autocomplete_panel']",
        blockId: "complete_block_layer"
      };

      $.fn.extend($.fn.customAutoComplete.prototype, {
        config: {
          isExtend: true,
          url: "",
          load: "remote" || "local",
          tempHtml: "",
          target: "",
          checkCls: "check",
          autocompleteContainer: "",
          callbacks: {
            onKeyup: noOp,
            onBeforeLoad: noOp,
            onAfterLoad: noOp,
            onbeforeRender: noOp,
            onBeforeSend: noOp,
            onComplete: noOp,
            loadLocalData: noOp
          }
        },

        startup: function($target) {
          var self = this;
          bindEvent($target, self);
        }
      });

      function bindEvent($target) {
        var params = {},
          _data = $target.data("install"),
          $autocompleteContainer = _data.$autocompleteContainer,
          $container = _data.$container,
          ckCls = _data.config.checkCls,
          clearTime = null;

        $target.on("keyup focus", function(e) {
          var evt = e,
            $that = $(this),
            txtVal = $.trim($that.val());
          if (!txtVal) return;
          ajaxXhr && ajaxXhr.abort();
          setPosition($that, _data);

          $container.find("li[data-code='" + txtVal + "']").addClass(ckCls).siblings().removeClass(ckCls);
          window.clearTimeout(clearTime);
          clearTime = setTimeout(function() {
            keyUp(evt, $that);
          }, 10);
        });

        if (!$container.data("registerClick")) {
          $container.on('click', "li", function(e) {
            $(this).addClass(ckCls).siblings().removeClass(ckCls);
            if ($autocompleteContainer.data("source")) $autocompleteContainer.data("source").val($(this).attr("data-code"));
            $autocompleteContainer.hide();
          });
          $container.data("registerClick", true);
        }

        $(document).click(function(e) {
          var $autoCompleteWrap = $(e.target).closest($.fn.customAutoComplete.config.acplContainerSelector),
            $autoComplete = $($.fn.customAutoComplete.config.autocompleteContainer),
            $source = $autoComplete.data("source");
          if (!$autoCompleteWrap.size() && $autoComplete.size() && $autoComplete.is(":visible") && $source) {
            $source[0] != $(e.target)[0] && $autoComplete.hide();
          }
        })

        function keyUp(e, $that) {
          var evtType = e.type,
            txtVal = $.trim($that.val()),
            upAndDownFunc = null,
            ckCls = _data.config.checkCls,
            searchTxt = $that.val(),
            params = {},
            $li;

          if (e.keyCode == 38 || e.keyCode == 40) {
            var keyCode = e.keyCode;
            upAndDownFunc = function() {
              if (keyCode == 38) {
                $li = $container.find("li." + ckCls).prev();
                if (!$li.size()) $li = $container.find("li:last");
              } else {
                $li = $container.find("li." + ckCls).next();
                if (!$li.size()) $li = $container.find("li:first");
              }
              if (!$li.size()) return;

              $li.addClass(ckCls).siblings().removeClass(ckCls);
              $li.get(0).scrollIntoView();
              var code = $li.attr("data-code");
              $that.val(code);
            };
          }
          if (upAndDownFunc) {
            if ($("#" + $.fn.customAutoComplete.config.blockId).size()) return;
            return upAndDownFunc && upAndDownFunc.call($container);
          }

          if (txtVal == $that.data("text")) return;
          $that.data("text", txtVal);

          if ($.isFunction(_data.config.callbacks.onKeyup)) {
            if (_data.config.callbacks.onKeyup.apply(this, [e, txtVal, $container]) == false) return;
          }
          if ($.isFunction(_data.config.callbacks.onBeforeLoad)) {
            params = _data.config.callbacks.onBeforeLoad.apply(this, [e, searchTxt]);
          }

          loadData({
            $target: $that,
            _data: _data,
            params: params,
            upAndDownFunc: upAndDownFunc
          });

        }
      }

      function loadData(param) {
        if (Mustache && Mustache.render) {
          if (param._data.config.load === "remote") {
            remote(param);
          } else if (param._data.config.load === "local") {
            local(param);
          }
        } else {
          log("未添加对Mustache插件的支持!");
        }
      }

      function render(param, ret) {
        var _data = param._data,
          tempHtml = _data.config.tempHtml,
          $container = _data.$container,
          $target = param.$target,
          txtSearch = $target.val().toLowerCase(),
          data = {
            record: ret
          },
          $li;

        if (tempHtml) {
          if ($.isFunction(_data.config.callbacks.onbeforeRender)) {
            _data.config.callbacks.onbeforeRender.apply(this, [data, ret]);
          }

          var outHtml = Mustache.render(tempHtml, data);
          $container.html(outHtml);
          $container.find("li").each(function(idx, val) {
            $li = $(this);
            var reg = new RegExp(txtSearch, "ig"),
              outhtml = $li.html().replace(reg, "<span style='color:red;'>" + txtSearch + "</span>");
            $li.html(outhtml);
          });
        }
        if ($.isFunction(_data.config.callbacks.onAfterLoad)) {
          _data.config.callbacks.onAfterLoad.apply(this, [$container]);
        }
      }

      function remote(param) {
        ajaxXhr = $.ajax({
          type: "GET",
          cache: "true",
          url: param._data.config.url,
          //contentType: "application/json",
          dataType: "json",
          traditional: false,
          data: param.params,
          timeout: 30 * 1000,
          beforeSend: function(xhr) {
            showLayer(param);
            if (typeof param._data.config.callbacks.onBeforeSend === "function") {
              param._data.config.callbacks.onBeforeSend.apply(null, [param._data, xhr]);
            }
          },
          complete: function(xhr, textstatus) {
            hideLayer(param);
            if (typeof param._data.config.callbacks.onComplete === "function") {
              param._data.config.callbacks.onComplete.apply(null, [param._data, xhr, textstatus]);
            }
          },
          success: function(ret) {
            render(param, ret);
          },
          error: function(xhr) {
            var msg = xhr.statusText == "abort" ? "请求中断!" : "请求失败";
            log(param._data.config.url + msg);
          }
        });
      }

      function local(param) {
        showLayer(param);
        if ($.isFunction(param._data.config.callbacks.loadLocalData)) {
          var ret = param._data.config.callbacks.loadLocalData.apply(this, [param]) || [];
          render(param, ret);
        }
        hideLayer(param);
      }

      function setPosition($that, _data) {
        var $container = _data.$container,
          $autocompleteContainer = _data.$autocompleteContainer,
          targetData;
        if (!$that.data("size")) {
          var position = $that.position(),
            $parentOffset = $that.offsetParent(),
            top = position.top + $that.outerHeight() + $parentOffset.scrollTop(),
            left = position.left,
            nowWidth = $that.width(),
            maxW = $parentOffset.width(),
            containerW = $autocompleteContainer.outerWidth(true);

          $that.data("size", {
            width: nowWidth,
            left: left,
            top: top
          });
        }
        targetData = $that.data("size");
        $autocompleteContainer.data("source", $that);

        // if (maxW - left < containerW)
        //     left = maxW - containerW;
        // if (containerW > maxW) {
        //     $container.width(maxW - 50);
        //     left=0;
        // }

        $autocompleteContainer.css({
          "width": targetData.width,
          "left": targetData.left,
          "top": targetData.top
        }).show();
      }

      function showLayer(param) {
        var $block = getBlockObj(param);

        var msg = '<div class="autocomplete-block-msg">';
        msg += '<div class="block-panel">';
        msg += '<div data-id="msg" class="block-panel-content">';
        msg += '<span style="display:block;line-height:28px;font-family:微软雅黑,font-size:10pt;height:28px;">loading...</span>';
        msg += '</div></div></div>';
        msg += '<div data-layer="out" class="autocomplete-block-msg"></div>';

        $block.append(msg);
        $block.find("[data-layer='out']").css({
          "background": "#000",
          "opacity": .3,
          "z-index": 1
        });
      }

      function hideLayer(param) {
        var $block = getBlockObj(param);
        $block.remove();
      }

      function getBlockObj(param) {
        var $block = $("#" + $.fn.customAutoComplete.config.blockId);
        if (!$block.size()) $block = param._data.$autocompleteContainer.clone().appendTo("body").attr("id", $.fn.customAutoComplete.config.blockId).empty();
        return $block;
      }

      //检查相关配置
      function log(msg) {
        if (console) {
          console.error(msg);
        }
      }
    }

    // Load css file
    (function() {
      var link = document.createElement("link"),
        url = require.s.contexts._.config.baseUrl + basePath + 'css/hotpoint.css';

      link.type = "text/css";
      link.rel = "stylesheet";
      link.href = url;
      document.getElementsByTagName("head")[0].appendChild(link);
    })();

    /*global define:true */
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
      var basePath = (function() {
        var splittedPath,
          config = require.s.contexts._.config,
          path = config.paths["autocomplete"];

        if (typeof path !== "undefined") {
          splittedPath = path.split(/\/+/g);
          return splittedPath.slice(0, splittedPath.length - 2).join("/") + "/";
        } else {
          alert("require config paths 'autocomplete' key not exist");
        }
      })();

      define(['text!' + basePath + 'template/assistive-template.htm',
        'mustache',
        'scrollIntoView'
      ], setup);

    } else {
      setup(jQuery);
    }
  })();