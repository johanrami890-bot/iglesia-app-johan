# Script para reiniciar el servidor backend de forma segura
Write-Host "🔄 Buscando proceso en puerto 5000..." -ForegroundColor Yellow

$port = 5000
try {
    $tcp = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop
    foreach ($conn in $tcp) {
        $procId = $conn.OwningProcess
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "   Eliminando proceso $($proc.ProcessName) (PID: $procId)..." -ForegroundColor Yellow
            Stop-Process -Id $procId -Force
        }
    }
    Write-Host "✓ Puerto $port liberado" -ForegroundColor Green
} catch {
    Write-Host "ℹ El puerto $port ya está libre" -ForegroundColor Gray
}

Start-Sleep -Seconds 1

Write-Host "🚀 Iniciando servidor backend..." -ForegroundColor Cyan

# Definir ruta correcta
$backendPath = Join-Path $PSScriptRoot "backend"

if (Test-Path $backendPath) {
    # Iniciar el servidor en segundo plano
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm start"
    Write-Host "✓ Servidor backend iniciado en nueva ventana" -ForegroundColor Green
} else {
    Write-Host "❌ Error: No se encuentra la carpeta backend en $backendPath" -ForegroundColor Red
}
