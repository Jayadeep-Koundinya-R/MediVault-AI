import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

export const ThreeCanvasBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'dna' | 'particles'>('dna');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !visible) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Objects
    // A. DNA Wave Particle Lattice
    const particleCount = mode === 'dna' ? 900 : 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(0x7B73F6), // Purple
      new THREE.Color(0xF5A623), // Amber
      new THREE.Color(0x06B6D4), // Cyan
      new THREE.Color(0x3B82F6), // Blue
    ];

    for (let i = 0; i < particleCount; i++) {
      if (mode === 'dna') {
        // Double helix / wave distribution
        const t = (i / particleCount) * Math.PI * 12;
        const strand = i % 2 === 0 ? 1 : -1;
        const radius = 18;

        positions[i * 3] = (i / particleCount - 0.5) * 160;
        positions[i * 3 + 1] = Math.sin(t) * radius * strand + (Math.random() - 0.5) * 4;
        positions[i * 3 + 2] = Math.cos(t) * radius * strand + (Math.random() - 0.5) * 6;
      } else {
        // Organic floating particle cloud
        positions[i * 3] = (Math.random() - 0.5) * 180;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
      }

      const col = colorPalette[i % colorPalette.length];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle texture / material
    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // B. Subtle Connecting Lines for DNA rungs
    let lineMesh: THREE.LineSegments | null = null;
    if (mode === 'dna') {
      const linePositions: number[] = [];
      const lineColors: number[] = [];
      for (let i = 0; i < particleCount - 2; i += 4) {
        linePositions.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[(i + 1) * 3], positions[(i + 1) * 3 + 1], positions[(i + 1) * 3 + 2]
        );
        lineColors.push(0.48, 0.45, 0.96, 0.48, 0.45, 0.96);
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
      const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.18,
      });
      lineMesh = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(lineMesh);
    }

    // 3. Mouse Parallax Tracker
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetX = (event.clientX - halfW) * 0.035;
      targetY = (event.clientY - halfH) * 0.035;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 4. Resize Listener
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // 5. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera interpolation
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      camera.position.x = currentX;
      camera.position.y = -currentY;
      camera.lookAt(0, 0, 0);

      // Gentle wave rotation
      particles.rotation.y = elapsed * 0.06;
      particles.rotation.x = Math.sin(elapsed * 0.05) * 0.1;

      if (lineMesh) {
        lineMesh.rotation.y = elapsed * 0.06;
        lineMesh.rotation.x = Math.sin(elapsed * 0.05) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [mode, visible]);

  return (
    <>
      {/* Three.js Background Canvas */}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: '92px', // Start right after sidebar
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: visible ? 0.65 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />

      {/* Floating 3D Background Controls in bottom right */}
      <div
        style={{
          position: 'fixed',
          bottom: '18px',
          right: '24px',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #E2E8F0',
          borderRadius: '9999px',
          padding: '4px 8px 4px 12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          fontSize: '11.5px',
          fontWeight: 700,
          color: '#475569',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={13} color="#7B73F6" />
          <span>3D Neural WebGL</span>
        </span>

        <button
          onClick={() => setMode(mode === 'dna' ? 'particles' : 'dna')}
          style={{
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '12px',
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#1E293B',
            cursor: 'pointer',
          }}
          title="Toggle 3D visual mode"
        >
          {mode === 'dna' ? 'DNA Wave' : 'Bio Cloud'}
        </button>

        <button
          onClick={() => setVisible(!visible)}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            color: visible ? '#6366F1' : '#94A3B8',
            display: 'flex',
            alignItems: 'center',
          }}
          title={visible ? 'Hide 3D Background' : 'Show 3D Background'}
        >
          {visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>
    </>
  );
};
