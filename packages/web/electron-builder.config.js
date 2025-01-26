/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  directories: {
    output: 'dist-electron',
    buildResources: 'public',
  },
  files: [
    'dist/**'
  ],
  extraMetadata: {
    version: process.env.VITE_APP_VERSION,
  },
  mac: {
    artifactName: "${name}-${version}-${os}-${arch}.${ext}",
  },
  win: {
    artifactName: "${name}-${version}-${os}-${arch}.${ext}",
  },
  linux: {
    artifactName: "${name}-${version}-${os}-${arch}.${ext}",
  }
}

export default config
