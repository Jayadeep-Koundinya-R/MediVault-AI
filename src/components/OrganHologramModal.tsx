import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, Activity } from 'lucide-react';
import { soundFX } from '../utils/audioEffects';

interface OrganHologramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrganFilter: (filter: string) => void;
}

type OrganNode = {
  id: string;
  name: string;
  system: string;
  pos: [number, number, number];
  color: number;
  status: 'critical' | 'stable' | 'protected';
  vitalValue: string;
  hospitalSource: string;
  actionSummary: string;
};

const organData: OrganNode[] = [
  {
    id: 'pancreas',
    name: 'Endocrine (Pancreas)',
    system: 'Glycemic Regulation',
    pos: [0, 4, 3],
    color: 0xEF4444, // Red (critical high glucose)
    status: 'critical',
    vitalValue: 'Fasting Glucose 138 mg/dL (HbA1c 7.1%)',
    hospitalSource: 'Apollo Hospitals Clinical Labs',
    actionSummary: 'Crossed ADA diabetic threshold. Rx: Metformin 500mg BID + Glimepiride 1mg.',
  },
  {
    id: 'heart',
    name: 'Cardiovascular (Heart & Vessels)',
    system: 'Circulatory & Blood Pressure',
    pos: [2, 10, 3],
    color: 0x7B73F6, // Purple
    status: 'stable',
    vitalValue: 'Normotensive on Telmisartan 40mg',
    hospitalSource: 'Manipal Hospital (Dr. Rajesh Mehta)',
    actionSummary: 'Antihypertensive therapy maintained. Total cholesterol 194 mg/dL normal.',
  },
  {
    id: 'kidneys',
    name: 'Renal (Kidneys & Filtration)',
    system: 'Excretory / Metabolic Clearance',
    pos: [-3, -1, 2],
    color: 0x10B981, // Emerald Green
    status: 'stable',
    vitalValue: 'Serum Creatinine 0.95 mg/dL (Ref: 0.7 - 1.2)',
    hospitalSource: 'Apollo Hospitals Labs',
    actionSummary: 'Estimated GFR normal. No diabetic nephropathy indicators present.',
  },
  {
    id: 'immune',
    name: 'Immune System & Immunization',
    system: 'Lymphatic / Defense',
    pos: [0, 16, 2],
    color: 0x06B6D4, // Cyan
    status: 'protected',
    vitalValue: 'Covaxin Dose 3 (Booster) Verified',
    hospitalSource: 'CoWIN Ministry of Health',
    actionSummary: 'Annual Quadrivalent Influenza vaccine renewal recommended (Sep 2026).',
  },
];

export const OrganHologramModal: React.FC<OrganHologramModalProps> = ({
  isOpen,
  onClose,
  onSelectOrganFilter,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedOrgan, setSelectedOrgan] = useState<OrganNode>(organData[0]);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 5, 38);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for whole rotating model
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // 1. Holographic Wireframe Silhouette (Head, Torso, Limbs)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x4F46E5,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    // Torso cylinder
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(7, 5.5, 22, 16, 8, true), wireMat);
    torso.position.y = 5;
    modelGroup.add(torso);

    // Head sphere
    const head = new THREE.Mesh(new THREE.SphereGeometry(4.5, 14, 10), wireMat);
    head.position.y = 20;
    modelGroup.add(head);

    // Glowing rings around body
    for (let r = 0; r < 4; r++) {
      const ringGeo = new THREE.RingGeometry(8 + r * 1.5, 8.2 + r * 1.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x7B73F6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -6 + r * 8;
      modelGroup.add(ring);
    }

    // 2. Interactive Organ Nodes (Glowing Spheres with Pulse)
    const organMeshes: THREE.Mesh[] = [];

    organData.forEach((organ) => {
      const sphereGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: organ.color,
      });
      const node = new THREE.Mesh(sphereGeo, sphereMat);
      node.position.set(...organ.pos);
      node.userData = { organId: organ.id };
      modelGroup.add(node);
      organMeshes.push(node);

      // Outer aura ring
      const auraGeo = new THREE.RingGeometry(2.2, 2.5, 16);
      const auraMat = new THREE.MeshBasicMaterial({
        color: organ.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      aura.position.set(...organ.pos);
      aura.rotation.x = Math.PI / 4;
      modelGroup.add(aura);
    });

    // 3. Mouse Drag Rotation Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      modelGroup.rotation.y += deltaX * 0.01;
      modelGroup.rotation.x += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 4. Animation loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Slow auto-rotation when not dragging
      if (!isDragging) {
        modelGroup.rotation.y += 0.006;
      }

      // Pulse nodes
      organMeshes.forEach((mesh, idx) => {
        const scale = 1 + Math.sin(time * 3 + idx) * 0.15;
        mesh.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '840px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={20} />
            </div>
            <div>
              <div className="modal-title">3D Biomarker Hologram & System Vitals</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Interactive spatial mapping of physiological systems and OCR-extracted labs
              </div>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Body - 2 Columns (3D Canvas + System Detail Panel) */}
        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', padding: '20px 24px' }}>
          {/* 3D Holographic Container */}
          <div
            style={{
              height: '380px',
              borderRadius: '16px',
              background: 'radial-gradient(circle at 50% 50%, #151932 0%, #0B0E20 100%)',
              position: 'relative',
              cursor: 'grab',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 40px rgba(79, 70, 229, 0.25)',
              border: '1px solid rgba(123, 115, 246, 0.3)',
            }}
          >
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

            {/* Instruction overlay */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '14px',
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                padding: '4px 10px',
                color: '#94A3B8',
                fontSize: '11px',
                pointerEvents: 'none',
              }}
            >
              Rotate 3D model with mouse drag
            </div>

            {/* Organ picker overlay buttons */}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {organData.map((organ) => {
                const isSelected = selectedOrgan.id === organ.id;
                return (
                  <button
                    key={organ.id}
                    onClick={() => {
                      setSelectedOrgan(organ);
                      soundFX.playChime();
                    }}
                    style={{
                      background: isSelected ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.75)',
                      color: isSelected ? '#0F172A' : '#CBD5E1',
                      border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {organ.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Organ Detail Card */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#6366F1' }}>
                    {selectedOrgan.system}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: selectedOrgan.status === 'critical' ? '#FEE2E2' : '#DCFCE7',
                      color: selectedOrgan.status === 'critical' ? '#B91C1C' : '#15803D',
                    }}
                  >
                    {selectedOrgan.status.toUpperCase()}
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedOrgan.name}
                </h3>
              </div>

              {/* Vitals Box */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>Active Biomarker / Metric</div>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: selectedOrgan.status === 'critical' ? '#DC2626' : '#0F172A', marginTop: '2px' }}>
                  {selectedOrgan.vitalValue}
                </div>
                <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '4px' }}>
                  Reported by: <strong>{selectedOrgan.hospitalSource}</strong>
                </div>
              </div>

              {/* Clinical Synthesis */}
              <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
                <strong>Clinical Notes:</strong> {selectedOrgan.actionSummary}
              </div>
            </div>

            {/* Action */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', marginTop: '12px' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  onSelectOrganFilter(selectedOrgan.id === 'pancreas' ? 'lab_report' : selectedOrgan.id === 'heart' ? 'prescription' : 'all');
                  onClose();
                }}
              >
                Filter Timeline to {selectedOrgan.name.split(' ')[0]} Records
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
