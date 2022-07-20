import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// console.log(THREE);

// 创建场景

const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(0, 0, 10);

// 添加物体
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

// 根据几何体和材质创建物体
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// 添加到场景
scene.add(cube);
console.log(cube)
cube.position.x = 5;
cube.scale.x = 1;

// 添加坐标轴
const helper = new THREE.AxesHelper(5);
scene.add(helper);

// 渲染器
const renderer = new THREE.WebGLRenderer();
// console.log(renderer);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 轨道查看器
const controls = new OrbitControls(camera, renderer.domElement);

function render() {
    cube.position.x += 0.01;
    cube.position.y += 0.01;
    cube.position.z += 0.01;
    //cube.scale.x += .01;
    if (cube.position.x > 5) {
        cube.position.x = 0;
    }
    if (cube.position.y > 5) {
        cube.position.y = 0;
    }
    if (cube.position.z > 5) {
        cube.position.z = 0;
    }
    if (cube.scale.x > 5) {
        cube.scale.x = 0;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render)
}

render();