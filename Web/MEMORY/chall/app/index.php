<?php?>
<DOCTYPE html>
<html>

	<head>

		<meta charset="utf-8"/>
		<title>Memory</title>
		<link rel="stylesheet" href="memory.css"/>

	</head>
	<center>
	<body>
		<center>
		<script src="memory.js"></script>
		<div class="content">
			
		
		
			<button class="bouton_rejouer" onclick="button_replay()">PLAY AGAIN</button>
			<div class="game">
			<h1>MEMORY</h1>
			<table>

				<tr>
					<td><button onclick="witch1()"><img id="witch1" src="img/interrogation.png"/></button></td>

					<td><button onclick="ghost1()"><img id="ghost1"  src="img/interrogation.png" alt="interrogation"/></button></td>

					<td><button  onclick="pumpkin1()"><img id="pumpkin1" src="img/interrogation.png" alt="interrogation"/></button></td>
				</tr>

				<tr>
					<td><button onclick="ghost2()"><img id="ghost2" src="img/interrogation.png" alt="interrogation"/></button></td>

					<td><button  onclick="witch2()"><img id="witch2" src="img/interrogation.png" alt="interrogation"/></button></td>

					<td><button onclick="vampire2(4)"><img id="vampire2"  src="img/interrogation.png" alt="interrogation"/></button></td>
				</tr>

				<tr>
					<td><button onclick="pumpkin2()"><img id="pumpkin2" src="img/interrogation.png" alt="interrogation"/></button></td>

					<td><button onclick="vampire1()"><img id="vampire1" src="img/interrogation.png" alt="interrogation"/></button></td>

					<td><button onclick="piege()"><img id="piege_ripper" src="img/interrogation.png" alt="interrogation"/></button></td>
				</tr>
				
			</table>

		</div>

	

		</center>

		<div id="advisor">
			<p>You're opinion is important for us</p>
			<p>Please let we know what you think about our new memory game</p>
			<p>For this, post your comment below</p>	
			<form action="index.php", method="POST">

				<label for="comment">Enter your comment</label>
				<input id="comment" type="text" name="comment"/>
				<br />

				

					<?php
					try{

						$conn = new PDO("mysql:host=127.0.0.1;dbname=memory",'admin','HJRKurioealPOIEEE');

						if (isset($_POST["comment"])){

							
								

								$comment = $_POST["comment"];
								$statement = $conn->query("INSERT INTO comments(comment) VALUES('$comment')");

								$result = $statement->fetch();
								$statement->closeCursor();
								?>
								<p style="color: green;">The comment has been published, thanks</p><?php

						}

						$statement = $conn->query("SELECT * FROM comments ORDER BY id DESC LIMIT 0, 1");

						$lastComment = $statement->fetch();
						$statement->closeCursor();
						
						?><p style="font-style: italic; color: black;">The last comment published was : "<?php echo $lastComment["comment"];?>"</p>

						<?php
						
					}
					
					catch(Exception $e) {

						?><p style="color: red; font-family:'Arial';">An error occured, please retry</p><?php
						echo $e;

					}
				
			?>

				<button type="submit">Send your comment</button>

			</form>
		
		</div>

	</div>


		

		
		
	</body>

</html>
