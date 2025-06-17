import Physics_Engine from './physics/physics.js';
import custom_loader from './custom_loader.js';


let enemy_spaceship; // Placeholder for the enemy spaceship model
let user_spaceship; // Placeholder for the user spaceship model
let background_model;
let enemy_missile; // Placeholder for the enemy missile model

let phoenix_bird_clip;

let phoenix;

let player;


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
          const animation = gltf.animations[0]; // Use the first animation from the loaded GLTF
          let scale = 5;
          if (path === 'assets/background/scene.gltf') {
            scale = 100; // Adjust scale for background model
            model.scale.set(scale, scale, scale);
          }

          if (path === 'assets/enemy_spaceship/scene.gltf') {
            // model.traverse((child) => {
            //     if (child.isMesh) {
            //         // child.material.emissive = new THREE.Color(0xffffff); // Add red emissive material

            //         child.material = new THREE.MeshStandardMaterial({
            //             color: 0xffffff,
            //             emissive: 0xff4400,
            //             emissiveIntensity: 1.5,
            //             metalness: 0.3,
            //             roughness: 0.4
            //         });
            //     }
            // });
            model.traverse((child) => {
                if (child.isMesh && child.material && child.material.color) {
                    const baseColor = child.material.color.clone();

                    // Multiply each RGB component by 1.5, and clamp to 1.0
                    const emissiveColor = baseColor.multiplyScalar(1.5);
                    emissiveColor.r = Math.min(1.0, emissiveColor.r);
                    emissiveColor.g = Math.min(1.0, emissiveColor.g);
                    emissiveColor.b = Math.min(1.0, emissiveColor.b);

                    child.material.emissive = emissiveColor;
                    child.material.emissiveIntensity = 0.2; // Adjust as needed
                    child.material.needsUpdate = true;
                }
            });



            model.scale.set(scale, scale, scale);
          }
          if (path === 'assets/enemy_missile/scene.gltf') {
            scale = 0.1; // Adjust scale for enemy missile model
            model.scale.set(scale, scale, scale);
            // model.traverse((child) => {
            //     if (child.isMesh) {
            //         // child.material.emissive = new THREE.Color(0xffffff); // Add red emissive material
            //         child.material = new THREE.MeshStandardMaterial({
            //             color: 0xffffff,
            //             emissive: 0xff4400,
            //             emissiveIntensity: 1.5,
            //             metalness: 0.3,
            //             roughness: 0.4
            //         });
            //     }
            // });

          }

          if(path === 'assets/phoenix_bird/scene.gltf') {

            // console.log(gltf.animations[0]);
            scale = 0.5; // Adjust scale for cube explosion model
            model.scale.set(scale, scale, scale);

            // model.scale.set(scale, scale, scale);
            // gltf.model.children[0].scale.set(0.05, 0.05, 0.05);


            // ); // Holds the actual mesh

            // console.log('animations', gltf.animations); // Log all animations in the model
       
            // bird= model; // Store the bird model for later use

            // mixer = new THREE.AnimationMixer(model);

            // phoenix_bird_clip = gltf.animations[0];
            // if (phoenix_bird_clip) {
            //     const action = mixer.clipAction(phoenix_bird_clip);
            //     action.setLoop(THREE.LoopRepeat, Infinity); // Loop the animation
            //     action.clampWhenFinished = true;
            //     action.play();
            // } else {
            //     console.warn('No animation named "Animation" found.');
            // }
            // model=gltf;

          }



        //   model.scale.set(scale, scale, scale);
          resolve({model, animation});  // resolve the Promise with the loaded model
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
        enemy_spaceship = models[0].model;
        background_model = models[1].model;
        enemy_missile = models[2].model;
        phoenix = models[3]

    } else {
        console.error('No models loaded');
    }
});



scene.add(enemy_spaceship); // Add the enemy spaceship model to the scene
scene.add(background_model); // Add the background model to the scene
scene.add(enemy_missile); // Add the enemy missile model to the scene
// scene.add(phoenix); // Add the phoenix bird model to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 3); // soft white light
scene.add(ambientLight);
const axesHelper = new THREE.AxesHelper(100); // Size of the axes
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper( 10, 10 );
scene.add( gridHelper );
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional for smoother motion
controls.dampingFactor = 0.05;
// scene.add(controls);

camera.position.set(0, 10, 20); // Set camera position

const ambient = new THREE.AmbientLight(0x404040); 
scene.add(ambient);



window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    composer.setSize(width, height);
});

// console.log(phoenix);
// player=phoenix.scene.clone(true);
// let player_clip= phoenix.animations[0]; // Assuming the first animation is the one you want to use

// mixer = new THREE.AnimationMixer(player);
// const action = mixer.clipAction(player_clip); // Use the same clip
// action.setLoop(THREE.LoopRepeat, Infinity);
// action.play();


// 
// const mixer = new THREE.AnimationMixer(player);
// const action = mixer.clipAction(phoenix.animation);
// action.setLoop(THREE.LoopRepeat, Infinity);
// action.play();
// scene.add(player);

console.log(phoenix.animation);
console.log(phoenix.animation.tracks);

// player = phoenix.model.clone(true);
player = phoenix.model;
player.position.set(0, 0, 0);
player.scale.set(0.005, 0.005, 0.005); // or something visible


player.velocity = new THREE.Vector3(0, 0, 0); // Initial velocity
player.health = 100; // Example health value
player.type = 0; // Player type
player.acceleration = new THREE.Vector3(0, 0, 0); // Initial acceleration


player.rotation.order = 'YXZ'; // Yaw (y), Pitch (x), Roll (z)
player.quaternion.set(0, 0, 0, 0); // Reset to identity quaternion


// document.body.addEventListener('keydown', (e) => {
//     // --- ROTATION (local axes) ---
//     // Yaw (left/right) - rotate around local Y
//     if (e.key === 'a') {
//         player.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationSpeed);
//     }
//     if (e.key === 'd') {
//         player.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotationSpeed);
//     }
//     // Pitch (up/down) - rotate around local Z (since forward is X)
//     if (e.key === 'w') {
//         player.rotateOnAxis(new THREE.Vector3(0, 0, 1), rotationSpeed);
//     }
//     if (e.key === 's') {
//         player.rotateOnAxis(new THREE.Vector3(0, 0, 1), -rotationSpeed);
//     }
//     // Roll - rotate around local X (forward)
//     if (e.key === 'q') {
//         player.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotationSpeed);
//     }
//     if (e.key === 'e') {
//         player.rotateOnAxis(new THREE.Vector3(1, 0, 0), -rotationSpeed);
//     }

//     // --- THRUST / STRAFE (local axes, update velocity directly) ---
//     // Forward thrust (spacebar) - local +X
//     if (e.code === 'Space') {
//         const forward = new THREE.Vector3(1, 0, 0).applyQuaternion(player.quaternion);
//         player.velocity.add(forward.multiplyScalar(thrust));
//     }
//     // Strafe left/right - local -Z/+Z
//     if (e.key === 'ArrowLeft') {
//         const left = new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion);
//         player.velocity.add(left.multiplyScalar(strafe));
//     }
//     if (e.key === 'ArrowRight') {
//         const right = new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion);
//         player.velocity.add(right.multiplyScalar(strafe));
//     }
//     // Strafe up/down - local +Y/-Y
//     if (e.key === 'ArrowUp') {
//         const up = new THREE.Vector3(0, 1, 0).applyQuaternion(player.quaternion);
//         player.velocity.add(up.multiplyScalar(vertical));
//     }
//     if (e.key === 'ArrowDown') {
//         const down = new THREE.Vector3(0, -1, 0).applyQuaternion(player.quaternion);
//         player.velocity.add(down.multiplyScalar(vertical));
//     }
// });


const keys = {};

document.body.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    keys[e.key] = true; // for letter keys
});
document.body.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    keys[e.key] = false;
});


const clock = new THREE.Clock();

console.log(player, 'yo');
let physicsEngine = new Physics_Engine(scene, camera, enemy_spaceship, enemy_missile); // Pass the scene and enemy model template to the physics engine
physicsEngine.init(player);


let mixer = new THREE.AnimationMixer(player);
const action = mixer.clipAction(phoenix.animation); // Use the animation from the phoenix model
action.setLoop(THREE.LoopRepeat, Infinity);
action.play();









// document.body.addEventListener('keydown', (e) => {

//   console.log(player);
//     if (e.key === 'w') {
//         player.velocity.z += -0.4; // Move forward
//     } else if (e.key === 's') {
//         player.velocity.z += 0.4; // Move backward
//     } else if (e.key === 'a') {
//         player.velocity.x += -0.4; // Move left
//     } else if (e.key === 'd') {
//         player.velocity.x += 0.4; // Move right
//     }

// });



// const hpLabel = document.createElement('div');
// hpLabel.style.position = 'absolute';
// hpLabel.style.color = 'red';
// hpLabel.style.fontWeight = 'bold';
// hpLabel.style.fontFamily = 'Arial, sans-serif';
// hpLabel.style.pointerEvents = 'none';  // So it doesn't interfere with mouse events
// document.body.appendChild(hpLabel);

// // 2. Function to update label position
// function updateHpLabel() {
//   // Convert 3D position to 2D screen position
//   const vector = player.position.clone();
//   vector.project(camera);  // projects vector to normalized device coordinates (-1 to 1)

//   const halfWidth = window.innerWidth / 2;
//   const halfHeight = window.innerHeight / 2;

//   // Calculate screen coordinates
//   const x = (vector.x * halfWidth) + halfWidth;
//   const y = (-vector.y * halfHeight) + halfHeight;

//   // Position the label and update text
//   hpLabel.style.left = `${x}px`;
//   hpLabel.style.top = `${y - 20}px`; // slightly above the player
//   hpLabel.textContent = `HP: ${player.health}`;
// }

const thrust = 2;
const rotationSpeed = 0.02;
const strafe = 0.001;
const vertical = 0.001;

const control_reduce_acceleration = 0.95;
const control_reduce_velocity = 0.95; // Reduce velocity when controls are pressed

function animate() {
    controls.update(); // Update controls for damping effect

    // updateHpLabel(); // Update the HP label position

    const deltaTime = clock.getDelta(); // Get the time elapsed since the last frame
    physicsEngine.update(deltaTime); // Update the physics engine



    player.acceleration.multiplyScalar(0.99);
    player.velocity.multiplyScalar(0.9999); 

    const speed = player.velocity.length();
    let desired_direction = new THREE.Vector3();


    // --- THRUST / STRAFE (local axes) ---
    if (keys['KeyQ']){
        player.acceleration.multiplyScalar(control_reduce_acceleration);
        player.velocity.multiplyScalar(control_reduce_velocity);
    }
    if (keys['Space']) {
        // player.acceleration.multiplyScalar(control_reduce_acceleration);
        const forward = new THREE.Vector3(1, 0, 0).applyQuaternion(player.quaternion);
        player.acceleration.add(forward.multiplyScalar(thrust));
    }
    if (keys['ArrowLeft']) {
        player.acceleration.multiplyScalar(control_reduce_acceleration);
        const left = new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion);
        player.acceleration.add(left.multiplyScalar(strafe));

        desired_direction.add(new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion));
    }
    if (keys['ArrowRight']) {
        player.acceleration.multiplyScalar(control_reduce_acceleration);
        const right = new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion);
        player.acceleration.add(right.multiplyScalar(strafe));

        desired_direction.add(new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion));

    }
    if (keys['ArrowUp']) {
        player.acceleration.multiplyScalar(control_reduce_acceleration);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(player.quaternion);
        player.acceleration.add(up.multiplyScalar(vertical));

        desired_direction.add(new THREE.Vector3(0, 1, 0).applyQuaternion(player.quaternion));

    }
    if (keys['ArrowDown']) {
        player.acceleration.multiplyScalar(control_reduce_acceleration);
        const down = new THREE.Vector3(0, -1, 0).applyQuaternion(player.quaternion);
        player.acceleration.add(down.multiplyScalar(vertical));

        desired_direction.add(new THREE.Vector3(0, -1, 0).applyQuaternion(player.quaternion));

    }

    if (desired_direction.lengthSq() > 0) {
        desired_direction.normalize();

        // 3. Blend or set velocity to new direction, keeping the same magnitude
        // Option 1: Snap instantly (arcade)
        // player.velocity.copy(desired_direction.multiplyScalar(speed));

        // Option 2: Blend smoothly (recommended)
        player.velocity.lerp(desired_direction.multiplyScalar(speed), 0.01); // 0.01 is blend factor

        // 4. Add acceleration as usual
        // player.acceleration.add(desired_direction.multiplyScalar(thrust));
    }



    // player.position.add(player.velocity.clone().multiplyScalar(deltaTime));

    //experimental
    // bird.position.x+=0.01;
    camera.position.copy(player.position); // Update camera position to follow the player
    const direction = new THREE.Vector3();
    direction.copy(player.velocity).normalize(); // Get the direction of the player's velocity
    camera.position.add(direction.multiplyScalar(-15)); // Position the camera behind the player
    // camera.position.y += 5; // Adjust the height of the camera

    camera.lookAt(player.position); // Make the camera look at the player

    mixer.update(deltaTime); // Update animation

    composer.render();


    requestAnimationFrame( animate );
}

animate();
