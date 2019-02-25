$(function() {

	var rightCardsNotInPlace = 0;
	var leftCardsNotInPlace = 0;
	var classes = ["l1", "l2", "l3", "l4"];
	var cards = $('.card').toArray();
	var activeIndx = Math.floor($(cards).length / 2);

	$('.left-arrow').on('click', function() {
		if (activeIndx < $(cards).length - 1) {
			active = $(cards[activeIndx]);
			if (activeIndx < Math.floor($(cards).length / 2)) {
				var leftCards = $('.left').toArray();
				leftCards.reverse();
				for (var i = 0; i < leftCards.length; i++) {
					$(leftCards[i]).removeClass("l" + (i + 1)).addClass("l" + (i + 2));
				}
			}
			active.addClass('slideLeft').addClass('left').addClass('l1');
			active.removeClass('slideLeft');
			next = $(cards[activeIndx + 1]);
			next.removeClass('right').removeClass('l1');
			if (activeIndx >= Math.floor($(cards).length / 2)) {
				var rightCards = $('.right').toArray();
				for (var i = 0; i < rightCards.length; i++) {
					$(rightCards[i]).removeClass("l" + (i + 2)).addClass("l" + (i + 1));
				}
			}
			active.removeClass('active');
			next.addClass('active');
			activeIndx++;
		}
	});

	$('.right-arrow').on('click', function() {
		if (activeIndx > 0) {
			active = $(cards[activeIndx]);
			if (activeIndx > Math.floor($(cards).length / 2)) {
				var rightCards = $('.right').toArray();
				for (var i = 0; i < rightCards.length; i++) {
					$(rightCards[i]).removeClass("l" + (i + 1)).addClass("l" + (i + 2));
				}
			}
			active.addClass('slideRight').addClass('right').addClass('l1');
			active.removeClass('slideRight');
			next = $(cards[activeIndx - 1]);
			next.removeClass('left').removeClass('l1');
			if (activeIndx <= Math.floor($(cards).length / 2)) {
				var leftCards = $('.left').toArray();
				leftCards.reverse();
				for (var i = 0; i < leftCards.length; i++) {
					$(leftCards[i]).removeClass("l" + (i + 2)).addClass("l" + (i + 1));
				}
			}
			active.removeClass('active');
			next.addClass('active');
			activeIndx--;
		}
	});


	// handling chat contacts

	var chatContacts = $('.contact').toArray();
	var chatActiveIndx = Math.floor($(chatContacts).length / 2);

	$('.chat-top-arrow').on('click', function() {
		if (chatActiveIndx < $(chatContacts).length - 1) {
			active = $(chatContacts[chatActiveIndx]);
			if (chatActiveIndx < Math.floor($(chatContacts).length / 2)) {
				var topCards = $('.top').toArray();
				topCards.reverse();
				for (var i = 0; i < topCards.length; i++) {
					$(topCards[i]).removeClass("l" + (i + 1)).addClass("l" + (i + 2));
				}

				var sss = $('.contact.bottom.l1.base' + (3 - chatActiveIndx)).removeClass('faded');
			}
			if (chatActiveIndx >= Math.floor($(chatContacts).length / 2)) {
				$('.contact.top.l1').addClass('faded');
			}
			active.addClass('slideTop').addClass('top').addClass('l1').addClass('base' + (chatActiveIndx - 1));
			active.removeClass('slideTop');

			next = $(chatContacts[chatActiveIndx + 1]);
			next.removeClass('bottom').removeClass('l1');
			if (chatActiveIndx >= Math.floor($(chatContacts).length / 2)) {
				var bottomCards = $('.bottom').toArray();
				for (var i = 0; i < bottomCards.length; i++) {
					$(bottomCards[i]).removeClass("l" + (i + 2)).addClass("l" + (i + 1));
				}
			}
			active.removeClass('active');
			next.addClass('active');
			chatActiveIndx++;
		}
	});

	$('.chat-bottom-arrow').on('click', function() {
		if (chatActiveIndx > 0) {
			active = $(chatContacts[chatActiveIndx]);
			if (chatActiveIndx > Math.floor($(chatContacts).length / 2)) {
				var bottomCards = $('.bottom').toArray();
				for (var i = 0; i < bottomCards.length; i++) {
					$(bottomCards[i]).removeClass("l" + (i + 1)).addClass("l" + (i + 2));
				}
				var sss = $('.contact.top.l1.base' + (chatActiveIndx - 3)).removeClass('faded');
			}

			if (chatActiveIndx <= Math.floor($(chatContacts).length / 2)) {
				$('.contact.bottom.l1').addClass('faded');
			}
			active.addClass('slideBottom').addClass('bottom').addClass('l1').addClass('base' + (5 - chatActiveIndx));
			active.removeClass('slideBottom');
			next = $(chatContacts[chatActiveIndx - 1]);
			next.removeClass('top').removeClass('l1');
			if (chatActiveIndx <= Math.floor($(chatContacts).length / 2)) {
				var topCards = $('.top').toArray();
				topCards.reverse();
				for (var i = 0; i < topCards.length; i++) {
					$(topCards[i]).removeClass("l" + (i + 2)).addClass("l" + (i + 1));
				}
			}
			active.removeClass('active');
			next.addClass('active');
			chatActiveIndx--;
		}
	});
});