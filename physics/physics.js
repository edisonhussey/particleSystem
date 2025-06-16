// 0 = player
// 1 = enemy
// 2 = bullet_player
// 3 = bullet_enemy 

class Physics_Engine
    {

    constructor(scene, enemy_model_template, enemy_missile_template) {
        this.objects=[];
        this.collision_distance = 0.1;
        this.scene = scene; // Reference to the scene for rendering or other purposes
        this.player= null; // Placeholder for player object
        this.object_limit = 100;
        this.enemy_bullet_speed = 2; // Speed of enemy bullets
        this.enemy_model_template = enemy_model_template; // Template for enemy model, if needed
        this.enemy_missile_template = enemy_missile_template; // Template for enemy missile model
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
        // for (let i = 0; i < this.objects.length; i++) {
        //     const object = this.objects[i];
        //     if (object.type === 0) continue; // Skip player object
        //     // Adjust angles based on velocity
        //     object.rotation.x = Math.atan2(object.velocity.y, object.velocity.z);
        //     object.rotation.y = Math.atan2(object.velocity.x, object.velocity.z);
        //     object.rotation.z = Math.atan2(object.velocity.y, object.velocity.x);
        // }

        for (let i = 0; i < this.objects.length; i++) {

            // if (this.objects[i].type === 3){
            //     // console.log(this.objects[i].velocity);
            
            //     const targetPosition_ = new THREE.Vector3().copy(this.objects[i].position).add(this.objects[i].velocity);
            //     // this.objects[i].lookAt(targetPosition_);
            //     console.log(this.objects[i].position, targetPosition_);
            //     // console.log(targetPosition_);
            // } // Skip objects marked for removal

            const object = this.objects[i];
            if (object.type === 0) continue; // Skip player object

            if(object.type === 3 ){
                // const targetPosition_ = new THREE.Vector3().copy(object.position).add(object.velocity);
                // // console.log(object.position, targetPosition_);
                // object.children[0].lookAt(targetPosition_); // Assuming the first child is the mesh to rotate
                // object.lookAt(this.player.position); // Make the bullet look at the player

                // const velocity = object.velocity.clone().normalize();

                // // Original forward direction is velocity
                // const up = new THREE.Vector3(0, 1, 0); // Assuming Y-up world
                // const left = new THREE.Vector3().crossVectors(up, velocity).normalize(); // 90° rotated left

                // // Create a fake "look at" position 1 unit to the left of velocity
                // const offsetLookAt = new THREE.Vector3().copy(object.position).add(left);
                // object.lookAt(offsetLookAt); // Make the bullet look at the offset position






                    const velocity = object.velocity.clone().normalize();
                    const targetPosition = new THREE.Vector3().copy(object.position).add(velocity);

                    // Temporarily look at target
                    object.lookAt(targetPosition);

                    // Apply correction to align model's +X with Three.js's +Z
                    object.rotateY(-Math.PI / 2);


               }
            else{
                // If velocity is zero vector, skip rotation
            // if (object.velocity.lengthSq() === 0) continue;

            // Calculate target position based on velocity
            const targetPosition = new THREE.Vector3().copy(object.position).add(object.velocity);

            // Make the object look at the target position
            object.lookAt(targetPosition);
            }
            
        }


    }

    random_enemy_decision(){
        for (let i=0;i<this.objects.length;i++){
            if (Math.random()>0.01) continue;

            if( this.objects[i].type === 1 ){ // Assuming type 1 is enemy
                const enemy = this.objects[i];
                // Randomly decide to move or shoot
                if (Math.random() < 0.5) {
                    // Move randomly
                    enemy.velocity.x += (Math.random()*0.2 - 0.2) * 2; // Random x velocity
                    enemy.velocity.y += (Math.random()*0.2 - 0.2) * 2; // Random y velocity
                    enemy.velocity.z += (Math.random()*0.2 - 0.2) * 2; // Random z velocity
                    continue;

                 
                }
                else if (this.objects.length < this.object_limit) { // Limit the number of bullets
                  

                    const enemy_missile = this.enemy_missile_template.clone(); // Clone the enemy missile model
                    enemy_missile.position.copy(enemy.position);
                    const direction = new THREE.Vector3();
                    direction.subVectors(this.player.position, enemy.position).normalize(); // Aim at player


                    enemy_missile.velocity = direction.multiplyScalar(this.enemy_bullet_speed); // Set missile velocity towards player
                    enemy_missile.damage = 10; // Example damage value  

                    // enemy_missile.lookAt(this.player.position); // Make the missile face the player

                    enemy_missile.type = 3; // Bullet type for enemy
                    this.addObject(enemy_missile); // Add missile to the physics engine
                    console.log(enemy_missile);

                }
            }
        }
    }

    create_random_enemy(){
        //old code
        if (Math.random()>0.1 || this.objects.length >= this.object_limit) return; // Limit the number of enemies
        // const enemy = new THREE.Mesh(
        //     new THREE.BoxGeometry(0.5, 0.5, 0.5),
        //     new THREE.MeshBasicMaterial({ color: 0xff0000 })
        // );

        // enemy.position.set(Math.random() * 30 - 15, Math.random() * 30 - 15, Math.random() * 30 - 15);
        // enemy.velocity = new THREE.Vector3(0, 0, 0); // Initial velocity
        // enemy.health = 50; // Example health value
        // enemy.type = 1; // Enemy type
        // this.addObject(enemy); // Add enemy to the physics engine

        const enemy_clone = this.enemy_model_template.clone(); // Clone the enemy spaceship model
        enemy_clone.position.set(Math.random() * 30 - 15, Math.random() * 30 - 15, Math.random() * 30 - 15);
        enemy_clone.velocity = new THREE.Vector3(0, 0, 0); // Initial velocity
        enemy_clone.health = 50; // Example health value
        enemy_clone.type = 1; // Enemy type
        // this.scene.add(enemy_clone);
        this.addObject(enemy_clone); // Add enemy to the physics engine




    };

    // currently set to +-35 for all axes, can be adjusted
    flag_out_of_bounds(){
        for (let i = 0; i < this.objects.length; i++) {
            const object = this.objects[i];
            if (object.type === 0) continue; // Skip objects already marked for removal
            // Check if the object is out of bounds
            if (object.position.x < -35 || object.position.x > 35 ||
                object.position.y < -35 || object.position.y > 35 ||
                object.position.z < -35 || object.position.z > 35) {
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
        this.update_positions(deltaTime); // Update positions of all objects
        this.adjust_all_angles(); // Adjust angles of all objects based on their velocities
    }

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

    resolveCollision(objA, objB){
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
                    this.resolveCollision(objA, objB);
                }


            }
        }

    }

}





export default Physics_Engine;

