const fs = require('fs')
const path = require('path')

const SOURCE_ROOT = 'C:/Projects/crimea-code/Texts_Etnokulturniy_code'
const DEST_ROOT =
  'C:/Projects/crimea-code/people-of-crimea/src/assets/5-concrete-route-city/data/Греки'

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/ё/g, 'е')
    // «церковь» и «храм» в исходниках часто взаимозаменяемы (напр. Святого Илии).
    .replace(/\bцерковь\b/g, 'храм')
    .replace(/[^a-zа-я0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(text) {
  const stop = new Set(['им', 'и', 'в', 'на', 'с', 'св', 'м'])
  return normalize(text)
    .split(' ')
    .filter((t) => t.length > 1 && !stop.has(t))
}

function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i += 1) dp[i][0] = i
  for (let j = 0; j <= n; j += 1) dp[0][j] = j
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

function tokensSimilar(a, b) {
  if (a === b) return true
  if (a.includes(b) || b.includes(a)) return true
  const maxLen = Math.max(a.length, b.length)
  if (maxLen <= 4) return false
  return levenshtein(a, b) <= Math.max(1, Math.floor(maxLen * 0.25))
}

function cleanImageBaseName(name) {
  return path
    .parse(name)
    .name.replace(/^фото\s+/i, '')
    .replace(/^плашка\s+/i, '')
    .trim()
}

function matchScore(landmarkName, fileName) {
  const landmarkTokens = tokens(landmarkName)
  const fileTokens = tokens(cleanImageBaseName(fileName))
  if (!landmarkTokens.length || !fileTokens.length) return 0

  let hits = 0
  for (const lt of landmarkTokens) {
    if (fileTokens.some((ft) => tokensSimilar(lt, ft))) hits += 1
  }

  if (hits === 0) return 0

  const coverage = hits / landmarkTokens.length
  const precision = hits / fileTokens.length
  // Prefer exact-ish names over longer "музей ..." variants for short landmarks.
  return coverage * 70 + precision * 30
}

function pngSize(filePath) {
  const buf = fs.readFileSync(filePath)
  if (buf[0] !== 0x89) return null
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
}

function isImage(name) {
  return /\.(png|jpg|jpeg|webp)$/i.test(name)
}

function isPhoto(name) {
  return /фото/i.test(name)
}

function isIconCandidate(name, fullPath) {
  if (!isImage(name) || isPhoto(name)) return false
  if (/плашка/i.test(name)) return true
  const size = pngSize(fullPath)
  return Boolean(size && size.w === 348 && size.h === 322)
}

function assignUniqueMatches(landmarks, files, predicate, minScore = 40) {
  const candidates = []
  for (const landmark of landmarks) {
    for (const file of files) {
      if (!predicate(file)) continue
      const score = matchScore(landmark.title, file)
      if (score >= minScore) {
        candidates.push({ landmarkIndex: landmark.index, file, score })
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score)
  const usedLandmarks = new Set()
  const usedFiles = new Set()
  const result = new Map()

  for (const candidate of candidates) {
    if (usedLandmarks.has(candidate.landmarkIndex) || usedFiles.has(candidate.file)) {
      continue
    }
    usedLandmarks.add(candidate.landmarkIndex)
    usedFiles.add(candidate.file)
    result.set(candidate.landmarkIndex, {
      file: candidate.file,
      score: candidate.score,
    })
  }

  return result
}

function mdToContentHtml(mdText) {
  const escaped = mdText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const withBreaks = escaped
    .split('\n')
    .map((line) => line.trimEnd())
    .join('<br />\n  <br />\n  ')

  return `<div class="text-container">\n  ${withBreaks}<br />\n  <br />\n</div>\n`
}

function removeGeneratedLandmarkDirs(cityDir) {
  if (!fs.existsSync(cityDir)) return
  for (const entry of fs.readdirSync(cityDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (!/^\d+\.\s+/.test(entry.name)) continue
    fs.rmSync(path.join(cityDir, entry.name), { recursive: true, force: true })
  }
}

const greekDirs = fs
  .readdirSync(SOURCE_ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.startsWith('Греки.'))

const report = []

for (const dirEnt of greekDirs) {
  const city = dirEnt.name.replace(/^Греки\.\s*/, '').trim()
  const sourceDir = path.join(SOURCE_ROOT, dirEnt.name)
  const destCityDir = path.join(DEST_ROOT, city)
  fs.mkdirSync(destCityDir, { recursive: true })
  removeGeneratedLandmarkDirs(destCityDir)

  const entries = fs.readdirSync(sourceDir)
  const mdFiles = entries
    .filter((f) => f.toLowerCase().endsWith('.md'))
    .sort((a, b) => a.localeCompare(b, 'ru'))
  const imageFiles = entries.filter((f) => isImage(f))

  const landmarks = mdFiles.map((mdFile, index) => ({
    index,
    mdFile,
    title: path.parse(mdFile).name,
  }))

  const photoMatches = assignUniqueMatches(landmarks, imageFiles, (f) => isPhoto(f))
  const iconMatches = assignUniqueMatches(landmarks, imageFiles, (f) =>
    isIconCandidate(f, path.join(sourceDir, f)),
  )

  for (const landmark of landmarks) {
    const folderName = `${landmark.index + 1}. ${landmark.title}`
    const destLandmarkDir = path.join(destCityDir, folderName)
    fs.mkdirSync(destLandmarkDir, { recursive: true })

    const mdText = fs.readFileSync(path.join(sourceDir, landmark.mdFile), 'utf8')
    fs.writeFileSync(
      path.join(destLandmarkDir, 'content.html'),
      mdToContentHtml(mdText),
      'utf8',
    )

    const photo = photoMatches.get(landmark.index)
    const icon = iconMatches.get(landmark.index)

    let photoStatus = 'MISSING'
    let iconStatus = 'MISSING'

    if (photo) {
      fs.copyFileSync(
        path.join(sourceDir, photo.file),
        path.join(destLandmarkDir, 'image.png'),
      )
      photoStatus = `${photo.file} (score ${photo.score.toFixed(1)})`
    }

    if (icon) {
      const iconSrc = path.join(sourceDir, icon.file)
      fs.copyFileSync(iconSrc, path.join(destLandmarkDir, 'icon.png'))
      iconStatus = `${icon.file} (score ${icon.score.toFixed(1)})`
    }

    report.push({ city, folderName, photoStatus, iconStatus })
  }
}

console.log(JSON.stringify(report, null, 2))
console.log(`\nDone. Landmarks: ${report.length}`)
