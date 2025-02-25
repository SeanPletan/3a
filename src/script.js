import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import CANNON from 'cannon'

/**
 * Debug
 */
const gui = new GUI()
const debugObject = {}
debugObject.reset = () =>
    {
        //console.log('reset')
        for(const object of objectsToUpdate)
            {
                // Remove body
                //object.body.removeEventListener('collide', playHitSound)
                world.removeBody(object.body)
        
                // Remove mesh
                scene.remove(object.mesh)
            }
            objectsToUpdate.splice(0, objectsToUpdate.length)
    }
    gui.add(debugObject, 'reset')



/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Physics
 */
const world = new CANNON.World()
world.gravity.set(0, - 9.82, 0)

const concrete = new CANNON.Material('concrete')
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    concrete,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.defaultContactMaterial = defaultContactMaterial
// const sphereShape = new CANNON.Sphere(0.5)
// const sphereBody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(0,3,0,),
//     shape: sphereShape
// })
// world.addBody(sphereBody)
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.material = concrete
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)
world.broadphase = new CANNON.SAPBroadphase(world)
world.addContactMaterial(defaultContactMaterial)
world.allowSleep = true
/**
 * Sounds
 */
// const hitSound = new Audio('/sounds/hit.mp3')

// const playHitSound = (collision) =>
// {   console.log(collision.contact.getImpactVelocityAlongNormal())

//     const impactStrength = collision.contact.getImpactVelocityAlongNormal()

//     if(impactStrength > 5)
//     {
//         hitSound.volume = Math.random()// * impactStrength
//         hitSound.currentTime = 0
//         hitSound.play()
//     }
// }




/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/**
 * Utils
 */





/**
 * Test sphere
 */
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5, 32, 32),
//     new THREE.MeshStandardMaterial({
//         metalness: 0.3,
//         roughness: 0.4,
//         envMap: environmentMapTexture,
//         envMapIntensity: 0.5
//     })
// )
// sphere.castShadow = true
// sphere.position.y = 0.5
// scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
        color: '#680000',
        side: THREE.DoubleSide,
        metalness: 0,
        roughness: 0.6,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)
/**
 * Sphere
 */
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 1,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
})
/**
 * Box
 */
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
})


/**
 * Adding Sphere
 */
const objectsToUpdate = []
const createSphere = (radius, position) =>
    {
        // Three.js mesh
        const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
        mesh.castShadow = true
        mesh.scale.set(radius, radius, radius)
        mesh.position.copy(position)
        scene.add(mesh)
        // Cannon.js body
        const shape = new CANNON.Sphere(radius)

        const body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 3, 0),
            shape: shape,
            material: defaultMaterial
        })
        body.position.copy(position)
        world.addBody(body)
    

        objectsToUpdate.push({
            mesh: mesh,
            body: body
        })
        // body.addEventListener('collide', playHitSound)
    }

debugObject.createSphere = () =>
{
    for (let i = 0; i < 50; i++)
    {
        let rand = Math.random()
        createSphere(Math.random() * 0.5, 
        {   
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10 + 10,
            z: (Math.random() - 0.5) * 10
        }
    )
    }

}
gui.add(debugObject, 'createSphere').name("make Balls")
/**
 * Adding Boxes
 */
const createBox = (width, height, depth, position) =>
    {
        //Three.js mesh
        const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
        mesh.scale.set(width, height, depth)
        mesh.castShadow = true
        mesh.position.copy(position)
        scene.add(mesh)

        //Cannon.js body
        const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))
        const body = new CANNON.Body({
            mass: 3,
            position: new CANNON.Vec3(0, 3, 0),
            shape: shape
        })
        body.position.copy(position)
        world.addBody(body)

        //Save in objects
        objectsToUpdate.push({
            mesh: mesh,
            body: body
        })

        // body.addEventListener('collide', playHitSound)
    }
debugObject.createBox = () =>
{
    for (let i = 0; i < 50; i++)
    {
        createBox(
            Math.random() * 2,
            Math.random() * 2,
            Math.random(),
            {
                x: (Math.random() - 0.5) * 20,
                y: (Math.random() - 0.5) * 10 + 10,
                z: (Math.random() - 0.5) * 20
            }
        )
    }
}
gui.add(debugObject, 'createBox').name("make Walls")


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 30
directionalLight.shadow.camera.left = - 20
directionalLight.shadow.camera.top = 20
directionalLight.shadow.camera.right = 20
directionalLight.shadow.camera.bottom = - 20
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(- 10, 10, 10)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    //Update Physics
    //sphereBody.applyLocalForce(new CANNON.Vec3(1, 0, 0), new CANNON.Vec3(0, 0, 0))
    world.step(1 / 60, deltaTime, 3)

    for (const object of objectsToUpdate)
    {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }
    //console.log(sphereBody.position.y)
    // sphere.position.x = sphereBody.position.x
    // sphere.position.y = sphereBody.position.y
    // sphere.position.z = sphereBody.position.z
    //sphere.position.copy(sphereBody.position)
}

tick()




setTimeout(() => {
    const textElement = document.getElementById('hint');
    textElement.style.opacity = 0; // Set opacity to 0 (fully transparent)
  }, 3000); // 5000 milliseconds = 5 seconds