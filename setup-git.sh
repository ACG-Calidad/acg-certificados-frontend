#!/bin/bash

# Script para inicializar git y conectar con el repositorio remoto

cd "$(dirname "$0")"

echo "Inicializando repositorio git..."
git init

echo "Agregando repositorio remoto..."
git remote add origin https://github.com/ACG-Calidad/acg-certificados-frontend.git

echo "Verificando configuración..."
git remote -v

echo ""
echo "Repositorio configurado correctamente."
echo "Para hacer el commit inicial, ejecuta:"
echo "  git add ."
echo "  git commit -m \"Initial commit: Angular 21 frontend structure"
echo ""
echo "Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>\""
echo "  git push -u origin main"
