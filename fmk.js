'use strict'

// Screen change

function toScreen(screen) {
	$('.screen').hide();
	$('.'+screen+'Screen').show();
}

// Game
// 
let charArrays = {
	Overwatch: ['Ana', 'Ashe', 'Brigitte', 'D.Va', 'Mei', 'Mercy', 'Moira', 'Pharah', 'Sombra', 'Symmetra', 'Tracer', 'Widowmaker', 'Zarya'],
	'Game of Thrones': ['Daenerys', 'Sansa', 'Missandei', 'Arya', 'Myranda', 'Melisandre', 'Cersei', 'Margaery', 'Ygritte'],
	Avatar: ['Asami', 'Azula', 'Katara', 'Korra', 'Mai', 'Ty Lee'],
	'Doki Doki Literature Club!': ['Monika', 'Natsuki', 'Sayori', 'Yuri'],
	Disney: ['Anna', 'Elsa', 'Moana', 'Merida', 'Rapunzel', 'Jasmine', 'Pocahontas', 'Mulan', 'Ariel'],
	'Harry Potter': ['Hermione Granger', 'Ginny Weasley', 'Luna Lovegood'],
	Marvel: ['Black Widow', 'Gamorra', 'Jessica Jones', 'Pepper Potts', 'Valkyrie'],
	'Star Wars': ['Leia Organa', 'Padme Amidala', 'Rey', 'Ahsoka Tano'],
	Skyrim: ['Aela the Huntress', 'Lydia', 'Serana'],
	Nintendo: ['Wii Fit Trainer', 'Princess Peach', 'Princess Zelda', 'Samus Aran'],
	'The Witcher': ['Triss Merigold', 'Yennefer', 'Ciri'],
	Custom: !(localStorage.getItem('custom')) ? [] : localStorage.getItem('custom').split(","),
};

for (const KV of Object.entries(charArrays)) {
	KV[1].sort();
	if (KV[0] == 'Custom') {
		$('#characters').append('<label><input type="checkbox"> '+ KV[0] +' <span class="charNumber"></span></label>');
	} else {		
		$('#characters').append('<label><input type="checkbox" checked="true"> '+ KV[0] +' <span class="charNumber"></span></label>');
	}
}

$('.charNumber').each(function ( i ) {
	$(this).append('(' + charArrays[$.trim($(this).parent().text())].length + ')');
});

let enabledMedia = [];
let enabledChars = [];
let actions = [];

function validateOptions() {
	// at least two actions, and n of active chars > n of actions

	enabledMedia = [], enabledChars = [], actions = [];
	
	$('#characters input').each( function() { // Get media
		if ($(this).is(':checked')) {
			let str = $(this).parent().text();
			enabledMedia.push(str.substring(1, str.lastIndexOf(" ")));
		};
	});
	
	for (let i = 0; i < enabledMedia.length; i++) { // Get characters
		enabledChars = enabledChars.concat(charArrays[enabledMedia[i]]);
	}	
	
	$('#actions input').each( function() { // Get actions
		if ($(this).is(':checked')) {
			actions.push($.trim($(this).parent().text()));
		};
	});
	
	if (actions.length < 2) {
		$('.warning').text('At least 2 actions required.');
	} else if (enabledChars.length <= actions.length) {
		$('.warning').text('The number of characters must be larger than the number of actions.');
	} else {
		toScreen('game');
		main();
	};
}

function validateChoices() {
	let allow = true;
	
	$('select').each( function() {
		if ($(this).val() == '') {
			allow = false;
		}
	});
	
	if (allow) {
		main();
	};
}

function main() {
	$('.charCont').children().remove();
	$('.actionsCont').children().remove();
	
	shuffle(enabledChars);
	
	for (let i=0; i<actions.length; i++) {
		$('.charCont').append('<div class="character"> <img src="img/'+enabledChars[i]+'.png"> <p class="charName">'+enabledChars[i]+'</p> <p class="charSource">'+findSourceMedia(enabledChars[i])+'</p> </div>');
		$('.actionsCont').append('<div class="action"><p>'+actions[i]+'</p><div class="dropdown"><select></select></div></div>');
	};
	$('select').append('<option value="" selected></option>');
	for (let i=0; i<actions.length; i++) {
		$('select').append('<option value="'+enabledChars[i]+'">'+enabledChars[i]+'</option>');
	};
	
	$('select').click(function() {
		let clicked = $(this);
		let ch = $(this).val();
		
		$(this).children().prop('disabled', false);
		
		$('select').each( function() {
			if ($(this).val() != '' && !($(this).is(clicked))) {
				console.log($(this).val());
				$('option[value="'+$(this).val()+'"]').filter( function() {
					return ($(this).parent().is(clicked)); 
				}).prop('disabled', true);
			}
			
		setTimeout(function() {$(this).hide().show(0);}, 2000 );
		});
	});
}


// Helper functions

function findSourceMedia(character) {
	for (let media of enabledMedia) {
		if (charArrays[media].includes(character)) {
			return media;
		};
	}
};

function shuffle(array) { // fisher-yates
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]]; // swap elements
  }
}

function saveCustom() {
	let txt = $('textarea').val();
	if (txt != "") {
		let previous = (!localStorage.getItem('custom'))  ? [] : localStorage.getItem('custom').split(",")
		console.log(previous);
		let newCustom = []
		for (let character of txt.split(", ")) {
			if (previous.indexOf(character) == -1) {
				previous.push(character);
				console.log(character)
			}
		}
		localStorage.setItem('custom', previous.concat(newCustom));
	}
}

function updateCustom() {
	charArrays["Custom"] = !(localStorage.getItem('custom')) ? [] : localStorage.getItem('custom').split(",");
	$('.charNumber').last().text('('+charArrays["Custom"].length+')');
}

// Listeners

function fn(e) {
	$('.tooltip').css('left', e.pageX + 5 +  'px');
	$('.tooltip').css('top', e.pageY + 'px');
}

document.addEventListener('mousemove', fn, false);

$('.options span').hover( 
	function() {
		let str = $(this).parent().text();		
		let arr = charArrays[str.substring(1, str.lastIndexOf(" "))];
		if (arr.length != 0) {
			$('.tooltip').show();		
			$('.tooltip').text(arr.join(', '));
		}
	}, function() { 
		$('.tooltip').hide(); 
	}
);

// Misc

function darkMode() {
	$('body').toggleClass('dark');
}
