const router = require('express').Router();
const bodyParser = require('body-parser');
const temp = require('temp');
const logger = require('./util/logger');
const exec = require('child_process').exec;

const jsonParser = bodyParser.json({
  type: () => true
});

const knownVolumes = new Map();

router.post('/Plugin.Activate', (req, res) => {
  logger.debug('Request to activate');
  res.send({
    Implements: ['VolumeDriver']
  });
});

router.post('/VolumeDriver.Create', jsonParser, (req, res, next) => {
  const volumeName = req.body.Name;
  const bucket = req.body.Opts.bucket;
  logger.debug('Request to create volume called ' + volumeName + ', for bucket ' + bucket);

  if (knownVolumes.has(volumeName)) {
    res.send({
      Err: ''
    });
  } else {
    temp.mkdir(volumeName, (err, dirPath) => {
      if (err) return next(err);

      logger.debug("Adding " + dirPath + " for " + volumeName);

      knownVolumes.set(volumeName, {
        bucket: bucket,
        mount: dirPath
      });
      res.send({
        Err: ''
      });
    });
  }
});

router.post('/VolumeDriver.Get', jsonParser, (req, res) => {
  const volumeName = req.body.Name;
  const config = knownVolumes.get(volumeName);
  logger.debug('Request to get info by volume name: ' + volumeName);

  if (config) {
    res.send({
      Volume: {
        Name: volumeName,
        Mountpoint: config.mount
      },
      Err: ''
    });
  } else {
    res.send({
      Err: 'Volume not found'
    });
  }
});
router.post('/VolumeDriver.Path', jsonParser, (req, res) => {
  const volumeName = req.body.Name;
  const config = knownVolumes.get(volumeName);
  logger.debug('Request to get path of volume : ' + volumeName);

  if (config) {
    logger.debug(volumeName + ' exists, so sending back a mountpoint');
    res.send({
      Mountpoint: config.mount,
      Err: ''
    });
  } else {
    res.send({
      Err: ''
    });
  }
});

router.post('/VolumeDriver.Remove', jsonParser, (req, res) => {
  const volumeName = req.body.Name;
  logger.debug('Request to remove volume');

  if (knownVolumes.has(volumeName)) {
    knownVolumes.delete(volumeName);
    res.send({
      Err: ''
    });
  } else {
    res.send({
      Err: 'Volume not found'
    });
  }
});

router.post('/VolumeDriver.List', (req, res) => {
  logger.debug('Request to list volumes');
  const vols = [];
  knownVolumes.forEach((v, k) => {
    vols.push({
      Name: k,
      Mountpoint: v.mount
    });
  });

  res.send({
    Volumes: vols,
    Err: ''
  });
});

router.post('/VolumeDriver.Mount', jsonParser, (req, res, next) => {
  const volumeName = req.body.Name;
  const config = knownVolumes.get(volumeName);
  const mountPoint = config.mount;
  logger.debug('Request to mount ' + volumeName);
  logger.debug('Attempting to mount local drive ' + mountPoint);

  exec('s3fs -o allow_other ' + config.bucket + ' ' + mountPoint, (err) => {
    if (err) return next(err);

    res.send({
      Mountpoint: mountPoint,
      Err: ''
    });
  });
});

router.post('/VolumeDriver.Unmount', jsonParser, (req, res, next) => {
  const volumeName = req.body.Name;
  const config = knownVolumes.get(volumeName);
  const mountPoint = config.mount;
  logger.debug('Request to unmount ' + volumeName);
  logger.debug('Attempting to unmount local drive ' + mountPoint);

  exec('umount ' + mountPoint, (err) => {
    if (err) return next(err);

    res.send({
      Err: ''
    });
  });
});

module.exports = router;
