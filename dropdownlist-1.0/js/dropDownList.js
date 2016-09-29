/*
 * jQuery dropdownlist
 * Copyright (c) 2012 ¡ı’‹«ø(Mike Liu)
 *
 * http://my.oschina.net/MikeLiuzheqiang
 *
 * Depends:
 *   - jQuery
 *
 * Dual licensed under the GPL licenses:
 *   http://www.gnu.org/licenses/gpl.html
 *
*/
(function($,window){
    var document = window.document;
    var listIndex = 0;
    $.DropDownList = function(ele, opts){
        var $self = this;
        var opts = (this.opts = $.extend({},$.DropDownList.def,opts));
        var options = (this.options = ele.find('option')) ;
        (this.ele = ele).hide() ;
        var button = (this.button = $(['<div class="dropDownList" id="'
                       ,ele.attr('id') ? ele.attr('id') + 'List' : "dropDownList" + (listIndex++)
                       ,'">',
                       ,'<span class="dropDownList_text">'
                       ,opts.noneSelectedText
                       ,'</span>'
                       ,'<span class="dropDownList_icon"></span>',
                       ,'</div>'
                     ].join(''))).insertAfter(ele);

        button.css({
            'margin-left' : ele.css('margin-left'),
            'margin-right' : ele.css('margin-right'),
            'margin-top' : ele.css('margin-top'),
            'margin-bottom' : ele.css('margin-bottom')
        });
        var menu =  (this.menu = $('<div />',{'class' : 'dropDownList_div'}));
        if(opts.header){
            var header = [];
            this.header = $('<div/>',{'class' : 'dropDownList_header'});
            if(opts.multiple){
                header = ['<span class="dropDownList_select_all">',
                                 ,opts.checkAllText,
                                 ,'</span><span  class="dropDownList_reset_all">'
                                 ,opts.uncheckAllText
                                 ,'</span>']; 
            }else{
                header = ['<span class="dropDownList_reset_all">'
                                 ,opts.uncheckAllText
                                 ,'</span>']; 
            }
            this.header.html(header.join(''));
            menu.append(this.header);
        }
        var ul = (this.ul = $('<ul/>'));
        menu.append(ul.css({
            'max-height' : opts.maxHeight
        }));
        $self._setButtonWidth();
        $self._setButtonHeight();
        $self._updateHeader();
        $self.refresh();
        $self._setPosition();
        $self._bindEvents();
        $(document.body).append(this.menu);
    }

    $.DropDownList.prototype = {
        _isOpen : function(){
            if(this.menu.is(':visible')){
                return true;
            }
            return false;
        },
        _setButtonWidth : function(){
            var width = this.ele.outerWidth();
            this.button.width( width - 2 );
        },
        _setButtonHeight : function(){
            var height = this.ele.outerHeight() - 2 ;
            this.button.height( height );
            this.button.children('.dropDownList_icon').height(height );
            this.button.children('.dropDownList_text').css({
                'line-height' : height + "px",
                'width' : this.button.width() - 33
            });
        },
        _setMenuWidth : function(){
            this.menu.width( this.button.width());
        },
        _bindEvents : function(){
            var $self = this,
                    o = this.opts,
                    options = this.options;
            $self.button.bind({
                'click.mike' : function(){
                    $self[$self._isOpen() ? 'close' : 'open']();
                    $self._setPosition();
                },
                'mouseover.mike' : function(){
                    $self.button.children('.dropDownList_icon').addClass('dropDownList_icon_hover');
                },
                'mouseleave.mike' : function(){
                    $self.button.children('.dropDownList_icon').removeClass('dropDownList_icon_hover');
                }
            });
            $('li', $self.ul).bind({
                'click.mike' : function(){
                    var val = $(this).attr('val');
                    var option = options.filter('[value=' + val + ']')[0];
                    var $this = $(this);
                    if(o.multiple){
                        var checkbox = $(this).find('.dropDownList_checkbox');
                        if(checkbox.hasClass('dropDownList_checkbox_active')){
                            checkbox.removeClass('dropDownList_checkbox_active');
                            $this.removeClass('dropDownList_li_selected');
                            option.selected = false;
                        }else{
                            checkbox.addClass('dropDownList_checkbox_active');
                            $this.addClass('dropDownList_li_selected');
                            option.selected = true;
                        }
                        $self._checkCheckAll();
                        $self._checkunCheckAll();
                    }else{
                        options.each(function(){
                            this.selected = false;
                        });
                        option.selected = true;
                        $self.close();
                    }
                    $self._updateHeader();
                    if(o.click && $.isFunction(o.click)){
                        o.click(option);
                    }
                }
            });
            if(o.header){
                $('.dropDownList_reset_all', $self.menu).click(function(){
                    $self.uncheckAll();
                });
                if(o.multiple){
                    $('.dropDownList_select_all', $self.menu).click(function(){
                        $self.checkAll();
                    });
                }
            }
            $(document).bind('mousedown.mike',function(e){ 
                if($self._isOpen() && !$.contains($self.menu[0], e.target) 
                            && !$.contains($self.button[0], e.target)
                            && $self.button[0] != e.target){
                    $self.close();
                }
            });
        },
        _updateHeader : function(){
            var o = this.opts,
                $checked = this.ele.find('option:selected'),
                totalCount =  this.options.size(),
                numChecked = this.ele.val(),
                value;
             if(!numChecked){
                 value = o.noneSelectedText;
                 $('.dropDownList_text', this.button).removeClass('dropDownList_text_select');
             }else if(/\d/.test(o.selectedList) && o.selectedList > 0 && numChecked.length <= o.selectedList){
                value = $checked.map(function(){ return $.trim($(this).text()); }).get().join(', ');
                $('.dropDownList_text', this.button).addClass('dropDownList_text_select');
             }else{
                $('.dropDownList_text', this.button).addClass('dropDownList_text_select');
                value = o.selectedText.replace('#', numChecked.length).replace('#', totalCount);
             }
             $('.dropDownList_text', this.button).text(value);
        },
        _setPosition : function(){
            var windowH = $(window).height();
            var height = this.button.offset().top - $(window).scrollTop();
            var menuHeight = this.menu.outerHeight();
            var top = this.button.offset().top + this.ele.outerHeight() + 1;
            if(menuHeight > windowH - height){
                top = this.button.offset().top - menuHeight - 1;
            }
            this.menu.css({
                'top' : top,
                'left' : this.button.offset().left
            });
        },
        _checkCheckAll : function(){
            var checkall = true;
            this.options.each(function(){
                return (checkall = this.selected);
            });
            if(checkall && this.opts.checkall){
                this.opts.checkall(this);
            }
        },
        _checkunCheckAll : function(){
            var uncheckall = true;
            this.options.each(function(){
                return (uncheckall = !this.selected);
            });
            if(uncheckall && this.opts.uncheckall){
                this.opts.uncheckall(this);
            }
        },
        refresh : function(){
            var o = this.opts,
                ul = this.ul,
                html = [],
                $self = this;
            $self.options.each(function(){
                var isSelected = this.selected;
                html.push('<li val="' + this.value + '"');
                if(o.multiple){
                    if(isSelected){
                        html.push('class="dropDownList_li_selected"><span class="dropDownList_checkbox dropDownList_checkbox_active"></span>');
                    }else{
                        html.push('><span class="dropDownList_checkbox"></span>');
                    }
                }
                html.push('<span>' + this.innerHTML + '</span></li>');
            });
            ul.html(html.join(''));
            $self._setButtonWidth();
            $self._setMenuWidth();
        },
        enable : function(){
            var $self = this;
            this.button.bind({
                'click.mike' : function(){
                    $self[$self._isOpen() ? 'close' : 'open']();
                    $self._setPosition();
                },
                'mouseover.mike' : function(){
                    $self.button.children('.dropDownList_icon').addClass('dropDownList_icon_hover');
                },
                'mouseleave.mike' : function(){
                    $self.button.children('.dropDownList_icon').removeClass('dropDownList_icon_hover');
                }
            }).css({
                'color' : '#555',
                'background-color' : '#FFF'
            });
        },
        disable : function(){
            this.button.unbind().css({
                'color' : '#808080',
                'background-color' : '#F5F5F5'
            });
        },
        close : function(){
            this.menu.hide();
        },
        open : function(){
            this.menu.show();
        },
        checkAll : function(){
            this.options.each(function(){
                this.selected = true;
            });
            $('.dropDownList_checkbox', this.menu).addClass('dropDownList_checkbox_active');
            $('li', this.ul).addClass('dropDownList_li_selected');
            this._updateHeader();
            this._checkCheckAll();
        },
        uncheckAll : function(){
            this.options.each(function(){
                this.selected = false;
            });
            $('.dropDownList_checkbox', this.menu).removeClass('dropDownList_checkbox_active');
            $('li', this.ul).removeClass('dropDownList_li_selected');
            this._updateHeader();
            this._checkunCheckAll();
        }
    }
    
    $.DropDownList.def = {
        maxHeight : 200,
        checkAllText: 'All',
        uncheckAllText: 'Reset',
        noneSelectedText: 'Select',
        selectedText: '# selected',
        selectedList: 2,
        multiple: true,
        header : true,
        click : undefined,
        checkall : undefined,
        uncheckall : undefined
    }
    $.DropDownLists = function(selects , opts){
        this.lists =[];
        var $self = this;
        selects.each(function(){
            $self.lists.push(new $.DropDownList($(this), opts));
        });
    }
    $.DropDownLists.prototype = {
        disable : function(){
            for(var i = 0 ; i < this.lists.length ; i++){
                this.lists[i].disable();
            }
        },
        open : function(){
            for(var i =0 ; i < this.lists.length ; i++){
                this.lists[i].open();
            }
        },
        close : function(){
            for(var i =0 ; i < this.lists.length ; i++){
                this.lists[i].close();
            }
        },
        enable : function(){
            for(var i =0 ; i < this.lists.length ; i++){
                this.lists[i].enable();
            }
        },
        checkAll : function(){
            for(var i =0 ; i < this.lists.length ; i++){
                this.lists[i].checkAll();
            }
        },
        uncheckAll : function(){
            for(var i =0 ; i < this.lists.length ; i++){
                this.lists[i].uncheckAll();
            }
        }
    }
    $.fn.DropDownList = function(opts){
        return new $.DropDownLists(this, opts);
    }
    
})(jQuery,window)