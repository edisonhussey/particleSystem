const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 );

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
        this.x=(Math.random()-0.5)*2
        this.y=(Math.random()-0.5)
        this.z=(Math.random()-0.5)*2
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
        const geometry = new THREE.SphereGeometry(0.01, 32, 32);

    const material = new THREE.MeshBasicMaterial({
        // color: 0xffa500,       // Base color of the sphere (orange)
        color: 0xFFFAFA,
        emissive: 0xFFFAFA,
        // emissive: 0xffa500,    // Emissive color (same as the base color)
        emissiveIntensity: 0.4,  // Intensity of the glow
        metalness: 0.5,        // Some metalness for a shiny effect
        roughness: 0.3         // Adjust roughness for a smooth but slightly diffused look
    });
        

        this.array= new Array(10).fill(null).map(() =>
        new Array(10).fill(null).map(() =>
        new Array(10).fill(0)
            )
        );

        this.count=count

        this.mesh= new THREE.InstancedMesh(geometry,material,count)
        this.dummy=new THREE.Object3D()
        this.particleData = new Array(count).fill(null).map(() => ({
            position: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            mass: 2, // kg
            gravity: new THREE.Vector3(0, -0.2, 0)
        }));

        for(let i=0;i<10;i++){
            for(let j=0;j<10;j++){
                for(let k=0;k<10;k++){
                    this.array[i][j][k]=new ForceQuad()
                        
                }
            }
        }
        for (let i = 0; i < count; i++) {
            this.particleData[i].position.set(Math.random() * 10, Math.random() * 10, Math.random() * 10);
            this.dummy.position.copy(this.particleData[i].position);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }

        scene.add(this.mesh)

        
    }

    createParticleAt(index){
        const data = this.particleData[index];
    
        // Set the initial position of the particle
        const position = new THREE.Vector3(
            Math.random() * 10,  // X position within range
            // Math.random() * 10,  // Y position within range
            9.99,
            Math.random() * 10   // Z position within range
        );

        data.position.copy(position);
        data.velocity.set(0, 0, 0); // Reset velocity
        data.acceleration.set(0, 0, 0); // Reset acceleration
        
        // Optionally, set initial values for gravity or other properties
        data.gravity.set(0, -0.5, 0); // Example gravity

        // Update the dummy object's position
        this.dummy.position.copy(data.position);
        this.dummy.updateMatrix();
        
        // Set the matrix for the instance at the specified index
        this.mesh.setMatrixAt(index, this.dummy.matrix);

        // Notify Three.js that the instance matrices have changed
        this.mesh.instanceMatrix.needsUpdate = true;
    }


    updateParticles(deltaTime) {
        const scalar = 0.5;
    
        for (let i = 0; i < this.count; i++) {
            const data = this.particleData[i];
    
            // Get the matrix for the current particle and extract its position
            this.mesh.getMatrixAt(i, this.dummy.matrix);
            data.position.setFromMatrixPosition(this.dummy.matrix);
    
            // Calculate the indices for the 3D array based on the position
            const xIndex = Math.floor(data.position.x);
            const yIndex = Math.floor(data.position.y);
            const zIndex = Math.floor(data.position.z);
    
            // Ensure indices are within bounds
            if (xIndex >= 0 && xIndex < 10 && yIndex >= 0 && yIndex < 10 && zIndex >= 0 && zIndex < 10) {
                // Retrieve the force from the 3D array at the given indices
                const force = this.array[xIndex][yIndex][zIndex].get(); // Assuming .get() returns a THREE.Vector3
                
                // Update the particle's acceleration by adding gravity and the force
                data.acceleration.copy(data.gravity).addScaledVector(force, scalar);
    
                // Integrate velocity with the updated acceleration
                data.velocity.addScaledVector(data.acceleration, deltaTime);
    
                // Integrate position with the updated velocity
                data.position.addScaledVector(data.velocity, deltaTime);
    
                // Update the matrix with the new position
                this.dummy.position.copy(data.position);
                this.dummy.updateMatrix();
                this.mesh.setMatrixAt(i, this.dummy.matrix);
            }
            else{
                this.createParticleAt(i)

            }
        }
    
        // Notify Three.js that the instance matrices have changed
        this.mesh.instanceMatrix.needsUpdate = true;
    }
    


}



class MovingParticle{
    constructor(x,y,z,childrenCount){
        this.particleCount = childrenCount;
        this.parentPosition = new THREE.Vector3(x, y, z);
        this.deltaVelocity=false
        // this.previousPosition = this.parentPosition.clone();

        this.parentParticle = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xff0000 }) // Parent particle color
        );
        this.parentParticle.position.copy(this.parentPosition);
        scene.add(this.parentParticle);

        const geometry = new THREE.SphereGeometry(0.3, 8, 8); // Small spheres for particles
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff, 
            transparent: true, 
            opacity: 1.0
        });

        this.particleMesh = new THREE.InstancedMesh(geometry, material, this.particleCount);


        // this.particleData = [];
        // for (let i = 0; i < this.particleCount; i++) {
        //     particleData.push({
        //         position: new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5),
        //         velocity: new THREE.Vector3(),
        //         lifeTime: 0, // To manage fading out
        //         maxLifeTime: Math.random() * 5 + 5, // Random lifespan
        //     });
        // }
        this.particleData = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particleData.push({
                // Position each child particle relative to the parent position
                position: this.parentPosition.clone().add(new THREE.Vector3(
                    Math.random() * 2 - 1, // X offset from parent
                    Math.random() * 2 - 1, // Y offset from parent
                    Math.random() * 2 - 1  // Z offset from parent
                )),
                velocity: new THREE.Vector3(), // Initial velocity
                lifeTime: 0, // To manage fading out
                maxLifeTime: Math.random() * 15 , // Random lifespan,
                scale:1.0
            });
        }

        // Set the initial matrix for each instance
        this.dummy = new THREE.Object3D();
        for (let i = 0; i < this.particleCount; i++) {
            this.dummy.position.copy(this.particleData[i].position);
            this.dummy.scale.set(1, 1, 1);
            this.dummy.updateMatrix();
            this.particleMesh.setMatrixAt(i, this.dummy.matrix);

        }

        scene.add(this.particleMesh); 


    }

    moveParent(x,y,z){
        this.parentParticle.position.x+=x
        this.parentParticle.position.y+=y
        this.parentParticle.position.z+=z
        // this.parentParticle.position.y+=0.01
        const newPosition= new THREE.Vector3(this.parentParticle.position.x,this.parentParticle.position.y,this.parentParticle.position.z)
        let resultantVector = new THREE.Vector3().subVectors(newPosition, this.parentPosition);
        // const resultantVector = new THREE.Vector3().subVectors(this.parentPosition,newPosition);
        // resultantVector = resultantVector.clone().negate();
        this.deltaVelocity=resultantVector
        this.parentPosition=newPosition
        // console.log(resultantVector)
    }

    updateParticles(deltaTime){
        for (let i = 0; i < this.particleCount; i++) {
            const data = this.particleData[i];
    
            // Update position based on velocity
            data.position.addScaledVector(data.velocity, deltaTime);
    
            // Increase lifetime
            data.lifeTime += deltaTime;
            // console.log(this.parentPosition)
            // Check if the particle is outside the bounding box or has exceeded its lifetime
            if ( data.lifeTime > data.maxLifeTime) {
                // Recycle particle
                // data.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
                data.position.set(this.parentPosition.x,this.parentPosition.y,this.parentPosition.z)
                // data.velocity.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
                if(this.deltaVelocity){
                    // console.log(this.deltaVelocity)
                    data.velocity.set(25*this.deltaVelocity.x+Math.random()-.5,25*this.deltaVelocity.y+Math.random()-.5,25*this.deltaVelocity.z+Math.random()-.5)
                }
                else{
                    // console.log('hi')
                    data.velocity.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
                }
                data.lifeTime = 0;
            }
    
            // Update the instance matrix
            const dummy = new THREE.Object3D();
            dummy.position.copy(data.position);

            const ageRatio = data.lifeTime / data.maxLifeTime;
            const newScale = 1.0 * (1.0 - ageRatio); // Scale reduces linearly over time
            dummy.scale.set(newScale, newScale, newScale);
    
            // Apply fading
            const opacity = 1 - data.lifeTime / data.maxLifeTime;
            this.particleMesh.setColorAt(i, new THREE.Color(1, 1, 1).multiplyScalar(opacity));
    
            dummy.updateMatrix();
            this.particleMesh.setMatrixAt(i, dummy.matrix);
        }
        // console.log(this.particleMesh)
        this.particleMesh.instanceMatrix.needsUpdate = true;
        this.particleMesh.instanceColor.needsUpdate = true;

    }


}


function windMouse3D2(startX, startY, startZ, endX, endY, endZ, G_0=6, W_0=12, M_0=15, D_0=12, stepSize=0.001) {
    const points = [];
    let currentX = startX, currentY = startY, currentZ = startZ;
    let vX = 0, vY = 0, vZ = 0;
    let W_X = 0, W_Y = 0, W_Z = 0;
    
    const distToEnd = (x1, y1, z1, x2, y2, z2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);

    while (distToEnd(currentX, currentY, currentZ, endX, endY, endZ) > stepSize) {
        const dist = distToEnd(currentX, currentY, currentZ, endX, endY, endZ);
        const W_mag = Math.min(W_0, dist);

        if (dist >= D_0) {
            W_X = W_X / Math.sqrt(3) + (2 * Math.random() - 1) * W_mag / Math.sqrt(5);
            W_Y = W_Y / Math.sqrt(3) + (2 * Math.random() - 1) * W_mag / Math.sqrt(5);
            W_Z = W_Z / Math.sqrt(3) + (2 * Math.random() - 1) * W_mag / Math.sqrt(5);
        } else {
            W_X /= Math.sqrt(3);
            W_Y /= Math.sqrt(3);
            W_Z /= Math.sqrt(3);
            if (M_0 < 3) {
                M_0 = Math.random() * 3 + 3;
            } else {
                M_0 /= Math.sqrt(5);
            }
        }

        const dirX = endX - currentX;
        const dirY = endY - currentY;
        const dirZ = endZ - currentZ;
        const dirMag = Math.sqrt(dirX ** 2 + dirY ** 2 + dirZ ** 2);
        
        const normDirX = dirX / dirMag;
        const normDirY = dirY / dirMag;
        const normDirZ = dirZ / dirMag;

        vX += W_X + G_0 * normDirX;
        vY += W_Y + G_0 * normDirY;
        vZ += W_Z + G_0 * normDirZ;
        
        const vMag = Math.sqrt(vX ** 2 + vY ** 2 + vZ ** 2);
        if (vMag > M_0) {
            const vClip = M_0 / 2 + Math.random() * M_0 / 2;
            vX = (vX / vMag) * vClip;
            vY = (vY / vMag) * vClip;
            vZ = (vZ / vMag) * vClip;
        }

        currentX += vX * stepSize;
        currentY += vY * stepSize;
        currentZ += vZ * stepSize;

        points.push(new THREE.Vector3(currentX, currentY, currentZ));
    }

    points.push(new THREE.Vector3(endX, endY, endZ)); // Ensure the endpoint is added

    return points;
}





// let a=new ParticleSystem(10000)
let b=new MovingParticle(5,5,5,5000)



camera.position.z = 15;
camera.position.x=10
camera.position.y=10

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.05;
controls.enableZoom = true; // Allow zooming

const clock = new THREE.Clock();

let index=0


class Rocket {
    constructor(startPosition, targetPosition, height, object) {
        this.position = startPosition.clone();


        this.MovingParticle=object


        this.targetPosition = targetPosition.clone();
        this.height = height;

        // Calculate the base velocity vector
        this.velocity = new THREE.Vector3().subVectors(this.targetPosition, this.position).normalize();
        this.totalDistance = this.position.distanceTo(this.targetPosition);

        // Track the elapsed time or distance traveled
        this.elapsedTime = 0;
        this.duration = 25; // Total time to reach the target
    }

    move(deltaTime) {
        // this.MovingParticle.moveParent()

        this.elapsedTime += deltaTime;

        // Calculate the progress as a percentage of the total duration
        const t = this.elapsedTime / this.duration;

        // Basic parabolic height adjustment
        const parabolicFactor = 4 * this.height * t * (1 - t);

        // Add parabolic movement
        const dx= this.velocity.x * deltaTime;
        const dz= this.velocity.z * deltaTime;
        const dy =parabolicFactor;

        // Adding variation
        const variationMagnitude = 0.01;
        // this.position.x +=
        const dx1 = (Math.random() - 0.5) * variationMagnitude;
        const dy1 =  (Math.random() - 0.5) * variationMagnitude;
        const dz1 = (Math.random() - 0.5) * variationMagnitude;

        this.position.x+dx+dx1
        this.position.y+=dy+dy1
        this.position.z+=dz+dz1
        console.log(this.position)

        this.MovingParticle.moveParent(dx+dx1,dy+dy1,dz+dz1)
        // Update the rocket's position in the scene
        // rocketMesh.position.copy(this.position);

        // Optional: Adjust rocket orientation to face the movement direction
        // rocketMesh.lookAt(this.targetPosition);
    }
}

let c=new Rocket(new THREE.Vector3(0,0,0),new THREE.Vector3(50,40,500),0.1,b)

const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const geometry = new THREE.TextGeometry('Hallo mate', {
        font: font,
        size: 1,
        height: 0.1,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.05,
        bevelOffset: 0,
        bevelSegments: 3
    });

    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const textMesh = new THREE.Mesh(geometry, material);
    scene.add(textMesh);

    // Center the text
    geometry.center();
});

function animate() {
    index++
    // console.log(index)

    // camera.position.x=path[index].x
    // camera.position.y=path[index].y
    // camera.position.z=path[index].z



    const deltaTime = clock.getDelta();



    // a.updateParticles(deltaTime)
    b.updateParticles(deltaTime)
    c.move(deltaTime)
    // if(index/1000){
    // b.moveParent(Math.sin(index/1000)/10,Math.sin(index/1000)/10,Math.sin(index/1000)/10)


    // camera.position.x=b.parentPosition.x+.8
    // camera.position.y=b.parentPosition.y+1
    // camera.position.z=b.parentPosition.z+1.5
    // console.log(b.parentParticle.position,'duo')
    controls.target.copy(b.parentParticle.position);
    controls.update();



	renderer.render( scene, camera );
    requestAnimationFrame(animate);


    
}

animate()




