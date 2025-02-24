// Ensure both p5.js and matter.js libraries are linked in your HTML file

let Engine = Matter.Engine,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Body = Matter.Body,
	engine,
	world;

let shooter;
let balls = [];
let walls = [];
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const WALL_THICKNESS = 10;

const size = 7;

const colorOptions = {
	vibrant: [
		[255, 0, 0], // Vivid Red
		[255, 127, 0], // Vivid Orange
		[255, 255, 0], // Vivid Yellow
		[127, 255, 0], // Vivid Lime Green
		[0, 255, 0], // Vivid Green
		[0, 255, 127], // Vivid Spring Green
		[0, 255, 255], // Vivid Cyan
		[0, 127, 255], // Vivid Azure
		[0, 0, 255], // Vivid Blue
		[127, 0, 255], // Vivid Violet
		[255, 0, 255], // Vivid Magenta
		[255, 0, 127], // Vivid Rose
	],
	pastelle: [
		[255, 179, 186], // Light Pink
		[255, 223, 186], // Peach
		[255, 255, 186], // Light Yellow
		[186, 255, 201], // Mint Green
		[186, 225, 255], // Light Blue
		[201, 186, 255], // Lavender
		[255, 204, 229], // Light Rose
		[204, 255, 229], // Pastel Teal
		[229, 204, 255], // Lilac
		[255, 229, 204], // Cream
		[204, 229, 255], // Soft Sky
		[255, 204, 204], // Soft Coral
	],
	monochrome: [
		[0, 0, 0], // Black
		[25, 25, 25], // Very Dark Gray
		[50, 50, 50], // Dark Gray
		[75, 75, 75], // Deep Gray
		[100, 100, 100], // Medium Dark Gray
		[125, 125, 125], // Medium Gray
		[150, 150, 150], // Soft Gray
		[175, 175, 175], // Light Gray
		[200, 200, 200], // Pale Gray
		[225, 225, 225], // Very Light Gray
		[240, 240, 240], // Almost White
		[255, 255, 255], // White
	],
};

let colors = colorOptions['vibrant'];

let buffer;

function setup() {
	let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
	canvas.parent('canvasContainer');
	buffer = createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
	engine = Engine.create();
	world = engine.world;
	engine.world.gravity.y = 0;
	engine.world.gravity.x = 0;

	// Initialize shooter and balls
	shooter = new Ball(CANVAS_WIDTH / 8, CANVAS_HEIGHT / 2, 30, true);

	const scale = 40;
	const positions = calculateDotPositions(size, scale);
	for (let i = 0; i < positions.length; i++) {
		const pos = positions[i];
		balls.push(
			new Ball(
				CANVAS_WIDTH * 0.75 + pos.x,
				CANVAS_HEIGHT / 2 + pos.y,
				10 + Math.random() * 10,
				false
			)
		);
	}

	// Walls setup: top, right, bottom, left
	walls.push(
		new Wall(CANVAS_WIDTH / 2, WALL_THICKNESS / 2, CANVAS_WIDTH, WALL_THICKNESS)
	); // Top wall
	walls.push(
		new Wall(
			CANVAS_WIDTH / 2,
			CANVAS_HEIGHT - WALL_THICKNESS / 2,
			CANVAS_WIDTH,
			WALL_THICKNESS
		)
	); // Bottom wall
	walls.push(
		new Wall(
			WALL_THICKNESS / 2,
			CANVAS_HEIGHT / 2,
			WALL_THICKNESS,
			CANVAS_HEIGHT
		)
	); // Left wall
	walls.push(
		new Wall(
			CANVAS_WIDTH - WALL_THICKNESS / 2,
			CANVAS_HEIGHT / 2,
			WALL_THICKNESS,
			CANVAS_HEIGHT
		)
	); // Right wall
}

function draw() {
	background(255);
	image(buffer, 0, 0);
	Engine.update(engine);

	// Display shooter, balls, and walls
	shooter.show();
	for (let ball of balls) {
		ball.show();
	}
	for (let wall of walls) {
		wall.show();
	}
}

function mousePressed() {
	// if the click is within the canvas, handle the press
	if (
		mouseX > 0 &&
		mouseX < CANVAS_WIDTH &&
		mouseY > 0 &&
		mouseY < CANVAS_HEIGHT
	) {
		handlePress();
	}
}

function handlePress() {
	const angle = atan2(
		mouseY - shooter.body.position.y,
		mouseX - shooter.body.position.x
	);
	const force = p5.Vector.fromAngle(angle);
	force.mult(10); // Increased force multiplier
	Body.applyForce(shooter.body, shooter.body.position, force);
}

class Ball {
	constructor(x, y, r, isShooter = false) {
		const options = {
			restitution: 0.8,
			friction: 0,
			frictionAir: 0,
			density: 0.2,
			label: isShooter ? 'shooter' : 'ball',
			bounce: 1,
		};
		this.body = Bodies.circle(x, y, r, options);
		this.r = r;
		this.color = colors[Math.floor(Math.random() * colors.length)];
		World.add(world, this.body);
	}

	show() {
		const pos = this.body.position;
		push();
		translate(pos.x, pos.y);
		stroke(255);
		strokeWeight(0);
		fill(
			this.body.label === 'shooter'
				? 0
				: `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`
		);
		ellipse(0, 0, this.r * 2);
		pop();

		// Modified drawTrail function to simulate paint brush strokes
		const drawTrail = () => {
			buffer.push();
			buffer.translate(pos.x, pos.y);

			const count = 100;
			const bump = this.r / 5;
			for (let i = 0; i < count; i++) {
				const xBump = Math.random() * bump - bump / 2;
				const yBump = Math.random() * bump - bump / 2;
				buffer.translate(xBump, yBump);
				const x = this.body.position.x - pos.x;
				const y = this.body.position.y - pos.y;
				buffer.strokeWeight(2);
				buffer.stroke(
					this.body.label === 'shooter'
						? 255
						: `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, .05)`
				);
				buffer.point(x, y);
			}
			buffer.pop();
		};

		// Only draw the trail if the ball is moving
		if (this.body.speed > 0.1 && this.body.label !== 'shooter') {
			drawTrail();
		}
	}
}

class Wall {
	constructor(x, y, width, height) {
		const options = {
			isStatic: true,
			bounce: 1,
		};
		this.body = Bodies.rectangle(x, y, width, height, options);
		this.width = width;
		this.height = height;
		World.add(world, this.body);
	}

	show() {
		const pos = this.body.position;
		push();
		translate(pos.x, pos.y);
		fill('#f0f0f0');
		stroke(0);
		strokeWeight(0);
		rectMode(CENTER);
		rect(0, 0, this.width, this.height);
		pop();
	}
}

function calculateDotPositions(size, scale) {
	var positions = [];
	var offsetX = scale * Math.cos(Math.PI / 6); // Horizontal distance between columns in a hex grid
	var offsetY = scale * Math.sin(Math.PI / 6) * 2; // Vertical distance between rows

	for (var row = 0; row < size; row++) {
		for (var col = 0; col < size; col++) {
			var x = col * 2 * offsetX + (row % 2) * offsetX; // Offset every other row
			var y = row * offsetY;
			positions.push({ x: x, y: y });
		}
	}

	// Adjust to center the grid around (0,0)
	var totalWidth = (size - 1) * 2 * offsetX + offsetX;
	var totalHeight = (size - 1) * offsetY;
	var centerX = totalWidth / 2;
	var centerY = totalHeight / 2;

	return positions.map(function (pos) {
		return { x: pos.x - centerX, y: pos.y - centerY };
	});
}

function getStarted() {
	const paletteContainer = document.getElementById('paletteContainer');
	if (paletteContainer) {
		paletteContainer.scrollIntoView({ behavior: 'smooth' });
	}
}

function beginDrawing() {
	const drawingContainer = document.getElementById('drawingContainer');
	if (drawingContainer) {
		drawingContainer.scrollIntoView({ behavior: 'smooth' });
	}
}

function clearCanvas() {
	try {
		buffer.clear(); // Clears the buffer
		background(255); // Clears the main canvas
		redraw(); // Forces p5 to redraw
	} catch (e) {
		console.error(e);
	}
}

function download() {
	saveCanvas('paint-splatter', 'png');
}

function changePalette(palette) {
	colors = colorOptions[palette];

	const images = document.querySelectorAll('.palette-image');
	for (let image of images) {
		image.classList.remove('selected');
	}
	const selectedImage = document.getElementById(palette);
	selectedImage.classList.add('selected');
	clearCanvas();
	balls = [];
	setup();
}
