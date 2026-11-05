# Ordena la carpeta de Arcana en tu PC. No borra nada: solo crea carpetas y mueve lo que pongas en "00 Por ordenar".
# Uso: doble clic en "Ordenar Arcana.bat" (está junto a este archivo, dentro de la carpeta Arcana).
$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$carpetas = @(
  "00 Por ordenar",
  "01 Marketing",
  "02 Capturas",
  "03 Documentos (privado)",
  "04 Audios y voces",
  "05 Clips de Gemini, Flow y Kling",
  "06 Fotos para responder (privado)",
  "07 Videos sueltos",
  "08 Imagenes sueltas",
  "09 Zips descargados"
)
foreach ($c in $carpetas) { New-Item -ItemType Directory -Force -Path (Join-Path $raiz $c) | Out-Null }

function Destino($f) {
  $n = $f.Name.ToLower(); $e = $f.Extension.ToLower()
  if ($e -in ".mp3", ".wav", ".m4a", ".ogg", ".aac") { return "04 Audios y voces" }
  if ($e -in ".mp4", ".mov", ".webm", ".mkv") {
    if ($n -match "gemini|flow|kling|veo|generated") { return "05 Clips de Gemini, Flow y Kling" }
    return "07 Videos sueltos"
  }
  if ($e -in ".png", ".jpg", ".jpeg", ".webp", ".gif", ".heic") {
    if ($n -match "captura|screenshot|screen shot|pantalla") { return "02 Capturas\" + $f.LastWriteTime.ToString("yyyy-MM") }
    if ($n -match "whatsapp image|fb_img|received_|img-\d{8}-wa") { return "06 Fotos para responder (privado)" }
    return "08 Imagenes sueltas"
  }
  if ($e -in ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt", ".odt") { return "03 Documentos (privado)" }
  if ($e -in ".zip", ".rar", ".7z") { return "09 Zips descargados" }
  return $null
}

$origen = Join-Path $raiz "00 Por ordenar"
$archivos = Get-ChildItem -LiteralPath $origen -File -Recurse
if (-not $archivos) { Write-Host "No hay nada en '00 Por ordenar'. Pon ahi lo que quieras ordenar y vuelve a abrir este archivo."; Read-Host "Enter para salir"; exit }
$plan = foreach ($f in $archivos) { $d = Destino $f; if ($d) { [pscustomobject]@{ Archivo = $f; Carpeta = $d } } }
$plan | Group-Object Carpeta | ForEach-Object { Write-Host ("{0,4}  ->  {1}" -f $_.Count, $_.Name) }
$sinDestino = $archivos.Count - @($plan).Count
if ($sinDestino -gt 0) { Write-Host "$sinDestino archivo(s) de otro tipo se quedan en '00 Por ordenar'." }
if ((Read-Host "Mover estos archivos? (s/n)") -ne "s") { Write-Host "No se movio nada."; exit }
foreach ($p in $plan) {
  $dir = Join-Path $raiz $p.Carpeta; New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $dest = Join-Path $dir $p.Archivo.Name; $i = 2
  while (Test-Path -LiteralPath $dest) { $dest = Join-Path $dir ("{0} ({1}){2}" -f $p.Archivo.BaseName, $i, $p.Archivo.Extension); $i++ }
  Move-Item -LiteralPath $p.Archivo.FullName -Destination $dest
}
Write-Host "Listo: $(@($plan).Count) archivo(s) ordenados."
Read-Host "Enter para salir"
