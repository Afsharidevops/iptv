import { DATA_DIR } from '$lib/constants'
import * as sdk from '@iptv-org/sdk'

export async function loadData() {
  const dataManager = new sdk.DataManager({ dataDir: DATA_DIR })
  await dataManager.downloadToMemory()
  dataManager.loadFromMemory()

  return dataManager.getRawData()
}

export async function loadDataFromDisk() {
  const dataManager = new sdk.DataManager({ dataDir: DATA_DIR })
  await dataManager.loadFromDisk()

  return dataManager.getRawData()
}
