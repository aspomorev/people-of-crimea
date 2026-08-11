const fs = require('fs')
const path = require('path')
const os = require('os')

const SOURCE_ROOT = 'C:/Projects/crimea-code/Texts_Etnokulturniy_code'
const DEST_ROOT =
  'C:/Projects/crimea-code/people-of-crimea/src/assets/5-concrete-route-city/data'

const PEOPLE_MAP = [
  { prefix: 'Армяне.', people: 'Армяне' },
  { prefix: 'Греки.', people: 'Греки' },
  { prefix: 'Караимы.', people: 'Караимы' },
  { prefix: 'Крым. татары.', people: 'Крымские татары' },
  { prefix: 'Генуэзсцы.', people: 'Итальянцы' },
  { prefix: 'Генуэзцы.', people: 'Итальянцы' },
]

const CITY_MAP = {
  Балклава: 'Балаклава',
  Симфорополь: 'Симферополь',
}

function mapSourceFolder(folderName) {
  const rule = PEOPLE_MAP.find((item) => folderName.startsWith(item.prefix))
  if (!rule) return null
  const rawCity = folderName.slice(rule.prefix.length).trim()
  return { people: rule.people, city: CITY_MAP[rawCity] ?? rawCity }
}

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\bцерковь\b/g, 'храм')
    .replace(/\bкенасса\b/g, 'кенаса')
    .replace(/\bбашни\b/g, 'башня')
    .replace(/«|»|"/g, '')
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
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
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
  return (hits / landmarkTokens.length) * 70 + (hits / fileTokens.length) * 30
}

function pngSize(filePath) {
  try {
    const buf = fs.readFileSync(filePath)
    if (buf[0] !== 0x89) return null
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
  } catch {
    return null
  }
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
    if (
      usedLandmarks.has(candidate.landmarkIndex)
      || usedFiles.has(candidate.file)
    ) {
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

function parseLandmarkTitle(folderName) {
  const match = folderName.match(/^\d+\.\s+(.+)$/)
  return (match?.[1] ?? folderName).trim()
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function backupExistingAssets(peopleDir, backupRoot) {
  const assets = []
  if (!fs.existsSync(peopleDir)) return assets

  for (const cityEnt of fs.readdirSync(peopleDir, { withFileTypes: true })) {
    if (!cityEnt.isDirectory()) continue
    const cityDir = path.join(peopleDir, cityEnt.name)

    for (const landmarkEnt of fs.readdirSync(cityDir, { withFileTypes: true })) {
      if (!landmarkEnt.isDirectory()) continue
      if (!/^\d+\.\s+/.test(landmarkEnt.name)) continue

      const landmarkDir = path.join(cityDir, landmarkEnt.name)
      const title = parseLandmarkTitle(landmarkEnt.name)
      const safeId = Buffer.from(`${cityEnt.name}::${landmarkEnt.name}`).toString('hex')
      const backupDir = path.join(backupRoot, safeId)
      fs.mkdirSync(backupDir, { recursive: true })

      const imageSrc = path.join(landmarkDir, 'image.png')
      const iconSrc = path.join(landmarkDir, 'icon.png')
      const imagePath = path.join(backupDir, 'image.png')
      const iconPath = path.join(backupDir, 'icon.png')

      let hasImage = false
      let hasIcon = false
      if (fs.existsSync(imageSrc)) {
        fs.copyFileSync(imageSrc, imagePath)
        hasImage = true
      }
      if (fs.existsSync(iconSrc)) {
        fs.copyFileSync(iconSrc, iconPath)
        hasIcon = true
      }

      assets.push({
        title,
        imagePath: hasImage ? imagePath : null,
        iconPath: hasIcon ? iconPath : null,
      })
    }
  }

  return assets
}

function wipeLandmarkDirs(cityDir) {
  if (!fs.existsSync(cityDir)) return

  const trash = fs.mkdtempSync(path.join(os.tmpdir(), 'landmarks-wipe-'))
  let index = 0

  for (const entry of fs.readdirSync(cityDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (!/^\d+\./.test(entry.name)) continue

    const from = path.join(cityDir, entry.name)
    const to = path.join(trash, `${index++}`)
    fs.renameSync(from, to)
  }

  fs.rmSync(trash, { recursive: true, force: true })
}

function takeBestExistingAsset(title, existingAssets, kind, usedPaths) {
  let best = null
  for (const asset of existingAssets) {
    const filePath = kind === 'photo' ? asset.imagePath : asset.iconPath
    if (!filePath || usedPaths.has(filePath)) continue
    const score = matchScore(title, asset.title)
    if (score < 40) continue
    if (!best || score > best.score) {
      best = { filePath, score, title: asset.title }
    }
  }
  return best
}

const sourceFolders = fs
  .readdirSync(SOURCE_ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort((a, b) => a.localeCompare(b, 'ru'))

const jobs = sourceFolders
  .map((folderName) => {
    const mapped = mapSourceFolder(folderName)
    if (!mapped) return null
    return { folderName, ...mapped }
  })
  .filter(Boolean)

const citiesByPeople = new Map()
for (const job of jobs) {
  if (!citiesByPeople.has(job.people)) citiesByPeople.set(job.people, new Set())
  citiesByPeople.get(job.people).add(job.city)
}

const backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'landmarks-backup-'))
const existingByPeople = new Map()
const usedExistingPaths = new Set()

try {
  for (const people of citiesByPeople.keys()) {
    existingByPeople.set(
      people,
      backupExistingAssets(path.join(DEST_ROOT, people), path.join(backupRoot, people)),
    )
  }

  for (const [people, cities] of citiesByPeople.entries()) {
    for (const city of cities) {
      wipeLandmarkDirs(path.join(DEST_ROOT, people, city))
    }
  }

  const missing = []
  const summary = []

  for (const job of jobs) {
    const { folderName, people, city } = job
    const sourceDir = path.join(SOURCE_ROOT, folderName)
    const destCityDir = path.join(DEST_ROOT, people, city)
    fs.mkdirSync(destCityDir, { recursive: true })

    const entries = fs.readdirSync(sourceDir)
    const mdFiles = entries
      .filter((f) => f.toLowerCase().endsWith('.md'))
      .sort((a, b) => a.localeCompare(b, 'ru'))
    const imageFiles = entries.filter((f) => isImage(f))
    const existingAssets = existingByPeople.get(people) ?? []

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
      const folderLandmarkName = `${landmark.index + 1}. ${landmark.title}`
      const destLandmarkDir = path.join(destCityDir, folderLandmarkName)
      fs.mkdirSync(destLandmarkDir, { recursive: true })

      const mdText = fs.readFileSync(path.join(sourceDir, landmark.mdFile), 'utf8')
      fs.writeFileSync(
        path.join(destLandmarkDir, 'content.html'),
        mdToContentHtml(mdText),
        'utf8',
      )

      let photoOk = false
      let iconOk = false

      const photo = photoMatches.get(landmark.index)
      if (photo) {
        copyFile(path.join(sourceDir, photo.file), path.join(destLandmarkDir, 'image.png'))
        photoOk = true
      } else {
        const fallback = takeBestExistingAsset(
          landmark.title,
          existingAssets,
          'photo',
          usedExistingPaths,
        )
        if (fallback) {
          copyFile(fallback.filePath, path.join(destLandmarkDir, 'image.png'))
          usedExistingPaths.add(fallback.filePath)
          photoOk = true
        }
      }

      const icon = iconMatches.get(landmark.index)
      if (icon) {
        copyFile(path.join(sourceDir, icon.file), path.join(destLandmarkDir, 'icon.png'))
        iconOk = true
      } else {
        const fallback = takeBestExistingAsset(
          landmark.title,
          existingAssets,
          'icon',
          usedExistingPaths,
        )
        if (fallback) {
          copyFile(fallback.filePath, path.join(destLandmarkDir, 'icon.png'))
          usedExistingPaths.add(fallback.filePath)
          iconOk = true
        }
      }

      if (!photoOk) missing.push(`${people};${city};фото`)
      if (!iconOk) missing.push(`${people};${city};иконка`)

      summary.push({
        people,
        city,
        landmark: folderLandmarkName,
        photo: photoOk ? 'ok' : 'MISSING',
        icon: iconOk ? 'ok' : 'MISSING',
        missingDetail: [
          !photoOk ? `${people};${city};${landmark.title};фото` : null,
          !iconOk ? `${people};${city};${landmark.title};иконка` : null,
        ].filter(Boolean),
      })
    }
  }

  console.log('=== MISSING (народ;город;тип) ===')
  const missingDetailed = summary.flatMap((row) => row.missingDetail)
  if (!missingDetailed.length) {
    console.log('(нет)')
  } else {
    for (const row of missingDetailed) console.log(row)
  }

  console.log('\n=== MISSING compact (народ;город;тип) ===')
  for (const row of missing) console.log(row)

  console.log(`\nLandmarks: ${summary.length}`)
  console.log(`Missing images: ${missingDetailed.length}`)
} finally {
  fs.rmSync(backupRoot, { recursive: true, force: true })
}
