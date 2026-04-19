import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { City, Faction } from '../game/types'
import { FACTION_COLORS, NEUTRAL_COLOR } from '../game/types'

interface CityModelProps { city: City; selected: boolean; onClick: () => void }

// ── Animated helpers ────────────────────────────────────────────────────────
function SmokePlume({ position, color = '#888888' }: { position: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.05 + 0.1
      ;(ref.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(clock.elapsedTime * 0.7) * 0.08
    }
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.06, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} depthWrite={false} />
    </mesh>
  )
}

function Torch({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => { if (ref.current) ref.current.intensity = 0.4 + Math.sin(clock.elapsedTime * 8 + position[0] * 5) * 0.15 })
  return (
    <group position={position}>
      <mesh><cylinderGeometry args={[0.008, 0.008, 0.08, 4]} /><meshStandardMaterial color="#5c3d2e" /></mesh>
      <mesh position={[0, 0.06, 0]}><sphereGeometry args={[0.02, 4, 4]} /><meshBasicMaterial color="#ff8833" /></mesh>
      <pointLight ref={ref} position={[0, 0.06, 0]} color="#ff6622" intensity={0.5} distance={1.5} decay={2} />
    </group>
  )
}

function Banner({ position, color, height = 0.12 }: { position: [number, number, number]; color: string; height?: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 2 + position[0] * 3) * 0.15 })
  return (
    <group position={position}>
      <mesh><cylinderGeometry args={[0.008, 0.008, height + 0.15, 4]} /><meshStandardMaterial color="#777" /></mesh>
      <mesh ref={ref} position={[0.05, (height + 0.15) / 2 - 0.02, 0]}>
        <boxGeometry args={[0.08, 0.06, 0.005]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
    </group>
  )
}

// ── Human City: castle complex ──────────────────────────────────────────────
function HumanCity({ color }: { color: string }) {
  return (
    <group>
      {/* Main keep */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.4, 0.6, 0.4]} />
        <meshStandardMaterial color="#a09080" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <coneGeometry args={[0.25, 0.2, 4]} />
        <meshStandardMaterial color="#4466aa" roughness={0.7} />
      </mesh>

      {/* Corner towers with battlements */}
      {[[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.09, 0.5, 6]} />
            <meshStandardMaterial color="#908070" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.52, 0]} castShadow>
            <coneGeometry args={[0.1, 0.1, 6]} />
            <meshStandardMaterial color="#4466aa" roughness={0.7} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((j) => {
            const a = (j / 6) * Math.PI * 2
            return (
              <mesh key={j} position={[Math.cos(a) * 0.07, 0.49, Math.sin(a) * 0.07]}>
                <boxGeometry args={[0.025, 0.04, 0.025]} />
                <meshStandardMaterial color="#7a6a5a" />
              </mesh>
            )
          })}
        </group>
      ))}

      {/* Curtain walls */}
      {[
        [0, 0.15, -0.25, 0.5, 0.3, 0.05],
        [0, 0.15, 0.25, 0.5, 0.3, 0.05],
        [-0.25, 0.15, 0, 0.05, 0.3, 0.5],
        [0.25, 0.15, 0, 0.05, 0.3, 0.5],
      ].map(([wx, wy, wz, ww, wh, wd], i) => (
        <mesh key={`w${i}`} position={[wx, wy, wz]} castShadow>
          <boxGeometry args={[ww, wh, wd]} />
          <meshStandardMaterial color="#8a7a6a" roughness={0.9} />
        </mesh>
      ))}

      {/* Gate + arch */}
      <mesh position={[0, 0.08, 0.27]}>
        <boxGeometry args={[0.1, 0.16, 0.02]} />
        <meshStandardMaterial color="#4a3a2a" />
      </mesh>
      <mesh position={[0, 0.18, 0.27]}>
        <boxGeometry args={[0.12, 0.03, 0.025]} />
        <meshStandardMaterial color="#6a5a4a" />
      </mesh>

      {/* Courtyard buildings */}
      {[[-0.1, 0.08, 0.12], [0.12, 0.07, -0.12]].map(([hx, hh, hz], i) => (
        <group key={`h${i}`} position={[hx, 0, hz]}>
          <mesh position={[0, hh / 2 + 0.02, 0]} castShadow>
            <boxGeometry args={[0.1, hh, 0.08]} />
            <meshStandardMaterial color="#b0a090" roughness={0.9} />
          </mesh>
          <mesh position={[0, hh + 0.04, 0]} castShadow>
            <coneGeometry args={[0.065, 0.06, 4]} />
            <meshStandardMaterial color="#8a5533" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Well */}
      <mesh position={[-0.08, 0.04, 0.05]}>
        <cylinderGeometry args={[0.025, 0.03, 0.04, 6]} />
        <meshStandardMaterial color="#777" roughness={0.9} />
      </mesh>

      {/* Market stall */}
      <group position={[0.06, 0, 0.08]}>
        <mesh position={[0, 0.035, 0]}>
          <boxGeometry args={[0.07, 0.01, 0.05]} />
          <meshStandardMaterial color="#8a6644" />
        </mesh>
        {[[-0.025, 0], [0.025, 0]].map(([sx, sz], i) => (
          <mesh key={i} position={[sx, 0.02, sz]}>
            <cylinderGeometry args={[0.003, 0.003, 0.04, 3]} />
            <meshStandardMaterial color="#5a4030" />
          </mesh>
        ))}
      </group>

      <Banner position={[-0.25, 0.5, -0.25]} color={color} />
      <Banner position={[0.25, 0.5, 0.25]} color={color} />
      <SmokePlume position={[0, 0.7, 0.05]} />
      <Torch position={[-0.08, 0.2, 0.26]} />
      <Torch position={[0.08, 0.2, 0.26]} />

      {/* Glowing windows */}
      {[[-0.08, 0.35, 0.201], [0.08, 0.35, 0.201], [0, 0.25, 0.201], [-0.08, 0.45, 0.201]].map(([gx, gy, gz], i) => (
        <mesh key={`gw${i}`} position={[gx, gy, gz]}>
          <planeGeometry args={[0.04, 0.04]} />
          <meshBasicMaterial color="#ffcc55" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// ── Orc City: war camp with huts, totems, palisade ──────────────────────────
function OrcCity({ color }: { color: string }) {
  return (
    <group>
      {/* Main war hall */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.35, 0.4, 0.35]} />
        <meshStandardMaterial color="#6b4a2a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <coneGeometry args={[0.28, 0.2, 4]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
      </mesh>

      {/* Secondary huts */}
      {[[-0.25, 0.1, 0.2], [0.28, 0.08, -0.15]].map(([hx, hh, hz], i) => (
        <group key={`hut${i}`} position={[hx, 0, hz]}>
          <mesh position={[0, hh / 2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, hh, 5]} />
            <meshStandardMaterial color="#5c3a20" roughness={0.95} />
          </mesh>
          <mesh position={[0, hh + 0.04, 0]} castShadow>
            <coneGeometry args={[0.12, 0.1, 5]} />
            <meshStandardMaterial color="#443020" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Palisade wall */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const radius = 0.42
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, 0.15, Math.sin(angle) * radius]} castShadow>
            <cylinderGeometry args={[0.015, 0.02, 0.3 + Math.sin(i * 2.5) * 0.05, 4]} />
            <meshStandardMaterial color="#5c3d2e" roughness={0.95} />
          </mesh>
        )
      })}

      {/* Spikes on palisades */}
      {[0, 3, 7, 11, 14].map((i) => {
        const angle = (i / 16) * Math.PI * 2
        return (
          <mesh key={`s${i}`} position={[Math.cos(angle) * 0.42, 0.35, Math.sin(angle) * 0.42]}>
            <coneGeometry args={[0.015, 0.06, 4]} />
            <meshStandardMaterial color="#3a2a1a" />
          </mesh>
        )
      })}

      {/* War totem */}
      <group position={[0.15, 0, 0.25]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.025, 0.3, 4]} />
          <meshStandardMaterial color="#4a3020" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.06, 0.05, 0.04]} />
          <meshStandardMaterial color="#5a3828" />
        </mesh>
        {[[-0.015, 0], [0.015, 0]].map(([ex, ez], i) => (
          <mesh key={i} position={[ex, 0.33, 0.021 + ez]}>
            <sphereGeometry args={[0.006, 4, 4]} />
            <meshBasicMaterial color="#ff3300" />
          </mesh>
        ))}
      </group>

      {/* Skulls on sticks */}
      {[[0, 0.35, 0.18], [-0.18, 0.28, -0.16]].map(([sx, sy, sz], i) => (
        <group key={`sk${i}`} position={[sx, 0, sz]}>
          <mesh position={[0, sy * 0.6, 0]}>
            <cylinderGeometry args={[0.005, 0.005, sy * 0.8, 3]} />
            <meshStandardMaterial color="#4a3a20" />
          </mesh>
          <mesh position={[0, sy, 0]}>
            <sphereGeometry args={[0.025, 5, 5]} />
            <meshStandardMaterial color="#d4c8a0" />
          </mesh>
        </group>
      ))}

      <Torch position={[0.15, 0.05, 0.34]} />
      <Torch position={[-0.2, 0.05, -0.3]} />
      <Banner position={[0.2, 0.35, 0]} color={color} />
      <SmokePlume position={[0.15, 0.35, 0.34]} color="#554433" />
      <SmokePlume position={[0, 0.5, 0]} color="#443322" />
    </group>
  )
}

// ── Elf City: crystal spires, arched bridges, glowing trees ─────────────────
function ElfCity({ color }: { color: string }) {
  return (
    <group>
      {/* Central spire */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 0.8, 8]} />
        <meshStandardMaterial color="#e0ddd5" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <coneGeometry args={[0.13, 0.25, 8]} />
        <meshStandardMaterial color="#88bb88" roughness={0.6} />
      </mesh>

      {/* Side towers */}
      {[[-0.22, -0.15], [0.22, 0.15], [-0.12, 0.22]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.065, 0.44, 8]} />
            <meshStandardMaterial color="#d8d5cc" roughness={0.5} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.46, 0]} castShadow>
            <coneGeometry args={[0.075, 0.14, 8]} />
            <meshStandardMaterial color="#77aa77" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.33, 0]}>
            <torusGeometry args={[0.065, 0.006, 4, 8]} />
            <meshStandardMaterial color="#c0bbb0" />
          </mesh>
        </group>
      ))}

      {/* Arched bridge */}
      <mesh position={[0, 0.17, 0.1]} castShadow>
        <boxGeometry args={[0.35, 0.025, 0.06]} />
        <meshStandardMaterial color="#d0ccbb" roughness={0.5} />
      </mesh>

      {/* Glowing trees */}
      {[[-0.35, 0, 0], [0.35, 0, 0], [0.15, 0, -0.3]].map(([tx, , tz], i) => (
        <group key={`t${i}`} position={[tx, 0, tz]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.012, 0.018, 0.2, 4]} />
            <meshStandardMaterial color="#c0b090" />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshStandardMaterial color="#55bb55" emissive="#33aa33" emissiveIntensity={0.15} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Garden hedge */}
      <mesh position={[0, 0.04, -0.25]} castShadow>
        <boxGeometry args={[0.5, 0.06, 0.04]} />
        <meshStandardMaterial color="#3a7a3a" roughness={0.8} />
      </mesh>

      {/* Crystal top */}
      <mesh position={[0, 0.98, 0]}>
        <octahedronGeometry args={[0.04]} />
        <meshStandardMaterial color="#aaffaa" emissive="#55ff55" emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0, 0.98, 0]} color="#55ff55" intensity={0.3} distance={1.5} decay={2} />

      <Banner position={[0, 0.85, 0.05]} color={color} height={0.15} />
    </group>
  )
}

// ── Bane City: dark gothic fortress ─────────────────────────────────────────
function BaneCity({ color }: { color: string }) {
  return (
    <group>
      {/* Dark central tower */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.3, 0.7, 0.3]} />
        <meshStandardMaterial color="#2a2030" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <coneGeometry args={[0.15, 0.35, 4]} />
        <meshStandardMaterial color="#1a1520" roughness={0.9} />
      </mesh>

      {/* Corner spires */}
      {[[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.12, 0.4, 0.12]} />
            <meshStandardMaterial color="#252030" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.45, 0]} castShadow>
            <coneGeometry args={[0.08, 0.18, 4]} />
            <meshStandardMaterial color="#1a1520" />
          </mesh>
        </group>
      ))}

      {/* Dark walls */}
      {[
        [0, 0.12, -0.22, 0.44, 0.24, 0.04],
        [0, 0.12, 0.22, 0.44, 0.24, 0.04],
        [-0.22, 0.12, 0, 0.04, 0.24, 0.44],
        [0.22, 0.12, 0, 0.04, 0.24, 0.44],
      ].map(([wx, wy, wz, ww, wh, wd], i) => (
        <mesh key={`dw${i}`} position={[wx, wy, wz]} castShadow>
          <boxGeometry args={[ww, wh, wd]} />
          <meshStandardMaterial color="#201828" roughness={0.95} />
        </mesh>
      ))}

      {/* Crypt entrance */}
      <group position={[0, 0.04, 0.24]}>
        <mesh>
          <boxGeometry args={[0.1, 0.12, 0.02]} />
          <meshStandardMaterial color="#0a0810" />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[0.12, 0.02, 0.025]} />
          <meshStandardMaterial color="#2a1830" />
        </mesh>
      </group>

      {/* Purple glowing windows */}
      {[[-0.08, 0.4, 0.151], [0.08, 0.4, 0.151], [0, 0.55, 0.151], [-0.06, 0.3, 0.151], [0.06, 0.3, 0.151]].map(([gx, gy, gz], i) => (
        <mesh key={`gw${i}`} position={[gx, gy, gz]}>
          <planeGeometry args={[0.035, 0.055]} />
          <meshBasicMaterial color="#9933ff" transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Purple energy orb */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#9933ff" emissive="#7722cc" emissiveIntensity={0.8} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0, 0.95, 0]} color="#9933ff" intensity={0.5} distance={2} decay={2} />

      {/* Energy conduits */}
      {[[-0.22, 0.45, -0.22], [0.22, 0.45, 0.22]].map(([cx, cy, cz], i) => (
        <mesh key={`ec${i}`} position={[(cx) / 2, (cy + 0.95) / 2, (cz) / 2]}>
          <cylinderGeometry args={[0.004, 0.004, 0.6, 3]} />
          <meshBasicMaterial color="#7722cc" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Ground corruption */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.48, 8]} />
        <meshBasicMaterial color="#330044" transparent opacity={0.2} depthWrite={false} />
      </mesh>

      <Banner position={[0.22, 0.45, 0.22]} color={color} />
      <SmokePlume position={[0.1, 0.7, 0]} color="#332244" />
    </group>
  )
}

// ── Neutral city ────────────────────────────────────────────────────────────
function NeutralCity() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.35, 0.4, 0.35]} />
        <meshStandardMaterial color="#777770" roughness={0.9} />
      </mesh>
      {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([tx, tz], i) => (
        <mesh key={i} position={[tx, 0.15, tz]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 0.3, 5]} />
          <meshStandardMaterial color="#666660" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.42, 0]} castShadow>
        <coneGeometry args={[0.2, 0.12, 4]} />
        <meshStandardMaterial color="#5a5a55" />
      </mesh>
      <mesh position={[0, 0.07, 0.18]}>
        <boxGeometry args={[0.08, 0.14, 0.02]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  )
}

// ── Faction router + selection ──────────────────────────────────────────────
const FACTION_CITIES: Record<Faction, React.FC<{ color: string }>> = {
  player: HumanCity, orcs: OrcCity, elves: ElfCity, bane: BaneCity,
}

export default function CityModel({ city, selected, onClick }: CityModelProps) {
  const color = city.owner ? FACTION_COLORS[city.owner] : NEUTRAL_COLOR
  const CityComponent = city.owner ? FACTION_CITIES[city.owner] : null

  const ringRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ringRef.current && selected) {
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.4 + Math.sin(clock.elapsedTime * 3) * 0.2
    }
  })

  return (
    <group position={[city.x, 0.075, city.y]} onClick={(e) => { e.stopPropagation(); onClick() }}>
      {CityComponent ? <CityComponent color={color} /> : <NeutralCity />}

      {selected && (
        <mesh ref={ringRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.48, 32]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      )}

      {city.producing && (
        <group position={[0.3, 0.6, 0.3]}>
          <mesh>
            <torusGeometry args={[0.04, 0.012, 6, 8]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}
    </group>
  )
}
