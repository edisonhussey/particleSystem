if (keys['a']) player.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationSpeed);
    if (keys['d']) player.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotationSpeed);
    if (keys['w']) player.rotateOnAxis(new THREE.Vector3(0, 0, 1), rotationSpeed);
    if (keys['s']) player.rotateOnAxis(new THREE.Vector3(0, 0, 1), -rotationSpeed);
    if (keys['q']) player.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotationSpeed);
    if (keys['e']) player.rotateOnAxis(new THREE.Vector3(1, 0, 0), -rotationSpeed);

    // --- THRUST / STRAFE (local axes) ---
    if (keys['Space']) {
        const forward = new THREE.Vector3(1, 0, 0).applyQuaternion(player.quaternion);
        player.velocity.add(forward.multiplyScalar(thrust));
    }
    if (keys['ArrowLeft']) {
        const left = new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion);
        player.acceleration.add(left.multiplyScalar(strafe));
    }
    if (keys['ArrowRight']) {
        const right = new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion);
        player.velocity.add(right.multiplyScalar(strafe));
    }
    if (keys['ArrowUp']) {
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(player.quaternion);
        player.velocity.add(up.multiplyScalar(vertical));
    }
    if (keys['ArrowDown']) {
        const down = new THREE.Vector3(0, -1, 0).applyQuaternion(player.quaternion);
        player.velocity.add(down.multiplyScalar(vertical));
    }