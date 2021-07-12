const adbkit = require('adbkit')
const fs = require('fs')
const path = require('path')


async function application({ source }) {
  
  if (!source) {
    throw 'source is unspecified';
  }

  const client = adbkit.createClient()
  const devices = await client.listDevices();

  if (devices.length == 0) {
    throw 'There is no device connected :(';
  }
  
  let device;
  if (devices.length == 1) {
    device = devices[0];
  }

  await listPhotos(client, device, source)
}

async function listPhotos(client, device, source) {

  const destDir = path.resolve('./android-backup')

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir)
  }

  const files = await client.readdir(device.id, source)
  const filteredFiles = files.filter(it => it.isFile());
  let totalCount = filteredFiles.length;
  let proceededCount = 0;

  for(file of files) {
    const isFile = file.isFile()
    if (!isFile) continue;    
    const percentage = (proceededCount / totalCount) * 100;
    const sourcePath = path.join(source, file.name);
    const destinationPath = path.join(destDir, file.name);
    const alreadyExisted = await fileExists(path.join(destinationPath))
    if (alreadyExisted) {
      totalCount--;
      continue;
    }
    
    await pullFile(client, device, sourcePath, destinationPath);
    console.log(`Completed: ${percentage.toFixed(2)}%`)
    proceededCount++;
  }

  console.log(`backup completed (total: ${proceededCount})`)
}


function fileExists(filePath) {
  return new Promise((resolve) => {
    fs.exists(filePath, resolve)
  })
}


async function pullFile(client, device, src, dst) {
  const transfer = await client.pull(device.id, src)
  return new Promise((resolve, reject) => {
    transfer.on('end', () => resolve(dst))
    transfer.on('error', reject)
    transfer.pipe(fs.createWriteStream(dst))
  })
}


const source = process.argv[2];

application({ source }).catch(e => {
  console.error(e);
  process.exit(1);
})