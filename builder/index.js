const fs = require('fs')
const path = require('path')
const yaml = require('yaml')
const { ncp } = require('ncp')
const Avatars = require('@dicebear/avatars').default
const maleSprites = require('@dicebear/avatars-male-sprites').default
const femaleSprites = require('@dicebear/avatars-female-sprites').default

const maleAvatars = new Avatars(maleSprites)
const femaleAvatars = new Avatars(femaleSprites)

const buildPath = path.resolve(__dirname, '../docs/')
const dataPath = path.resolve(__dirname, '../data/')
const webPath = path.resolve(__dirname, '../web/')
const avatarsPath = path.join(buildPath, 'avatars/')
const profileJsonPath = path.join(buildPath, 'profiles.json')

const copyWeb = async () => {
  console.log('- Copy a web path into build path')
  if (fs.existsSync(buildPath)) {
    await fs.rmSync(buildPath, { recursive: true })
  }
  await fs.mkdirSync(buildPath)
  await ncp(webPath, buildPath)
}

const bundleData = async () => {
  console.log('- Get all data profiles from data/*.yml')
  if (fs.existsSync(avatarsPath)) {
    await fs.rmSync(avatarsPath, { recursive: true })
  }
  await fs.mkdirSync(avatarsPath)
  const json = []
  const profiles = await fs.readdirSync(dataPath)
  for (const profile of profiles) {
    console.log(`  - ${profile}`)
    const ymlPath = path.join(dataPath, profile)
    const content = await fs.readFileSync(ymlPath, { encoding: 'utf-8' })
    const parsed = yaml.parse(content)
    parsed.file_name = profile.slice(0, -4)
    const avatarPath = path.join(avatarsPath, parsed.file_name + '.svg')
    await fs.writeFileSync(avatarPath, createAvatar(parsed))
    json.push(parsed)
  }
  console.log('- Write a .json file', json)
  await fs.writeFileSync(profileJsonPath, JSON.stringify(json))
}

const createAvatar = ({ file_name, gender }) => {
  return gender === 'male'
    ? maleAvatars.create(file_name)
    : femaleAvatars.create(file_name)
}

const build = async () => {
  console.log('Building an application...')
  await copyWeb()
  await bundleData()
  console.log('✔ Done!')
}

build()
