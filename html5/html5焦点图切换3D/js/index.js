$(function() {

  var Page = (function() {



    var $navArrows = $('#nav-arrows').hide(),
      $shadow = $('#shadow').hide(),
      slicebox = $('#sb-slider').slicebox({
        onReady: function() {

          $navArrows.show();
          $shadow.show();

        },
        orientation: 'r',
        cuboidsRandom: true,
        disperseFactor: 30
      }),

      init = function() {

         initEvents();

        // $('#sb-slider').imagesLoaded(function(){
        //     alert('全部加载完成!');
        // });
      // $('#sb-slider').imagesLoaded().always(function(){alert('tt')});
      //$('#sb-slider').imagesLoaded({"always":function(){alert("always");}});
       $('#sb-slider').imagesLoaded().progress(function(){
        debugger;
        alert('progress');
       });
      },
      initEvents = function() {

        // add navigation events
        $navArrows.children(':first').on('click', function() {

          slicebox.next();
          return false;

        });

        $navArrows.children(':last').on('click', function() {

          slicebox.previous();
          return false;

        });

      };

    return {
      init: init
    };

  })();

  Page.init();

});