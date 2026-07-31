const { cpSync, existsSync, rmSync } = require('fs')
const { join } = require('path')
const { execSync } = require('child_process')

const releaseDir = join(__dirname, '..', 'release')
const appName = 'MQTT Explorer Alt.app'

function findApp(dir) {
  const direct = join(dir, appName)
  if (existsSync(direct)) return direct

  for (const sub of ['mac-arm64', 'mac', 'mac-universal']) {
    const candidate = join(dir, sub, appName)
    if (existsSync(candidate)) return candidate
  }

  throw new Error(`${appName} bulunamadı. Önce "npm run build:mac" çalıştırın.`)
}

const source = findApp(releaseDir)
const target = join('/Applications', appName)

if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true })
}

cpSync(source, target, { recursive: true })
execSync(`xattr -cr "${target}"`, { stdio: 'inherit' })

console.log(`\n✓ ${appName} Applications klasörüne kuruldu.`)
console.log('  Spotlight veya Launchpad\'den "MQTT Explorer Alt" ile açabilirsiniz.\n')
