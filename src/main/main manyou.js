import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// console.log(THREE);

// 创建场景

const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(-50, 1, 0);

// 添加物体
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

// 根据几何体和材质创建物体
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// 添加到场景
scene.add(cube);
console.log(cube)
cube.position.set(-10, 0, 10);

let curve;
// 线段
function createLine(){
    //创建样条曲线，作为运动轨迹
    curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(-30, 0, 0),
          new THREE.Vector3(-50, 0, 0),
          new THREE.Vector3(-80, 0, 0),
          new THREE.Vector3(-100, 0, 0),
          new THREE.Vector3(-120, 0, 0),
          new THREE.Vector3(-120, 0, -30),
          new THREE.Vector3(-120, 0, -60)
    ], true);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(5000));
    // 材质对象
    const material = new THREE.LineBasicMaterial({
      color: 'red',
    });
    // 线条模型对象
    const line = new THREE.Line(geometry, material);
    scene.add(line) // 线条对象添加到场景中
}
createLine();


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

let progress = 0;
function render() {
    requestAnimationFrame(render)
    // if (progress < 1-0.001) {
    //     const point = curve.getPointAt(progress);
    //     cube.position.copy(point) // 物体移动
    //     const pointBox = curve.getPointAt(progress + 0.001) //获取样条曲线指定点坐标
    //     //camera.position.set(point.x - 1, point.y + 1, point.z)
    //     camera.lookAt(pointBox.x - 1, pointBox.y + 1, pointBox.z)
        
    //     progress += 0.001;
    // }else {
    //     progress = 0
    // }
	if (progress <= 1 - 0.0008 * 20){
        const point = curve.getPointAt(progress) //获取样条曲线指定点坐标，作为相机的位置
        const pointBox = curve.getPointAt(progress + 0.0004 * 20) //获取样条曲线指定点坐标
        const pointBox2 = curve.getPointAt(progress + 0.0008 * 20) //获取样条曲线指定点坐标
        cube.position.copy(pointBox2) // 物体移动
        camera.position.set(point.x, point.y + 2, point.z)
        camera.lookAt(pointBox.x, pointBox.y + 2, pointBox.z)
        // controls.position0.set(point.x, point.y + 5, point.z) //非必要，场景有控件时才加上
        // controls.target.set(pointBox.x, pointBox.y + 5, pointBox.z) //非必要，场景有控件时才加上
        progress += 0.0004
    } else {
        progress = 0
    }
	renderer.render(scene, camera);
}

render();