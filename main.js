const size=10;
let snake;
let allCells;
let allCellElements;
let cellWithFood;
let currentDirection;
let newDirection;
let intervalId;
let winChecked;
const foods=["🍇","🍈","🍉","🍊","🍋","🍌","🍍","🥭","🍎","🍏","🍐","🍑","🍒","🍓","🫐","🥝",
	"🍅","🫒","🥥","🥑","🍆","🥔","🥕","🌽","🌶","🫑","🥒","🥬","🥦","🧄","🧅","🍄","🥜","🌰",
	"🍞","🥐","🥖","🫓","🥨","🥯","🥞","🧇","🧀","🍖","🍗","🥩","🥓","🍔","🍟","🍕","🌭","🥪",
	"🌮","🌯","🫔","🥙","🧆","🥚","🥗","🍿","🍚","🍛","🍠","🍣","🍤","🍥","🥮","🍡","🥟","🥠",
	"🦀","🦞","🦐","🦑","🍦","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬","🍭","🍮","🍯",
	"🥛"];


function generateCells(){
	const field = document.querySelector("#field");
	for (let i=0; i<size*size; i++){
		let cell=document.createElement("div");
		field.appendChild(cell);
	}
	allCellElements = Array.from(document.querySelectorAll(`#field > div`));
}

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
	if (a===null || b===null) {return false;}

	if (a.x==b.x && a.y==b.y){
		return true;
	}
	return false;
}

function cellIsSnake(cell){
	return snake.some(segment=>sameCell(segment, cell));
}

function sameOrOppositeDirections(cd,nd){
	if (cd==nd) {
		return true;
	}
	let res;
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
	const index = (coords.x-1) + (coords.y-1)*size;
	const cell = allCellElements[index];
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
	freeCells=allCells.filter((cell)=>!cellIsSnake(cell));
	if (freeCells.length==0){
		cellWithFood=null;
		document.querySelector("#winText").setAttribute("show","true");
		return;
	}

	let randomIndex=getRandomInt(freeCells.length);
	cellWithFood=freeCells[randomIndex];

	getCellByCoords(cellWithFood).setAttribute("food","");
	getCellByCoords(cellWithFood).textContent=foods[getRandomInt(foods.length)];
}


function updateDirection(){
	let turn = undefined;
	let head = snake[0];
	if (winChecked){
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
	return turn;
}

function getNewHead(){
	let head=snake[0];
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
	return {x:x, y:y};
}

function move(){	

	let turn = updateDirection();

	const newHead = getNewHead();	
	snake.unshift(newHead);

	if (eatFood()) {
		placeNewFood();
	} else {
		updateTail();
	}
	
	updateHead(turn);

	if (isCollision()){
		loss();
	}		
}

function loss(){
	clearInterval(intervalId);
	document.querySelector("#pauseStart").setAttribute("disabled","");
	document.querySelector("#speed-slider").setAttribute("disabled","");
	setColor("gray");
	document.querySelector("#winText").setAttribute("show","false");
}


function eatFood(){
	let head = snake[0];
	if (sameCell(head,cellWithFood)){
		getCellByCoords(head).removeAttribute("food");
		getCellByCoords(head).textContent="";
		return true;
	}
	return false;
}


function updateHead(turn){
	let head=snake[0];
	let neck=snake[1];
	if (turn){
		getCellByCoords(neck).setAttribute("segment","turn");
		getCellByCoords(neck).setAttribute("turn",`${turn}`);
	} else{
		getCellByCoords(neck).setAttribute("segment","body");
		getCellByCoords(neck).setAttribute("currentDirection",`${currentDirection}`);
	}
	getCellByCoords(head).setAttribute("segment","head");
	getCellByCoords(head).setAttribute("currentDirection",`${currentDirection}`);
}

function updateTail(){
	let head = snake[0];
	const tail=snake.pop();
	if (getCellByCoords(tail) != getCellByCoords(head)){
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



function isCollision(){
	let head=snake[0];
	for (let i=1; i<snake.length; i++){
		if (sameCell(head, snake[i])) {
			return true;
		}
	}
	return false;
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
	winChecked=event.target.checked;
	event.target.blur();
});

document.addEventListener('keydown', (e) => {
	if (e.target.localName != "body"){
		return;
	}

	if (e.key === 'ArrowUp') {
	  newDirection="up";
	}
	else if (e.key === 'ArrowDown') {
	  newDirection="down";
	}
	else if (e.key === 'ArrowLeft') {
	  newDirection="left";
	}
	else if (e.key === 'ArrowRight') {
	  newDirection="right";
	}
	
	if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
    	e.preventDefault();
  	}
});

generateCells();
init();
