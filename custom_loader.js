// const loader = new THREE.GLTFLoader();

function load_building(scene, path, loader){
    loader.load(
    path,
    function (gltf) {
        const model = gltf.scene;
        const scale = 200;
        model.scale.set(scale, scale, scale); // Adjust scale as needed
        scene.add(model);
    },
    undefined,
    function (error) {
        console.error('Error loading model:', error);
    }
    );
}

function load_enemy_spaceship( path, loader, onLoad){
    loader.load(
        path,
        function (gltf) {
            const model = gltf.scene;
            const scale = 5; // Adjust scale as needed
            model.scale.set(scale, scale, scale);
            console.log('Enemy spaceship model loaded:', model);
            // return model;
            if (onLoad) onLoad(model); // Call the callback with the loaded model

        },
        undefined,
        function (error) {
            console.error('Error loading enemy spaceship model:', error);
        }
    );
}

function create_enemy_spaceship(exists) {
  if (!exists) {
    console.warn('Model not loaded yet!');
    return null;
  }
  // Clone the model (deep clone)
  const clone = exists.clone(true); // true = recursive clone of children

  // Optional: Set position or other properties
  clone.position.set(Math.random()*10, 0, Math.random()*10);

//   scene.add(clone);
  return clone;
}


async function loadAllModels(loader) {
  try {


    const paths = [
      'assets/enemy_spaceship/scene.gltf',
    //   'assets/background/scene.gltf',
      // add more paths here
    ];

    // Create array of load promises
    const loadPromises = paths.map(path => loadModel(path, loader));

    // Await all

    model_list=[];
    const models = await Promise.all(loadPromises);

    // models is an array of loaded THREE.Object3D scenes
    models.forEach(model => {
      model.scale.set(5, 5, 5);
      model_list.push(model);
    //   return model_list;
    });

    console.log('All models loaded!');
    return model_list;
    // Now you can safely run code that depends on models
  } catch (err) {
    console.error('Error loading models:', err);
  }
}


export default { load_building, load_enemy_spaceship, create_enemy_spaceship, loadAllModels };