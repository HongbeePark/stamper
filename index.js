// Ensure both p5.js and matter.js libraries are linked in your HTML file

let Engine = Matter.Engine,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Body = Matter.Body,
	engine,
	world;

let shooter;
let balls = [];
const numBalls = 20;
let walls = [];
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const WALL_THICKNESS = 10;

const colors = [
	[48, 25, 52], // 301934 - Dark Indigo
	[75, 0, 130], // 4B0082 - True Indigo
	[90, 33, 141], // 5A218D - Deep Indigo
	[102, 51, 153], // 663399 - Rebecca Purple
	[110, 44, 142], // 6E2C8E - Rich Indigo
	[120, 81, 169], // 7851A9 - Soft Indigo
	[130, 92, 180], // 825CB4 - Lighter Indigo
	[138, 88, 174], // 8A58AE - Medium Indigo
	[148, 112, 195], // 9470C3 - Lavender Indigo
	[159, 133, 212], // 9F85D4 - Pale Indigo
	[172, 150, 221], // AC96DD - Soft Lavender Indigo
	[190, 170, 235], // BEAAEB - Light Indigo
];

let buffer;

function setup() {
	createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
	buffer = createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
	engine = Engine.create();
	world = engine.world;
	engine.world.gravity.y = 0;
	engine.world.gravity.x = 0;

	// Initialize shooter and balls
	shooter = new Ball(CANVAS_WIDTH / 8, CANVAS_HEIGHT / 2, 20, true);
	const size = 5;
	const scale = 40;
	const positions = calculateDotPositions(size, scale);
	for (let i = 0; i < numBalls; i++) {
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
			density: isShooter ? 0.5 : 1.0,
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
