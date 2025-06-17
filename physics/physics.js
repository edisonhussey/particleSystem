// 0 = player
// 1 = enemy
// 2 = bullet_player
// 3 = bullet_enemy 

//objects have velocity, position, acceleration

class Physics_Engine
    {

    constructor(scene, camera, enemy_model_template, enemy_missile_template) {
        this.objects=[];
        this.collision_distance = 0.1;
        this.scene = scene; // Reference to the scene for rendering or other purposes
        this.camera = camera; // Reference to the camera
        this.player= null; // Placeholder for player object
        this.object_limit = 300;
        this.enemy_bullet_speed = 8; // Speed of enemy bullets
        this.enemy_model_template = enemy_model_template; // Template for enemy model, if needed
        this.enemy_missile_template = enemy_missile_template; // Template for enemy missile model
        this.boundary = 70; // Boundary for out-of-bounds check
        this.enemy_bullet_acceleration = 2; // Acceleration for enemy bullets
    }

    addObject(object){
        this.objects.push(object);
        this.scene.add(object); // Add the object to the scene for rendering
    }


    init(player){
        this.player = player; // Set the player object
        this.addObject(player); // Add player to the physics engine
    }

    adjust_all_angles(){
       

        for (let i = 0; i < this.objects.length; i++) {

        

            const object = this.objects[i];


            if(object.type === 3 || object.type === 0){ // If the object is a bullet
             



                    const velocity = object.velocity.clone().normalize();
                    const targetPosition = new THREE.Vector3().copy(object.position).add(velocity);

                    // Temporarily look at target
                    object.lookAt(targetPosition);

                    // Apply correction to align model's +X with Three.js's +Z
                    object.rotateY(-Math.PI / 2);

                    // this.camera.position.copy(object.position); // Update camera position to match the bullet


               }
            else{
            

            // Calculate target position based on velocity
            const targetPosition = new THREE.Vector3().copy(object.position).add(object.velocity);

            // Make the object look at the target position
            object.lookAt(targetPosition);
            }
            
        }


    }
    //needs to edit
    random_enemy_decision(){
        for (let i=0;i<this.objects.length;i++){
            if (Math.random()>0.01) continue;

            if( this.objects[i].type === 1 ){ // Assuming type 1 is enemy
                const enemy = this.objects[i];

                enemy.acceleration.x += (Math.random() * 0.8 - 0.4) * 2; // Random x acceleration
                enemy.acceleration.y += (Math.random() * 0.8 - 0.4) * 2; // Random y acceleration
                enemy.acceleration.z += (Math.random() * 0.8 - 0.4) * 2; // Random z acceleration
                // Randomly decide to move or shoot
               
                if (Math.random() >0.2) continue;

                if (this.objects.length < this.object_limit && enemy.velocity.length() > 0) { // Limit the number of bullets

                    const enemy_missile = this.enemy_missile_template.clone(); // Clone the enemy missile model

                    enemy_missile.position.copy(enemy.position);

                    let direction = new THREE.Vector3();
                    direction.copy(enemy.velocity).normalize(); // Aim at player velocity

                    enemy_missile.acceleration = new THREE.Vector3();
                    enemy_missile.acceleration = direction.multiplyScalar(this.enemy_bullet_acceleration);

                    enemy_missile.velocity = new THREE.Vector3(); // Reset velocity
                    enemy_missile.velocity = enemy.velocity.clone();

                    enemy_missile.damage = 10; // Example damage value
                    enemy_missile.type = 3; // Bullet type for enemy

                    this.addObject(enemy_missile); // Add missile to the physics engine
                    console.log(enemy_missile);

                }
            }
        }
    }

    //edited
    create_random_enemy(){

        if (Math.random()>0.1 || this.objects.length >= this.object_limit) return; // Limit the number of enemies

        const enemy_clone = this.enemy_model_template.clone(); // Clone the enemy spaceship model
        enemy_clone.position.set(Math.random() * this.boundary - this.boundary/2, Math.random() * this.boundary - this.boundary/2, Math.random() * this.boundary - this.boundary/2); // Random position within the boundary
        enemy_clone.velocity = new THREE.Vector3(0, 0, 0); // Initial velocity
        enemy_clone.acceleration = new THREE.Vector3(Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, Math.random()*0.2 -0.1); // Initial acceleration

        enemy_clone.health = 50; // Example health value
        enemy_clone.type = 1; // Enemy type
        this.addObject(enemy_clone); // Add enemy to the physics engine

    };


    flag_out_of_bounds(){
        for (let i = 0; i < this.objects.length; i++) {
            const object = this.objects[i];
            if (object.type === 0) continue; // Skip objects already marked for removal
            // Check if the object is out of bounds
            if (object.position.x < -this.boundary || object.position.x > this.boundary ||
                object.position.y < -this.boundary || object.position.y > this.boundary ||
                object.position.z < -this.boundary || object.position.z > this.boundary) {
                object.type = -1; // Mark the object for removal
            }
        }
    }


    update(deltaTime){
        this.create_random_enemy(); // Randomly create enemies
        this.random_enemy_decision(); // Randomly decide enemy actions
        this.handle_collisions(); // Check for collisions and resolve them
        this.flag_out_of_bounds(); // Check for objects out of bounds
        this.remove_objects(); // Remove objects marked for deletion
        this.update_velocities(deltaTime); // Update velocities of all objects
        this.update_positions(deltaTime); // Update positions of all objects
        this.adjust_all_angles(); // Adjust angles of all objects based on their velocities
    }

    update_velocities(deltaTime){

        for (let i = 0; i < this.objects.length; i++) {
            if(!this.objects[i].acceleration.x) console.log(this.objects[i]);

            // if (this.objects[i].type === 0) continue; // Skip objects already marked for removal
            // console.log(this.objects[i].type);
            const object = this.objects[i];
            // Update velocity based on acceleration and deltaTime
            object.velocity.x += object.acceleration.x * deltaTime;
            object.velocity.y += object.acceleration.y * deltaTime;
            object.velocity.z += object.acceleration.z * deltaTime;

            // Optionally, you can add bounds checking or other logic here
        }
    };


    //needs to edit
    update_positions(deltaTime){

        for (let i = 0; i < this.objects.length; i++) {
            // console.log(this.objects[i]);
            const object = this.objects[i];
            // Update position based on velocity and deltaTime
            object.position.x += object.velocity.x * deltaTime;
            object.position.y += object.velocity.y * deltaTime;
            object.position.z += object.velocity.z * deltaTime;

            // Optionally, you can add bounds checking or other logic here
        }
    }



    // 0 = player
    // 1 = enemy
    // 2 = bullet_player
    // 3 = bullet_enemy 

    remove_objects(){
        for (let i = 0; i < this.objects.length; i++) {
            const object = this.objects[i];
            if (object.type === -1) {
                this.objects.splice(i, 1);
                this.scene.remove(object);
                i--; // Adjust index after removal
            }
        }
    }

    resolve_collision(objA, objB){
        // Simple collision resolution: reverse velocities
        let type_multiplication = objA.type * objB.type;
        

        if (type_multiplication === 0) {
            // Player vs Enemy
            if( objA.type==0 && objB.type==3){
                objA.health -= objB.damage; // Player takes damage from bullet
                if (objA.health <= 0) {
                    objA.type = -1; // Mark player as removed
                }
                objB.type = -1; // Mark bullet as removed

            } else if (objA.type == 3 && objB.type == 0) {
                objB.health -= objA.damage; // Enemy takes damage from player
                if (objB.health <= 0) {
                    objB.type = -1; // Mark enemy as removed
                }
                objA.type=-1; // Mark player as removed
            }

        } else if (type_multiplication === 2) {
            // Bullet vs Player
            // objA.velocity.multiplyScalar(-1);
        } else if (type_multiplication === 3) {
            // Bullet vs Enemy
            // objB.velocity.multiplyScalar(-1);
        } 

        // Optionally, apply damage or other effects
       
    }

    handle_collisions(){
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++){

                const objA = this.objects[i];
                const objB = this.objects[j];
                const distance = objA.position.distanceTo(objB.position);
                if (distance < this.collision_distance) {
                    this.resolve_collision(objA, objB);
                }


            }
        }

    }

}





export default Physics_Engine;

