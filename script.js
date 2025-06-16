import Physics_Engine from './physics/physics.js';
import custom_loader from './custom_loader.js';

let enemy_spaceship; // Placeholder for the enemy spaceship model
let user_spaceship; // Placeholder for the user spaceship model
let background_model;
let enemy_missile; // Placeholder for the enemy missile model

let phoenix_bird_clip;
let mixer;
let bird;


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 );

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(0, 100, 0);


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);


let bloomPass = new THREE.UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1, // params.bloom_brightness, // strength
  1, // 0.4, // radius
   0.2 // params.bloom_threshold // threshold
);
composer.addPass(bloomPass);

const loader = new THREE.GLTFLoader();





function loadAllModels(paths, loader) {
  const promises = paths.map(path => {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          let scale = 5;
          if (path === 'assets/background/scene.gltf') {
            scale = 100; // Adjust scale for background model
          }
          if (path === 'assets/enemy_missile/scene.gltf') {
            scale = 0.2; // Adjust scale for enemy missile model
            // model.children[0].rotation.y = -Math.PI / 2;

            // model.position.set(0, 0, 0); // Reset position for enemy missile
            // model.rotation.set(Math.PI, Math.PI/2, Math.PI/2); // Reset rotation for enemy missile
            console.log(model,'im hereeee');

          }

          if(path === 'assets/phoenix_bird/scene.gltf') {

            // console.log(gltf.animations[0]);
            scale = 0.05; // Adjust scale for cube explosion model
            // model.scale.set(scale, scale, scale);
            model.children[0].scale.set(0.05, 0.05, 0.05
            ); // Holds the actual mesh

            // console.log('animations', gltf.animations); // Log all animations in the model
       
            // bird= model; // Store the bird model for later use

            mixer = new THREE.AnimationMixer(model);

            phoenix_bird_clip = gltf.animations[0];
            if (phoenix_bird_clip) {
                const action = mixer.clipAction(phoenix_bird_clip);
                action.setLoop(THREE.LoopRepeat, Infinity); // Loop the animation
                action.clampWhenFinished = true;
                action.play();
            } else {
                console.warn('No animation named "Animation" found.');
            }
          }



          model.scale.set(scale, scale, scale);
          resolve(model);  // resolve the Promise with the loaded model
        },
        undefined,
      (error) => {
        reject(error);
      }
    );
  });
});
  return Promise.all(promises);
}

await loadAllModels(['assets/enemy_spaceship/scene.gltf','assets/background/scene.gltf','assets/enemy_missile/scene.gltf','assets/phoenix_bird/scene.gltf'], loader).then((models) => {
    if (models && models.length > 0) {
        enemy_spaceship = models[0];
        background_model = models[1];
        enemy_missile = models[2];
        bird = models[3];

    } else {
        console.error('No models loaded');
    }
});



scene.add(enemy_spaceship); // Add the enemy spaceship model to the scene
scene.add(background_model); // Add the background model to the scene
scene.add(enemy_missile); // Add the enemy missile model to the scene
scene.add(bird); // Add the bird model to the scene


const ambientLight = new THREE.AmbientLight(0xffffff, 3); // soft white light
scene.add(ambientLight);



const axesHelper = new THREE.AxesHelper(100); // Size of the axes
scene.add(axesHelper);


// scene.add( cube );
camera.position.z = 5;
// Add a grid helper
const gridHelper = new THREE.GridHelper( 10, 10 );
scene.add( gridHelper );
// Add a point light

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional for smoother motion
controls.dampingFactor = 0.05;

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    composer.setSize(width, height);
});


scene.add(gridHelper);



const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// Ambient light helps fill dark shadows
const ambient = new THREE.AmbientLight(0x404040); 
scene.add(ambient);



const clock = new THREE.Clock();
let physicsEngine = new Physics_Engine(scene, enemy_spaceship, enemy_missile); // Pass the scene and enemy model template to the physics engine

// Create a player object
let player = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
player.position.set(0, 0, 0);
player.velocity = new THREE.Vector3(0, 0, 0); // Initial velocity
player.health = 100; // Example health value
player.type = 0; // Player type

// physicsEngine.addObject(player); // Add player to the physics engine
physicsEngine.init(player);

document.body.addEventListener('keydown', (e) => {

  console.log(player);
    if (e.key === 'w') {
        player.velocity.z += -0.4; // Move forward
    } else if (e.key === 's') {
        player.velocity.z += 0.4; // Move backward
    } else if (e.key === 'a') {
        player.velocity.x += -0.4; // Move left
    } else if (e.key === 'd') {
        player.velocity.x += 0.4; // Move right
    }
    // } else if (e.key === ' ') {
    //     player.velocity.y = 0.1; // Jump or move up
    // }
});



const hpLabel = document.createElement('div');
hpLabel.style.position = 'absolute';
hpLabel.style.color = 'red';
hpLabel.style.fontWeight = 'bold';
hpLabel.style.fontFamily = 'Arial, sans-serif';
hpLabel.style.pointerEvents = 'none';  // So it doesn't interfere with mouse events
document.body.appendChild(hpLabel);

// 2. Function to update label position
function updateHpLabel() {
  // Convert 3D position to 2D screen position
  const vector = player.position.clone();
  vector.project(camera);  // projects vector to normalized device coordinates (-1 to 1)

  const halfWidth = window.innerWidth / 2;
  const halfHeight = window.innerHeight / 2;

  // Calculate screen coordinates
  const x = (vector.x * halfWidth) + halfWidth;
  const y = (-vector.y * halfHeight) + halfHeight;

  // Position the label and update text
  hpLabel.style.left = `${x}px`;
  hpLabel.style.top = `${y - 20}px`; // slightly above the player
  hpLabel.textContent = `HP: ${player.health}`;
}


function animate() {
    controls.update(); // Update controls for damping effect
    updateHpLabel(); // Update the HP label position

    const deltaTime = clock.getDelta(); // Get the time elapsed since the last frame
    physicsEngine.update(deltaTime); // Update the physics engine

    //experimental
    // bird.position.x+=0.01;


    mixer.update(deltaTime); // Update animation

    composer.render();


    requestAnimationFrame( animate );
}

animate();
