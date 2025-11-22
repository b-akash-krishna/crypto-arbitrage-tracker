import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

const HolographicMaterial = shaderMaterial(
    {
        time: 0,
        color: new THREE.Color('#00f3ff'),
        rimColor: new THREE.Color('#bc13fe'),
    },
    // Vertex Shader
    `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform float time;
    uniform vec3 color;
    uniform vec3 rimColor;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = dot(viewDirection, vNormal);
      fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
      fresnel = pow(fresnel, 2.0);

      // Scanning grid effect
      float grid = sin(vPosition.y * 20.0 + time * 5.0) * 0.5 + 0.5;
      grid = pow(grid, 10.0);

      vec3 finalColor = mix(color, rimColor, fresnel);
      finalColor += vec3(grid) * color;

      gl_FragColor = vec4(finalColor, fresnel * 0.8 + grid * 0.5);
    }
  `
)

extend({ HolographicMaterial })

export { HolographicMaterial }
