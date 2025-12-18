// obj-loader.js
function parseOBJ(text) {
  const positions = [], normals = [], uvs = [];
  const finalPositions = [], finalNormals = [], finalUVs = [];
  const indices = [];
  const vertexMap = new Map();

  const lines = text.split('\n');
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const type = parts.shift();
    if (type === 'v') positions.push(parts.map(parseFloat));
    else if (type === 'vn') normals.push(parts.map(parseFloat));
    else if (type === 'vt') uvs.push(parts.map(parseFloat));
    else if (type === 'f') {
      const face = [];
      for (const part of parts) {
        if (vertexMap.has(part)) {
          face.push(vertexMap.get(part));
        } else {
          const [pIdx, tIdx, nIdx] = part.split('/').map(s => parseInt(s, 10) - 1);
          const newIndex = finalPositions.length / 3;
          finalPositions.push(...positions[pIdx]);
          if (!isNaN(nIdx)) finalNormals.push(...normals[nIdx]);
          if (!isNaN(tIdx)) finalUVs.push(...uvs[tIdx]);
          vertexMap.set(part, newIndex);
          face.push(newIndex);
        }
      }
      for (let i = 1; i < face.length - 1; ++i) {
        indices.push(face[0], face[i], face[i + 1]);
      }
    }
  }
  return { points: finalPositions, normals: finalNormals, uv: finalUVs, indices: indices };
}