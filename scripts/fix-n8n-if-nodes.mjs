/**
 * n8n 1.109+ exige conditions.options.caseSensitive nos nodes IF.
 * Corrige workflows exportados para o formato compatível.
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const workflowsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'n8n', 'workflows')

const IF_OPTIONS = {
  caseSensitive: true,
  leftValue: '',
  typeValidation: 'strict',
}

function fixIfNode(node) {
  if (node.type !== 'n8n-nodes-base.if') return false

  const conditions = node.parameters?.conditions
  if (!conditions || conditions.options?.caseSensitive != null) return false

  conditions.options = IF_OPTIONS
  if (!node.parameters.options) {
    node.parameters.options = {}
  }

  for (const [index, condition] of (conditions.conditions ?? []).entries()) {
    if (!condition.id) {
      condition.id = `cond-${node.id ?? node.name}-${index}`
    }
  }

  return true
}

let totalFixed = 0

for (const file of readdirSync(workflowsDir).filter((name) => name.endsWith('.json'))) {
  const path = join(workflowsDir, file)
  const workflow = JSON.parse(readFileSync(path, 'utf8'))
  let fixed = 0

  for (const node of workflow.nodes ?? []) {
    if (fixIfNode(node)) fixed += 1
  }

  if (fixed > 0) {
    writeFileSync(path, `${JSON.stringify(workflow, null, 2)}\n`, 'utf8')
    console.log(`${file}: ${fixed} node(s) IF corrigido(s)`)
    totalFixed += fixed
  }
}

console.log(`Total: ${totalFixed} node(s) IF corrigidos`)
