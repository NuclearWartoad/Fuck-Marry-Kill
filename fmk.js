'use strict'

let NSFWEnabled = true;

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
	Marvel: ['Black Widow', 'Gamorra', 'Jessica Jones', 'Pepper Potts', 'Valkyrie', 'Captain Marvel'],
	'Star Wars': ['Leia Organa', 'Padme Amidala', 'Rey', 'Ahsoka Tano'],
	Skyrim: ['Aela the Huntress', 'Lydia', 'Serana'],
	Nintendo: ['Wii Fit Trainer', 'Princess Peach', 'Princess Zelda', 'Samus Aran'],
	'The Witcher': ['Triss Merigold', 'Yennefer', 'Ciri'],
	Custom: !(localStorage.getItem('custom')) ? [] : localStorage.getItem('custom').split(","),
};

// Character labels and checkboxes
for (const KV of Object.entries(charArrays)) {
	KV[1].sort();
	if (KV[0] == 'Custom') {
		$('#charList').append('<label><input type="checkbox"> '+ KV[0] +' <span class="charNumber"></span></label>');
	} else {		
		$('#charList').append('<label><input type="checkbox" checked="true"> '+ KV[0] +' <span class="charNumber"></span></label>');
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
	
	$('#charList input').each( function() { // Get media
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
		startGame()
		toScreen('game');
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

function startGame() {
	$('.charCont').children().remove();
	$('.actionsCont').children().remove();
	
	shuffle(enabledChars);
	
	for (let i = 0; i < actions.length; i++) {
		
		let characterHTML = `<div class="character"> 
											<img src="img/`+enabledChars[i]+(NSFWEnabled ? "NSFW" : "")+`.png">
												<div class="artistCont"><a href="https://www.deviantart.com/dandonfuga">Dandon Fuga</a></div>
											</img> 
											<p class="charName">`+enabledChars[i]+`</p> 
											<p class="charSource">`+findSourceMedia(enabledChars[i])+`</p> 
										</div>`
		let actionHTML = `<div class="action">
										<p>`+actions[i]+`</p>
										<div class="dropdown">
											<select></select>
										</div>
									</div>`
		$('.charCont').append(characterHTML);
		$('.actionsCont').append(actionHTML);
	};
	
	$('.character img').on('error',  // If NSFW image isn't found, fall back to SFW, then to default image
		function() {
			//console.log('error');
			let src = $(this).attr('src');
			
			if (src.includes('NSFW')) {
				$(this).attr('src', src.replace('NSFW', ''));
			}
			else if (src != 'img/noImage.png') {
				$(this).attr('src', 'img/noImage.png');
			}
			
		}
	);
	
	$('select').append('<option value="" selected></option>');
	for (let i = 0; i < actions.length; i++) {
		$('select').append('<option value="'+enabledChars[i]+'">'+enabledChars[i]+'</option>');
	};
	
	
	$('select').change( function() { // Prevents picking the same character multiple times
		let clicked = $(this);
		
		let selected = [];
		
		$('select').each(
			
			function() {			
				if ($(this).val() != '') {		
					selected.push($(this).val());
				}
			}
		);
		
		$('option').each(
			function() {
				if (selected.includes($(this).val()) && $(this).parent().val() != $(this).val()) {
					$(this).attr('disabled', 'true');
				} else {
					$(this).removeAttr('disabled');
				}
			}
		);
	});
}

function main() {
	shuffle(enabledChars);
	
	for (let i = 0; i < actions.length; i++) { // Update cards (instead of replacing them entirely)
		let card = $($('.charCont').children()[i]);
		$(card.children()[0]).attr('src', 'img/'+enabledChars[i]+(NSFWEnabled ? "NSFW" : "")+'.png')
		$(card.children()[2]).text(enabledChars[i])
		$(card.children()[3]).text(findSourceMedia(enabledChars[i]));
	} 
	
}

// Helper functions

function statistics() {
	$('.statsCont').children().remove();
	
	var charList = [];
	for (const KV of Object.entries(charArrays)) {
		charList = charList.concat(KV[1]);
	}
	charList.sort()
	for (let c of charList) {
		let html = `<div class="card statBox">
							<div class="darkFilter">
								<p>`+c+`</p>
								<div class="barCont">
									<span>Fuck</span>
									<div class="bar"><div></div></div>
									<span>Marry</span>
									<div class="bar"><div></div></div>
									<span>Kill</span>
									<div class="bar"><div></div></div>
								</div>
							</div>
						</div>`
		
		$(html).appendTo('.statsCont').css("background-image", "url(img/"+c+".png)");  
	}
	
	$('.statsCont').children().css("height", 	parseInt($('.statsCont').children().css("width").slice(0, -2))*1.5);
}

function selections(instruction, list) {
	$('#'+list+' input').each( function() {
		$(this).prop("checked", (instruction == 'select'));
	});
};

function switchLocality(loc) {
	if (loc == 'local') {
		$('.switchCont div').first().addClass('selectedSwitch');
		$('.switchCont div').last().removeClass('selectedSwitch');		
	} else {
		$('.switchCont div').last().addClass('selectedSwitch');
		$('.switchCont div').first().removeClass('selectedSwitch');
	}
}

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

$('.options label').hover( 
	function() {
		console.log('feck');
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

$('.charCont').on('mouseenter', '.character',  
	function() {
		$($(this).children()[1]).css('opacity', 1);
	}
);	
$('.charCont').on('mouseleave', '.character',  
	function() {
		$($(this).children()[1]).css('opacity', 0);
	}
);	

function imgErrorHandler() {
	
}
// Misc

