# Android Photos Backup

A script for pulling and matching files from Android device.

### Install

```sh
npm i -g android-photos-backup
```

> You may need to install ADB as well.

### Usage

Make sure at least 1 device is connected.

```sh
android-photos-backup /sdcard/DCIM/Camera
```

It will create a directory `android-backup` inside the current directory.

Files that are already copied will be ignored.
