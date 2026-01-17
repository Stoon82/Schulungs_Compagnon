import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { RotateCcw, ZoomIn, ZoomOut, Maximize2, Loader } from 'lucide-react';

/**
 * Model Component - Loads and displays 3D model
 */
function Model({ url, autoRotate }) {
  const { scene } = useGLTF(url);
  const meshRef = useRef();

  useFrame(() => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return <primitive ref={meshRef} object={scene} />;
}

/**
 * Model3DViewer Component
 * Interactive 3D model viewer with controls
 */
function Model3DViewer({ modelUrl, title, description }) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoom, setZoom] = useState(5);
  const [resetTrigger, setResetTrigger] = useState(0);
  const controlsRef = useRef();

  const handleReset = () => {
    setZoom(5);
    setResetTrigger(prev => prev + 1);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.max(2, prev - 1));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.min(20, prev + 1));
  };

  const handleFullscreen = () => {
    const element = document.getElementById('canvas-container');
    if (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-xl font-bold text-white mb-1">{title || '3D Modell'}</h3>
        {description && (
          <p className="text-sm text-gray-400">{description}</p>
        )}
      </div>

      {/* 3D Canvas */}
      <div id="canvas-container" className="relative bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="h-96 md:h-[500px]">
          <Canvas key={resetTrigger}>
            <Suspense fallback={<LoadingFallback />}>
              <PerspectiveCamera makeDefault position={[0, 0, zoom]} />
              
              {/* Lighting */}
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              
              {/* Environment */}
              <Environment preset="sunset" />
              
              {/* Model */}
              {modelUrl && <Model url={modelUrl} autoRotate={autoRotate} />}
              
              {/* Ground Shadow */}
              <ContactShadows
                position={[0, -1, 0]}
                opacity={0.5}
                scale={10}
                blur={2}
                far={4}
              />
              
              {/* Controls */}
              <OrbitControls
                ref={controlsRef}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={autoRotate}
                autoRotateSpeed={2}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Control Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleReset}
            className="p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-all"
            title="Ansicht zurücksetzen"
          >
            <RotateCcw size={20} className="text-white" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-all"
            title="Vergrößern"
          >
            <ZoomIn size={20} className="text-white" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-all"
            title="Verkleinern"
          >
            <ZoomOut size={20} className="text-white" />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-all"
            title="Vollbild"
          >
            <Maximize2 size={20} className="text-white" />
          </button>
        </div>

        {/* Auto-rotate Toggle */}
        <div className="absolute bottom-4 left-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-white/20 transition-all">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500"
            />
            <span className="text-sm text-white">Auto-Rotation</span>
          </label>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
          <div>
            <p className="font-semibold mb-1">🖱️ Rotieren</p>
            <p className="text-xs text-gray-400">Linke Maustaste ziehen</p>
          </div>
          <div>
            <p className="font-semibold mb-1">🔍 Zoom</p>
            <p className="text-xs text-gray-400">Mausrad scrollen</p>
          </div>
          <div>
            <p className="font-semibold mb-1">↔️ Verschieben</p>
            <p className="text-xs text-gray-400">Rechte Maustaste ziehen</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Fallback Component
 */
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8b5cf6" wireframe />
    </mesh>
  );
}

export default Model3DViewer;
