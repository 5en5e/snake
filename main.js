const size=10;
let snake;
let allCells;
let currentDirection;
let newDirection;
let intervalId;
const foods=["🍇","🍈","🍉","🍊","🍋","🍌","🍍","🥭","🍎","🍏","🍐","🍑","🍒","🍓","🫐","🥝",
	"🍅","🫒","🥥","🥑","🍆","🥔","🥕","🌽","🌶","🫑","🥒","🥬","🥦","🧄","🧅","🍄","🥜","🌰",
	"🍞","🥐","🥖","🫓","🥨","🥯","🥞","🧇","🧀","🍖","🍗","🥩","🥓","🍔","🍟","🍕","🌭","🥪",
	"🌮","🌯","🫔","🥙","🧆","🥚","🥗","🍿","🍚","🍛","🍠","🍣","🍤","🍥","🥮","🍡","🥟","🥠",
	"🦀","🦞","🦐","🦑","🍦","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬","🍭","🍮","🍯",
	"🥛"];

function setColor(c){
	const cont=document.querySelector("#field");
	c=="gray" ? cont.setAttribute("gray","") : cont.removeAttribute("gray");
	return;
}

function init(){
	snake=[{x:1, y:1},{x:1, y:2},{x:1, y:3}];

	allCells=new Array();
	
	for (let i=1; i<=size; i++){
		for (let j=1; j<=size; j++){
			cell={x:i, y:j};
			allCells.push(cell);
		}
	}

	currentDirection="up";
	newDirection="up";

	document.querySelectorAll(`#field > div`).forEach((e)=>{
		e.removeAttribute("segment");
		e.removeAttribute("turn");
		e.removeAttribute("currentDirection");
		e.removeAttribute("food");
		e.textContent="";
	})

	for (let j=0; j<snake.length; j++){
			el=document.querySelector(`#field > :nth-child(${j*size + 1})`);
			if (j==0){
				el.setAttribute("segment","head");
			}
			else if (j==snake.length-1){
				el.setAttribute("segment","tail");
			}
			else {
				el.setAttribute("segment","body");
			}
		} 
	
	placeNewFood();
	clearInterval(intervalId); 
	intervalId = window.setInterval(move, (1000-document.querySelector("#speed-slider").value));
}

function sameCell(a,b){
	if (a.x==b.x && a.y==b.y){
		return true;
	}
	return false;
}

function cellIsSnake(cell){
	for (let i=0; i<snake.length; i++){
		if (sameCell(snake[i], cell)){
			return true;
		}
	}
	return false;
}

function sameOrOppositeDirections(cd,nd){
	if (cd==nd) {
		return true;
	}

	switch (cd){
	case "up":
		res = nd=="down" ? true : false;
		break;
	case "down":
		res = nd=="up" ? true : false;
		break;
	case "right":
		res = nd=="left" ? true : false;
		break;
	case "left":
		res = nd=="right" ? true : false;
		break;
	}
	return res;
}

function getCellByCoords(coords){
	const num = coords.x + (coords.y-1)*size;
	const cell = document.querySelector(`#field > :nth-child(${num})`);
	return cell;
}

function increment(a){
	let x = a;
	x += 1;
	if (x > size) {
		x=1;
	}
	return x;
}

function decrement(a){
	let x = a;
	x -= 1;
	if (x < 1) {
		x=size;
	}
	return x;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function placeNewFood(){
	//получить набор свободных клеток
	freeCells=allCells.filter((cell)=>!cellIsSnake(cell));
	if (freeCells.length==0){
		document.querySelector("#winText").setAttribute("show","true");
		return;
	}
	//найти случайное число в диапазоне
	randomIndex=getRandomInt(freeCells.length);
	newFoodCell=freeCells[randomIndex];


	//расположить пищу на соответствующей ячейке
	getCellByCoords(newFoodCell).setAttribute("food","");
	getCellByCoords(newFoodCell).textContent=foods[getRandomInt(foods.length)];
}

function move(){	
	let turn=undefined;
	let head=snake[0];
	let win =document.querySelector("#win-checkbox").checked;
	if (win){
		if (head.y==1) {
			if(currentDirection=="up") {
				newDirection="right";
			}
			else if((currentDirection=="right")||(currentDirection=="left")) {
				newDirection="down";
			}
		}
		else if(head.y==10) { 
			if(currentDirection=="down") {
				newDirection="right";
			}
			else if((currentDirection=="right")||(currentDirection=="left")) {
				newDirection="up";
			}
		}
		else {
			if((currentDirection=="right")||(currentDirection=="left")) {
				newDirection="up";
			}	
		}
	}

	if (!sameOrOppositeDirections(currentDirection, newDirection)){
		turn=`${currentDirection}-${newDirection}`;
		currentDirection=newDirection;
	}

	let x = head.x;
	let y = head.y;
	switch (currentDirection){
	case "up":
		y = decrement(y);
		break;
	case "down":
		y = increment(y);
		break;
	case "right":
		x = increment(x);
		break;
	case "left":
		x = decrement(x);
		break;
	}
	const newHead={x:x, y:y};

	let stop;
	if (cellIsSnake(newHead) && !sameCell(newHead, snake[snake.length-1])){
		stop=true;
	}
	
	if (turn){
		getCellByCoords(head).setAttribute("segment","turn");
		getCellByCoords(head).setAttribute("turn",`${turn}`);
	} else{
		getCellByCoords(head).setAttribute("segment","body");
		getCellByCoords(head).setAttribute("currentDirection",`${currentDirection}`);
	}
	
	snake.unshift(newHead);

	getCellByCoords(newHead).setAttribute("segment","head");
	getCellByCoords(newHead).setAttribute("currentDirection",`${currentDirection}`);

	if (getCellByCoords(newHead).hasAttribute("food")) {
		getCellByCoords(newHead).removeAttribute("food");
		getCellByCoords(newHead).textContent="";
		placeNewFood();
	} else {

		const tail=snake.pop();
		if (getCellByCoords(tail) != getCellByCoords(snake[0])){
			getCellByCoords(tail).removeAttribute("segment");
			getCellByCoords(tail).removeAttribute("turn");	
		}


		let last = getCellByCoords(snake[snake.length-1]);
		let turn;
		if (last.getAttribute("segment") == "turn"){
			turn=last.getAttribute("turn");
		}

		last.setAttribute("segment","tail");
		let direction;
		if (turn){
			switch(turn){
				case "up-left":
				case "down-left":  
					direction="left";
					break; 
				case "right-up": 
				case "left-up":
					direction="up";
					break; 
				case "right-down":
				case "left-down":
					direction="down";
					break; 
				case "down-right": 
				case "up-right":
					direction="right";
					break; 
			}
			last.setAttribute("currentDirection",`${direction}`);	
		}

	}
	if (stop){
		getCellByCoords(newHead).setAttribute("segment","head");
		getCellByCoords(newHead).setAttribute("currentDirection",`${currentDirection}`);
		clearInterval(intervalId);
		document.querySelector("#pauseStart").setAttribute("disabled","");
		document.querySelector("#speed-slider").setAttribute("disabled","");
		setColor("gray");
		document.querySelector("#winText").setAttribute("show","false");
		return;
	}		
}


window.addEventListener('blur', () => {
    document.querySelector("#warningText").setAttribute("show","true");;
});

window.addEventListener('focus', () => {
    document.querySelector("#warningText").setAttribute("show","false");;
});

document.querySelector("#pauseStart").addEventListener("click", (event) => {
	if (event.target.innerText=="Пауза"){
		event.target.innerText="Старт";
		clearInterval(intervalId);
	}
	else{
		event.target.innerText="Пауза";
		intervalId = window.setInterval(move, (1000-document.querySelector("#speed-slider").value));
	}
	event.target.blur();
});

document.querySelector("#newGame").addEventListener("click", (event) => {
	document.querySelector("#pauseStart").removeAttribute("disabled");
	document.querySelector("#pauseStart").innerText="Пауза";
	document.querySelector("#speed-slider").removeAttribute("disabled");
	document.querySelector("#winText").setAttribute("show","false");
	document.querySelector("#warningText").setAttribute("show","false");
	event.target.blur();
	setColor();
	init();
});

document.querySelector("#speed-slider").addEventListener("change", (event) => {
	if (document.querySelector("#pauseStart").innerText=="Старт"){
		return;
	}
	val=event.target.value;
	speed=1000 - val;
  clearInterval(intervalId);
  intervalId = window.setInterval(move, speed);
  event.target.blur();
});

document.querySelector("#win-checkbox").addEventListener("click", (event) => {
  event.target.blur();
});

document.addEventListener('keydown', (e) => {
	if (e.target.localName != "body"){
		return;
	}

  if (e.key === 'ArrowUp') {
    newDirection="up";
  }
  if (e.key === 'ArrowDown') {
    newDirection="down";
  }
  if (e.key === 'ArrowLeft') {
    newDirection="left";
  }
  if (e.key === 'ArrowRight') {
    newDirection="right";
  }
});


init();
