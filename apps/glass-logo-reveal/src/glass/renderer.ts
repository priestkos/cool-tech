// Ported from glass-icon-reveal (MIT) — https://github.com/zanwei/glass-icon-reveal

import { BOX, FRAME_KEYS, TEX } from './constants'
import type { LogoTextures } from './sdf'
import { FRAG_SHADER, VERT_SHADER } from './shaders'
import type { ShaderFrame } from './timeline'

export function isWebGL2Available(): boolean {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2')
  return gl !== null
}

export interface GlassRenderer {
  setLogo: (logo: LogoTextures) => void
  render: (
    frame: ShaderFrame,
    width: number,
    height: number,
    tilePx: number,
    cx?: number,
    cy?: number,
  ) => void
  dispose: () => void
}

export function createRenderer(
  canvas: HTMLCanvasElement,
  opts: { preserve?: boolean } = {},
): GlassRenderer | null {
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: !!opts.preserve,
  })
  if (!gl) return null
  const g = gl

  const compile = (type: number, src: string) => {
    const sh = g.createShader(type)
    if (!sh) throw new Error('Could not create shader')
    g.shaderSource(sh, src)
    g.compileShader(sh)
    if (!g.getShaderParameter(sh, g.COMPILE_STATUS)) {
      throw new Error(g.getShaderInfoLog(sh) ?? 'Shader compile failed')
    }
    return sh
  }
  const prog = g.createProgram()
  if (!prog) throw new Error('Could not create program')
  g.attachShader(prog, compile(g.VERTEX_SHADER, VERT_SHADER))
  g.attachShader(prog, compile(g.FRAGMENT_SHADER, FRAG_SHADER))
  g.linkProgram(prog)
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
    throw new Error(g.getProgramInfoLog(prog) ?? 'Program link failed')
  }
  g.useProgram(prog)

  const buf = g.createBuffer()
  g.bindBuffer(g.ARRAY_BUFFER, buf)
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW)
  const loc = g.getAttribLocation(prog, 'aPos')
  g.enableVertexAttribArray(loc)
  g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0)

  const U: Record<string, WebGLUniformLocation | null> = {}
  const count = g.getProgramParameter(prog, g.ACTIVE_UNIFORMS)
  for (let i = 0; i < count; i++) {
    const info = g.getActiveUniform(prog, i)
    if (info) U[info.name] = g.getUniformLocation(prog, info.name)
  }

  const sdfTex = g.createTexture()
  const colTex = g.createTexture()
  g.uniform1i(U.uSdf, 0)
  g.uniform1i(U.uCol, 1)
  let hasLogo = false

  function setLogo(logo: LogoTextures) {
    g.activeTexture(g.TEXTURE0)
    g.bindTexture(g.TEXTURE_2D, sdfTex)
    g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    g.texImage2D(g.TEXTURE_2D, 0, g.R16F, TEX, TEX, 0, g.RED, g.FLOAT, logo.sdf)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)

    g.activeTexture(g.TEXTURE1)
    g.bindTexture(g.TEXTURE_2D, colTex)
    g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    g.texImage2D(g.TEXTURE_2D, 0, g.RGBA8, g.RGBA, g.UNSIGNED_BYTE, logo.canvas)
    g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    g.generateMipmap(g.TEXTURE_2D)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR_MIPMAP_LINEAR)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
    hasLogo = true
  }

  function render(
    fr: ShaderFrame,
    w: number,
    h: number,
    tilePx: number,
    cx = w / 2,
    cy = h / 2,
  ) {
    if (!hasLogo) return
    g.viewport(0, 0, w, h)
    g.uniform2f(U.uCenter, cx, cy)
    g.uniform1f(U.uTile, tilePx)
    g.uniform1f(U.uTexSize, TEX)
    g.uniform1f(U.uBoxFrac, BOX)
    for (const k of FRAME_KEYS) {
      const loc = U[k]
      if (loc) g.uniform1f(loc, fr[k as keyof ShaderFrame] as number)
    }
    g.uniform3fv(U.uBg, fr.uBg)
    g.uniform3fv(U.uPlateCol, fr.uPlateCol)
    g.uniform3fv(U.uLogoCol, fr.uLogoCol)
    g.uniform2fv(U.uLogoOff, fr.uLogoOff)
    g.drawArrays(g.TRIANGLES, 0, 3)
  }

  function dispose() {
    const ext = g.getExtension('WEBGL_lose_context')
    if (ext) ext.loseContext()
  }

  return { setLogo, render, dispose }
}
