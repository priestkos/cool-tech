import * as THREE from "three"
import { OBJExporter } from "three/addons/exporters/OBJExporter.js"
import type { Board } from "./model"

const INCH_SCALE = 1 / 12

export function boardsToGroup(boards: Board[]): THREE.Group {
  const group = new THREE.Group()
  group.name = "BenchUpBoardLab"

  for (const board of boards) {
    const geo = new THREE.BoxGeometry(
      board.length * INCH_SCALE,
      board.thickness * INCH_SCALE,
      board.width * INCH_SCALE
    )
    const mesh = new THREE.Mesh(geo)
    mesh.name = `board_${board.id}`
    mesh.position.set(
      (board.originX + board.length / 2) * INCH_SCALE,
      (board.thickness / 2) * INCH_SCALE,
      (board.originZ + board.width / 2) * INCH_SCALE
    )
    group.add(mesh)
  }

  return group
}

export function exportBoardsObj(boards: Board[]): string {
  const exporter = new OBJExporter()
  const scene = new THREE.Scene()
  scene.add(boardsToGroup(boards))
  return exporter.parse(scene)
}
