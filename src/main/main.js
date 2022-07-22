import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import pointList from './pointList';
const TWEEN = require('@tweenjs/tween.js')


// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 10000);

camera.position.set(0, 2, 1000);
// camera.lookAt(scene.position);

// 创建坐标系
const helper = new THREE.AxesHelper(100);
scene.add(helper);
// 环境光
let light = new THREE.AmbientLight(0xadadad); // soft white light
scene.add(light);

// 平行光源
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1000, 1000, 0);
scene.add(directionalLight); 

// 创建地板
const planeGeo = new THREE.PlaneGeometry(900, 900);
const planeMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color('#333333'),
    side: THREE.DoubleSide
});
const planeMesh = new THREE.Mesh(planeGeo, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2;
scene.add(planeMesh);

function randWidth (width) {
    return Math.random() * width + 10;
}
// 楼宇扫描相关配置数据
const flowData = {
    boxSize: { // 建筑群包围盒的尺寸
        x: 600,
        y: 200,
        z: 600
    },
    flowConf: {
        x: 1, // 开关 1 表示开始
        y: 20, // 范围
        z: 60 // 速度
    },
    color: "#5588aa",  // 建筑颜色
    flowColor: "#BF3EFF", // 扫描颜色
    topColor: '#00FF00' // 顶部颜色
}

// 创建若干个建筑物
const buildCount = 50;
const group = new THREE.Group();
for (let i=0; i<buildCount; i++) {
    const x = randWidth(20);
    const y = randWidth(100);
    const z = randWidth(10);

    const boxGeometry = new THREE.BoxBufferGeometry(x, y ,z);
    const positionX = 300 - randWidth(600);
    const positionZ = 300 - randWidth(600);

    boxGeometry.translate(positionX,  y / 2 ,positionZ);

    const material = new THREE.MeshBasicMaterial( { color: 0x5588aa } );

    const mesh = new THREE.Mesh(boxGeometry, material);
    mesh.isBuild = true;
    group.add(mesh);
}
scene.add(group);


// 渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 轨道查看器
const controls = new OrbitControls(camera, renderer.domElement);

// 根据坐标数组转为点数组
let points = [];
for (let i = 0; i < pointList.length; i += 3) {
    points.push(new THREE.Vector3(
        pointList[i],
        pointList[i + 1],
        pointList[i + 2]
    ));
}
// 创建曲线
const curve = new THREE.CatmullRomCurve3( points, true,'catmullrom',0.1 );
const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(3000));
// 材质对象
const texture = new THREE.TextureLoader().load('./textures/road.jpg');
texture.wrapS = THREE.RepeatWrapping
texture.wrapT = THREE.RepeatWrapping
texture.repeat.set(4, 1); 
// const material = new THREE.MeshLambertMaterial({
//   // color: 0x0099ff,
//   map: texture,
//   // normalMap: normalTexture,
//   normalScale: new THREE.Vector2(5, 5)
// });
const material = new THREE.LineBasicMaterial({
    color: 'red',
});
// // 线条模型对象
 // 线条模型对象
 const line = new THREE.Line(geometry, material);
const mesh = new THREE.Mesh(geometry, material);
scene.add(line) // 线条对象添加到场景中
// const geometry = new THREE.PlaneGeometry( 900, 100 );
// const plane = new THREE.Mesh( geometry, material );
// plane.position.set(0, 1, 450);
// plane.rotation.x = -Math.PI / 2;

// scene.add( plane );


// let time = 0;
// function moveCamera () {
//     // 把曲线分割成2999段， 可以得到3000个点
//     let points = curve.getPoints(3000);
//     // 更新取点索引
//     time += 1.5;
//     // 相机所在点索引
//     const index1 = time % 3000;
//     // 前方机器人所在位置点的索引
//     const index2 = (time + 50) % 3000;
//     // 根据索引取点
//     let point = points[index1];
//     let point1 = points[index2];
//     // 修改相机和模型位置
//     if(point&&point.x){
//         if (carModel) {
//             carModel.position.set(point1.x, point1.y, point1.z);
//             carModel.lookAt(point.x, point.y, point.z);
//         }
//         camera.position.set(point.x, 5, point.z);
//         camera.lookAt(point1.x, 5, point1.z);
//     }
// } 
let progress = 0;
function moveCamera() {
    if (progress <= 1 - 0.0004 * 20){
        const point = curve.getPointAt(progress) //获取样条曲线指定点坐标，作为相机的位置
        const pointBox = curve.getPointAt(progress + 0.0004 * 20) //获取样条曲线指定点坐标
        if (carModel) {
            carModel.position.set(pointBox.x, pointBox.y, pointBox.z);
            carModel.lookAt(point.x, point.y, point.z);
        }
        camera.position.set(point.x,  point.y + 15, point.z)
        camera.lookAt(pointBox.x, pointBox.y + 5, pointBox.z)
        // controls.position0.set(point.x, point.y + 5, point.z) //非必要，场景有控件时才加上
        // controls.target.set(pointBox.x, pointBox.y + 5, pointBox.z) //非必要，场景有控件时才加上
        progress += 0.0004
    } else {
        progress = 0
    }
}

// Car
// materials
const wheels = [];
let carModel;
const bodyMaterial = new THREE.MeshPhysicalMaterial( {
    color: 0xff0000, metalness: 1.0, roughness: 0.5, clearcoat: 1.0, clearcoatRoughness: 0.03, sheen: 0.5
} );

const detailsMaterial = new THREE.MeshStandardMaterial( {
    color: 0xffffff, metalness: 1.0, roughness: 0.5
} );

const glassMaterial = new THREE.MeshPhysicalMaterial( {
    color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1.0
} );

const shadow = new THREE.TextureLoader().load( './textures/ferrari_ao.png' );

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( './gltf/' );

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

loader.load( './models/ferrari.glb', function ( gltf ) {

    carModel = gltf.scene.children[ 0 ];
    gltf.scene.children[ 0 ].position.set( -1.6721884850946012, -1.368973127897772e-13, 360.53068686806284);
    gltf.scene.children[ 0 ].scale.set(4, 4, 4);

    carModel.getObjectByName( 'body' ).material = bodyMaterial;

    carModel.getObjectByName( 'rim_fl' ).material = detailsMaterial;
    carModel.getObjectByName( 'rim_fr' ).material = detailsMaterial;
    carModel.getObjectByName( 'rim_rr' ).material = detailsMaterial;
    carModel.getObjectByName( 'rim_rl' ).material = detailsMaterial;
    carModel.getObjectByName( 'trim' ).material = detailsMaterial;

    carModel.getObjectByName( 'glass' ).material = glassMaterial;

    wheels.push(
        carModel.getObjectByName( 'wheel_fl' ),
        carModel.getObjectByName( 'wheel_fr' ),
        carModel.getObjectByName( 'wheel_rl' ),
        carModel.getObjectByName( 'wheel_rr' )
    );

    // shadow
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry( 0.655 * 4, 1.3 * 4 ),
        new THREE.MeshBasicMaterial( {
            map: shadow, blending: THREE.MultiplyBlending, toneMapped: false, transparent: true
        } )
    );
    mesh.rotation.x = - Math.PI / 2;
    mesh.renderOrder = 2;
    carModel.add( mesh );
    carModel.rotation.y = - Math.PI / 2;

    scene.add( carModel );

} );


function render() {
    moveCamera();
    const time2 = - performance.now() / 1000;

    for ( let i = 0; i < wheels.length; i ++ ) {

	   wheels[ i ].rotation.x = time2 * Math.PI * 2;

	}
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();


addClick();
function addClick () {
    const raycaster = new THREE.Raycaster();//光线投射，用于确定鼠标点击位置
    const mouse = new THREE.Vector2();//创建二维平面
    window.addEventListener("mousedown",mousedown);//页面绑定鼠标点击事件
    //点击方法
    function mousedown(e){
        //将html坐标系转化为webgl坐标系，并确定鼠标点击位置
        mouse.x =  e.clientX / renderer.domElement.clientWidth*2-1;
        mouse.y =  -(e.clientY / renderer.domElement.clientHeight*2)+1;
        //以camera为z坐标，确定所点击物体的3D空间位置
        raycaster.setFromCamera(mouse,camera);
        //确定所点击位置上的物体数量
        const intersects = raycaster.intersectObjects(scene.children);
        //选中后进行的操作
        if(intersects.length){
            const selected = intersects[0];//取第一个物体
            console.log(`${selected.point.x}, ${selected.point.y}, ${selected.point.z},`);
        }
    }
}