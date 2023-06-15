
var number_choice = 1;
var number_image; 
var number_cards_turned = 0;

function witch1()
{
	number_cards_turned += 1;
	document.getElementById("witch1").src="img/witch.png";
	
	if (number_choice == 1)
	{
		number_choice = 2;
		number_image = 1;
	}
	
	else
	{
		number_choice = 1;

		if (number_cards_turned == 8)
		{
			setTimeout(gagner,300);
		}

		if (number_image != 1)
		{
			setTimeout(rejouer,300);
		} 
	}

}


function witch2()
{
	number_cards_turned += 1;
	document.getElementById("witch2").src="img/witch.png";
	
	if (number_choice == 1)
	{
		number_choice = 2;
		number_image = 1;
	}
	
	else
	{
		number_choice = 1;

		if (number_cards_turned == 8)
		{
			setTimeout(gagner,300);
		}

		if (number_image != 1)
		{
			setTimeout(rejouer,300);
		} 
	}

}

function ghost1()
{
	number_cards_turned += 1;
	document.getElementById("ghost1").src="img/ghost.png";
	
	if (number_choice == 1)
	{
		number_choice = 2;
		number_image = 2;
	}
	
	else
	{
		number_choice = 1;

		if (number_cards_turned == 8)
		{
			setTimeout(gagner,300);
		}

		if (number_image != 2)
		{
			setTimeout(rejouer,300);
		} 
	}

}

function ghost2()
{
	number_cards_turned += 1;
	document.getElementById("ghost2").src="img/ghost.png";
	
	if (number_choice == 1)
	{
		number_choice = 2;
		number_image = 2;
	}
	
	else
	{
		number_choice = 1;

		if (number_cards_turned == 8)
		{
			setTimeout(gagner,300);
		}

		if (number_image != 2)
		{
			setTimeout(rejouer,300);
		} 
	}

}

function pumpkin1()
{
	number_cards_turned += 1;
	document.getElementById("pumpkin1").src="img/pumpkin.png";
	
	if (number_choice == 1)
	{
		number_choice = 2;
		number_image = 3;
	}
	
	else
	{
		number_choice = 1;

		if (number_cards_turned == 8)
		{
			setTimeout(gagner,300);
		}

		if (number_image != 3)
		{
			setTimeout(rejouer,300);
		} 
	}

}

function pumpkin2()
{
	number_cards_turned += 1;
	document.getElementById("pumpkin2").src="img/pumpkin.png";
	
	if (number_choice == 1)
	{
		number_choice = 2;
		number_image = 3;
	}
	
	else
	{
		number_choice = 1;

		if (number_cards_turned == 8)
		{
			setTimeout(gagner,300);
		}

		if (number_image != 3)
		{
			setTimeout(rejouer,300);
		} 
	}

}

function vampire1()
{
	number_cards_turned += 1;
	document.getElementById("vampire1").src="img/vampire.png";
	
	if (number_choice == 1)
	{
		number_choice = 2;
		number_image = 4;
	}
	
	else
	{
		number_choice = 1;

		if (number_cards_turned == 8)
		{
			setTimeout(gagner,300);
		}

		if (number_image != 4)
		{
			setTimeout(rejouer,300);
		} 
	}

}

function vampire2()
{
	number_cards_turned += 1;
	document.getElementById("vampire2").src="img/vampire.png";
	
	if (number_choice == 1)
	{
		number_choice = 2;
		number_image = 4;
	}
	
	else
	{
		number_choice = 1;

		if (number_cards_turned == 8)
		{
			setTimeout(gagner,300);
		}

		if (number_image != 4)
		{
			setTimeout(rejouer,300);
		} 
	}

}

function piege()
{
	number_image = 5;
	document.getElementById("piege_ripper").src="img/death.png";
	setTimeout(rejouer,300);
}

function rejouer()
{
	number_cards_turned = 0;
	
	if (number_image == 5)
	{
		alert("Oh Oh Oh, you fell on the trap card !");
		document.getElementById("witch1").src="img/witch.png";
		document.getElementById("witch2").src="img/witch.png";
		document.getElementById("ghost1").src="img/ghost.png";
		document.getElementById("ghost2").src="img/ghost.png";
		document.getElementById("pumpkin1").src="img/pumpkin.png";
		document.getElementById("pumpkin2").src="img/pumpkin.png";
		document.getElementById("vampire1").src="img/vampire.png";
		document.getElementById("vampire2").src="img/vampire.png";	
	}

	else
	{
		alert("Bouh you were wrong");
		document.getElementsByTagName("img").src="img/interrogation.png";
		document.location.reload();
		 
	}
		
}

function gagner()
{
	alert("Congratulations young monster you won !!!");
	document.getElementById("piege_ripper").src="img/death.png";
}

function button_replay()
{
	document.location.reload();
}