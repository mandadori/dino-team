#!/usr/bin/env bash
# Verifica invariantes do redesign de contexto cirúrgico.
# Uso: scripts/check-redesign.sh [agents|skills|readme|all]
set -uo pipefail
cd "$(dirname "$0")/.." || exit 2
fail=0

check_agents() {
  for f in .claude/agents/*.md; do
    for sec in "## Recebo" "## Entrego" "## Orçamento de output" "## Input incompleto"; do
      grep -qF "$sec" "$f" || { echo "FALTA [$sec] em $f"; fail=1; }
    done
    for old in "## Contrato de entrada" "## Contrato de saída" "## Quando devolver erro"; do
      grep -qF "$old" "$f" && { echo "AINDA TEM [$old] em $f"; fail=1; }
    done
  done
}

check_skills() {
  for f in .claude/skills/*/SKILL.md; do
    case "$f" in */brainstorming/*|*/writing-plans/*|*/grill-me/*|*/find-skills/*|*/skill-creator/*|*/agent-browser/*|*/ui-ux-pro-max/*|*/remotion-best-practices/*) continue;; esac
    grep -qF "## Fluxo" "$f" || { echo "FALTA [## Fluxo] em $f"; fail=1; }
  done
}

check_readme() {
  [ -e templates/formatos/README.md ] && { echo "README ainda existe"; fail=1; }
  hits=$(grep -rl "formatos/README.md" .claude templates 2>/dev/null)
  [ -n "$hits" ] && { echo "Referências ao README:"; echo "$hits"; fail=1; }
  return 0
}

case "${1:-all}" in
  agents) check_agents;;
  skills) check_skills;;
  readme) check_readme;;
  all) check_agents; check_skills; check_readme;;
esac
[ "$fail" = 0 ] && echo "OK: todas as checagens passaram" || echo "FALHOU"
exit $fail
