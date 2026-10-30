Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\Bruno\Pictures\Screenshots\Captura de tela 2026-10-25 152651.png"
$outDir = "C:\Users\Bruno\center-grafica\assets\images"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$src = [System.Drawing.Bitmap]::FromFile($sourcePath)

function Save-Crop {
    param(
        [int]$X,
        [int]$Y,
        [int]$W,
        [int]$H,
        [string]$FileName
    )
    $rect = New-Object System.Drawing.Rectangle($X, $Y, $W, $H)
    $cropped = $src.Clone($rect, $src.PixelFormat)
    $destPath = Join-Path $outDir $FileName
    $cropped.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Output "Saved: $destPath ($($W)x$($H))"
}

# 1. Mascot Rocket Avatar
Save-Crop -X 516 -Y 182 -W 190 -H 190 -FileName "mascot-rocket.png"

# 2. Portfolio 1: Sacolas Personalizadas (Telego.net)
Save-Crop -X 241 -Y 677 -W 350 -H 400 -FileName "portfolio-sacolas.png"

# 3. Portfolio 2: Personalizacao de Frotas
Save-Crop -X 594 -Y 677 -W 350 -H 400 -FileName "portfolio-frotas.png"

# 4. Portfolio 3: Cadernos e Agendas
Save-Crop -X 947 -Y 677 -W 350 -H 400 -FileName "portfolio-agendas.png"

# 5. Portfolio 4: Agenda Corporativa Terrasco
Save-Crop -X 1300 -Y 677 -W 348 -H 400 -FileName "portfolio-terrasco.png"

$src.Dispose()
