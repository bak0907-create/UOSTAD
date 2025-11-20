// 1. 기본 설정
const container = document.getElementById('viewer-container');
let scene, camera, renderer, controls;
const stlFilePath = './models/your_model.stl'; // ⚠️ STL 파일 경로를 여기에 맞게 수정하세요!

function init() {
    // 씬(Scene) 생성
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0); // 배경색

    // 카메라(Camera) 설정 (원근 투영 카메라)
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, 0, 50); // 초기 카메라 위치

    // 렌더러(Renderer) 설정
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 조명(Lighting) 설정
    // 주변광(AmbientLight): 전체적으로 은은한 빛
    scene.add(new THREE.AmbientLight(0x666666));
    
    // 방향광(DirectionalLight): 특정 방향에서 비추는 빛
    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(100, 100, 100);
    scene.add(light);
    
    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-100, -100, -100);
    scene.add(light2);

    // OrbitControls 설정 (마우스 상호작용)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 부드러운 움직임

    // 윈도우 크기 변경 시 렌더러와 카메라 업데이트
    window.addEventListener('resize', onWindowResize, false);

    // STL 파일 로드
    loadSTLModel();
}

function onWindowResize() {
    // 렌더러 크기 업데이트
    renderer.setSize(container.clientWidth, container.clientHeight);
    
    // 카메라 종횡비 업데이트
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
}

function loadSTLModel() {
    const loader = new THREE.STLLoader();

    // 로딩 시작
    loader.load(
        stlFilePath,
        function (geometry) {
            // 로드 성공 시
            
            // 모델의 재질(Material) 설정
            const material = new THREE.MeshPhongMaterial({
                color: 0xAAAAAA,
                specular: 0x444444, // 반사광 색상
                shininess: 30,      // 광택 정도
            });

            // 메시(Mesh) 생성: 지오메트리 + 재질
            const mesh = new THREE.Mesh(geometry, material);
            
            // 씬에 모델 추가
            scene.add(mesh);

            // 모델을 화면 중앙에 배치
            const bbox = new THREE.Box3().setFromObject(mesh);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            
            mesh.position.sub(center); // 모델의 중심을 씬의 (0,0,0)으로 이동
            
            // 카메라가 모델을 잘 볼 수 있도록 위치 조정 (선택 사항)
            const size = bbox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const distance = maxDim / (2 * Math.tan(camera.fov * Math.PI / 360));
            camera.position.z = distance * 1.5; // 모델 크기에 비례하여 카메라 위치 설정
            controls.update();
        },
        function (xhr) {
            // 로딩 중 진행 상황
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            // 로드 실패 시
            console.error('An error happened', error);
        }
    );
}

// 렌더링 루프 (애니메이션)
function animate() {
    requestAnimationFrame(animate);

    // 컨트롤 업데이트 (부드러운 움직임을 위해 필요)
    controls.update();

    renderer.render(scene, camera);
}

// 애플리케이션 시작
init();
animate();
