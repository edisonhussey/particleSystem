// import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );


const axesHelper = new THREE.AxesHelper(100); // Size of the axes
scene.add(axesHelper);

class ForceQuad{
    constructor(){
        this.x=(Math.random()-0.5)*10
        this.y=(Math.random()-0.5)
        this.z=(Math.random()-0.5)*10
    }

    update(){
        this.x+=(Math.random()-0.5)/10
        this.y+=(Math.random()-0.5)/10
        this.z+=(Math.random()-0.5)/10
    }

    get(){
        return new THREE.Vector3(this.x,this.y,this.z)
    }

    addForce(x,y,z){
        return new THREE.Vector3(this.x+x,this.y+y,this.z+z)
    }
}

class ParticleSystem{
    constructor(count){
        // Initialize a 3x3x3 array filled with zeros
        this.forceField= new Array(10).fill(null).map(() =>
        new Array(10).fill(null).map(() =>
        new Array(10).fill(0)
            )
        );

        this.count=count

        this.mesh= new THREE.InstancedMesh(geometry,material,count)
        this.dummy=new THREE.Object3D()
        // let particleData = new Array(count);
        this.particleData = new Array(count).fill(null).map(() => ({
            position: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            mass: 2, // kg
            gravity: new THREE.Vector3(0, -0.1, 0)
        }));

        for(let i=0;i<10;i++){
            for(let j=0;j<10;j++){
                for(let k=0;k<10;k++){
                    this.forceField[i][j][k]=new ForceQuad()
                        
                }
            }
        }
        for (let i = 0; i < count; i++) {
            this.particleData[i].position.set(Math.random() * 10, Math.random() * 10, Math.random() * 10);
            this.dummy.position.copy(this.particleData[i].position);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }



        // // const dummy = new THREE.Object3D();
        // for (let i = 0; i < count; i++) {
        //     this.dummy.position.set(Math.random() * 10, Math.random() * 10, Math.random() * 10);
        //     this.dummy.updateMatrix();
        //     this.mesh.setMatrixAt(i, this.dummy.matrix);
        // }

        
        // console.log(this.mesh)
        scene.add(this.mesh)

        
    }



    // updateParticles(deltaTime){
    //     mesh.getMatrixAt(0, dummy.matrix);
    //     dummy.position.set(i * 2 + Math.sin(Math.random()), 0, 0);
    //     dummy.updateMatrix();
    //     // Update the instance's matrix
    //     mesh.setMatrixAt(i, dummy.matrix);

    //     mesh.instanceMatrix.needsUpdate = true;
    // }

    // updateParticles(deltaTime) {
    //     for (let i = 0; i < this.mesh.count; i++) {
    //         // Retrieve the matrix for the current instance
    //         this.mesh.getMatrixAt(i, this.dummy.matrix);
    
    //         // Update the position based on unique logic
    //         this.dummy.position.setFromMatrixPosition(this.dummy.matrix);
    //         this.dummy.position.x += (Math.random() - 0.5) * deltaTime * 0.01;
    //         this.dummy.position.y += (Math.random() - 0.5) * deltaTime * 0.01;
    //         this.dummy.position.z += (Math.random() - 0.5) * deltaTime * 0.01;
    
    //         // Update the matrix with the new position
    //         this.dummy.updateMatrix();
    //         this.mesh.setMatrixAt(i, this.dummy.matrix);
    //     }
    
    //     // Mark the instance matrix as needing update
    //     this.mesh.instanceMatrix.needsUpdate = true;
    // }

    updateParticles(deltaTime) {
        for (let i = 0; i < this.count; i++) {
            const data = this.particleData[i];
    
            // Update the particle's acceleration based on gravity and any forces
            // For simplicity, forces are omitted in this example
            data.acceleration.copy(data.gravity);
    
            // Update velocity
            data.velocity.addScaledVector(data.acceleration, deltaTime * 0.1); // Adjust time scaling as needed
    
            // Update position
            data.position.addScaledVector(data.velocity, deltaTime * 0.1); // Adjust time scaling as needed
    
            // Update the instance matrix
            this.dummy.position.copy(data.position);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }
    
        // Notify Three.js that the instance matrices have changed
       this.mesh.instanceMatrix.needsUpdate = true;
    }


}
let a=new ParticleSystem(100)


class Particle{
    constructor(x,y,z){
        this.x=x
        this.y=y
        this.z=z
        this.mass=2 //kg

        this.gravity=[0,-0.1,0]
        this.acceleration=[0,0,0]
        this.velocity=[0,0,0]

        const geometry = new THREE.SphereGeometry(0.01, 32, 32); // Radius, width segments, height segments
        const material = new THREE.MeshBasicMaterial({ color: 0x0077ff }); // Blue sphere
        this.sphere=new THREE.Mesh(geometry, material);
        this.sphere.position.x=this.x
        this.sphere.position.y=this.y
        this.sphere.position.z=this.z
        scene.add(this.sphere)
    }

    update(deltaTime){
        // console.log(deltaTime)
        if(this.sphere.position.x<0 || this.sphere.position.y<0 || this.sphere.position.z<0 
            || this.sphere.position.x>10 || this.sphere.position.y>10 || this.sphere.position.z>10
        ){
            return
        }
        // console.log(this.sphere.position.x)
        // console.log(this.sphere.position.y)
        // console.log(this.sphere.position.z)
        const currentForceVector=a.array[Math.floor(this.sphere.position.x)][Math.floor(this.sphere.position.y)][Math.floor(this.sphere.position.z)]
        // console.log(currentForceVector)
        const resultant=[currentForceVector.x/this.mass,currentForceVector.y/this.mass,currentForceVector.z/this.mass]

        this.acceleration = [this.gravity[0]+resultant[0], this.gravity[1]+resultant[1], this.gravity[2]+resultant[2]];
        // console.log(this.acceleration)
        // Update velocity with acceleration
        this.velocity[0] += this.acceleration[0] * deltaTime/1000000000000;
        this.velocity[1] += this.acceleration[1] * deltaTime/1000000000000;
        this.velocity[2] += this.acceleration[2] * deltaTime/1000000000000;

        // Update position with velocity
        this.sphere.position.x += this.velocity[0] * deltaTime
        this.sphere.position.y += this.velocity[1] * deltaTime
        this.sphere.position.z += this.velocity[2] * deltaTime

        this.x=this.sphere.position.x
        this.y=this.sphere.position.y
        this.z=this.sphere.position.z
    }
}

// let a=new ParticleEffect(10,10,10,10,10,10)
// a.createParent()

// scene.add( cube );

// console.log(scene)




camera.position.z = 15;
camera.position.x=10
camera.position.y=10

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.05;
controls.enableZoom = true; // Allow zooming

// let p=new Particle(5,5,5)

// let particles=[]

// for(let i=0;i<10000;i++){
//     const p=new Particle(Math.random()*10,Math.random()*10,Math.random()*10)
//     particles.push(p)
// }

// const particleCount = 10000;
// const particles = new THREE.InstancedMesh(
//     new THREE.SphereGeometry(0.01, 32, 32),
//     new THREE.MeshBasicMaterial({ color: 0x0077ff }),
//     particleCount
// );


// const dummy = new THREE.Object3D();
// for (let i = 0; i < particleCount; i++) {
//     dummy.position.set(Math.random() * 10, Math.random() * 10, Math.random() * 10);
//     dummy.updateMatrix();
//     particles.setMatrixAt(i, dummy.matrix);
// }
// scene.add(particles);
// const particleGeometry = new THREE.SphereGeometry(0.01, 8, 8); // Reduced segments for performance
// const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x0077ff });

// // Create InstancedMesh
// const particleCount = 10000;
// const instancedMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, particleCount);
// scene.add(instancedMesh);


// const dummy = new THREE.Object3D();


// const particles = [];
// for (let i = 0; i < particleCount; i++) {
//     // Random initial positions
//     const x = Math.random() * 10;
//     const y = Math.random() * 10;
//     const z = Math.random() * 10;

//     dummy.position.set(x, y, z);
//     dummy.updateMatrix();
//     instancedMesh.setMatrixAt(i, dummy.matrix);

//     particles.push({
//         velocity: new THREE.Vector3(
//             (Math.random() - 0.5) * 0.1,
//             (Math.random() - 0.5) * 0.1,
//             (Math.random() - 0.5) * 0.1
//         ),
//         acceleration: new THREE.Vector3(),
//         matrix: new THREE.Matrix4()
//     });
// }

// function getParticlePosition(index) {
//     if (index < 0 || index >= particles.length) {
//         console.error('Index out of bounds');
//         return null;
//     }

//     // Get the matrix of the instance
//     const matrix = new THREE.Matrix4();
//     instancedMesh.getMatrixAt(index, matrix);

//     // Decompose the matrix to get the position
//     const position = new THREE.Vector3();
//     matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());

//     return position;
// }

// function updateParticles(deltaTime) {
//     for (let i = 0; i < particleCount; i++) {
//         const particle = particles[i];
//         instancedMesh.getMatrixAt(i, particle.matrix);
//         const f=getParticlePosition(i)

//         if (f.x < 0 || f.y < 0 || f.z < 0 
//             || f.x > 10 || f.y > 10 || f.z > 10) {
//             continue; // Skip updating this particle
//         }
//         else{
//             console.log('yo')
//         }

//         const position = new THREE.Vector3().setFromMatrixPosition(particle.matrix);
//         const force = a.array[Math.floor(position.x)][Math.floor(position.y)][Math.floor(position.z)];
//         // console.log(force)
//         const resultant = new THREE.Vector3(force.x / 2, force.y / 2, force.z / 2); // Adjusted for mass
        
//         particle.acceleration.set(0, -0.1, 0).add(resultant); // Gravity added
//         particle.velocity.addScaledVector(particle.acceleration, deltaTime);
//         position.addScaledVector(particle.velocity, deltaTime);

//         // Update matrix
//         particle.matrix.setPosition(position);
//         instancedMesh.setMatrixAt(i, particle.matrix);
//     }
// }

// function updateParticles(deltaTime) {
//     for (let i = 0; i < particleCount; i++) {
//         // Update position based on velocity or forces
//         // (For simplicity, let's assume a dummy update here)
//         dummy.position.x += (Math.random() - 0.5) * 0.01;
//         dummy.position.y += (Math.random() - 0.5) * 0.01;
//         dummy.position.z += (Math.random() - 0.5) * 0.01;
        
//         dummy.updateMatrix();
//         particles.setMatrixAt(i, dummy.matrix);
//     }
// }

// let lastFrameTime = performance.now();

// Check if the extension is supported

const clock = new THREE.Clock();

function animate() {
    const deltaTime = clock.getDelta();
    // const currentFrameTime = performance.now();
    // const deltaTime1 = currentFrameTime - lastFrameTime;
    // lastFrameTime = currentFrameTime;

    // console.log(`Time since last frame: ${deltaTime1.toFixed(2)} ms`);
    // const deltaTime = clock.getDelta();
    
    // updateParticles(deltaTime);

    a.updateParticles(deltaTime)
	renderer.render( scene, camera );
    requestAnimationFrame(animate);

    // for(let i=0;i<10000;i++){
    //     particles[i].update(deltaTime)
    // }
    
}
// renderer.setAnimationLoop( animate );
animate()




