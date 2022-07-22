import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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

// 顶点着色器
const vertexShader = `
    // 向片元着色器传递顶点位置数据
    varying vec3 v_position;
    void main () {
        v_position = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
// 片元着色器
const fragmentShader = `
    // 接收顶点着色器传递的顶点位置数据
    varying vec3 v_position;

    // 接收js传入的值
    uniform float u_time;
    uniform vec3 u_size;
    uniform vec3 u_flow;
    uniform vec3 u_color;
    uniform vec3 u_flowColor;
    uniform vec3 u_topColor;

    uniform float u_selected;

    #define PI 3.14159265359
    void main () {
        // 给建筑设置从上到下的渐变颜色
        float indexPct = v_position.y / u_size.y;
        vec3 color = mix(u_color, u_topColor,indexPct);
        // 根据时间和速度计算出当前扫描点的位置， 以上顶点为准
        float flowTop = mod(u_flow.z * u_time, u_size.y);
        // 判断当前点是否在扫描范围内
        if (flowTop > v_position.y && flowTop - u_flow.y < v_position.y) {
            // 扫描范围内的位置设置从上到下的渐变颜色
            float flowPct = (u_flow.y - ( flowTop -  v_position.y)) / u_flow.y;
            color = mix(color ,u_flowColor, flowPct);
        }
        // 如果被选中
        if (u_selected > 0.5) {
            float selectPct = fract(sin(u_time * PI )) * 0.8;
            color = mix(color ,vec3(1.0, 1.0, .0), selectPct);
        }
        gl_FragColor = vec4(color, 1.0);
    }
`;
let ratio = {
    value: 0
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


let next = 0;
function render() {
    requestAnimationFrame(render);
    TWEEN.update();
    next += 0.01;
    ratio.value = next;
    renderer.render(scene, camera);
}
render();

const p1 = {
    x: 0,
    y: 2,
    z: 1000,
}
/************ tween动画 **************/
function cameraMove(position, time) {
    const tween1 = new TWEEN.Tween(p1).to(position, time).easing(TWEEN.Easing.Quadratic.InOut)
    tween1.onUpdate(() => {
      camera.position.set(p1.x, p1.y, p1.z)
      camera.lookAt(0, 0, 0)
    });
    return tween1;
}

function action() {
    const tweena = cameraMove({ x: 20, y: 100, z: 100 }, 4000);
    const tweenb = cameraMove({ x: 500, y: 150, z: -100 }, 9000);
    tweena.chain(tweenb);
    tweena.start();
}

document.getElementById('btn').addEventListener('click', action);

addClick();
function addClick () {
    var raycaster = new THREE.Raycaster();//光线投射，用于确定鼠标点击位置
    var mouse = new THREE.Vector2();//创建二维平面
    window.addEventListener("mousedown",mousedown);//页面绑定鼠标点击事件
    //点击方法
    function mousedown(e){
        //将html坐标系转化为webgl坐标系，并确定鼠标点击位置
        mouse.x =  e.clientX / renderer.domElement.clientWidth*2-1;
        mouse.y =  -(e.clientY / renderer.domElement.clientHeight*2)+1;
        //以camera为z坐标，确定所点击物体的3D空间位置
        raycaster.setFromCamera(mouse,camera);
        //确定所点击位置上的物体数量
        var intersects = raycaster.intersectObjects(scene.children);
        //选中后进行的操作
        if(intersects.length){
            if (intersects[0].object.isBuild) {
                intersects[0].object.material.color.set(0xffffff);
            }
        }
    }
}
let selectedMeshArr = null;
function setSelected (obj) {
// 判断选中的对象是否是建筑块儿，如果是则修改其uniforms中的u_selected值
    if (obj.isBuild) {
        obj.material.uniforms.u_selected.value = 1;
        if (selectedMeshArr) {
            // 清除历史选中
            selectedMeshArr.material.uniforms.u_selected.value = 0;
        }
        selectedMeshArr = obj;
    }
}