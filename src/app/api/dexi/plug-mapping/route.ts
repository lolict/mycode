import { NextResponse } from 'next/server'
import {
  generateDexiPlugMappings,
  getCategoryPlugMap,
  getNeuralDexiConnections,
  getDexiPlugNeuralStats,
} from '@/lib/dexi-plug-integration'

export async function GET() {
  const stats = getDexiPlugNeuralStats()
  const mappings = generateDexiPlugMappings()
  const categoryMap = getCategoryPlugMap()
  const neuralConnections = getNeuralDexiConnections()

  return NextResponse.json({
    stats,
    mappings,
    categoryPlugMap: categoryMap,
    neuralConnections,
  })
}
