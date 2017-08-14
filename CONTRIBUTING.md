# Contributing

There are multiple ways to contribute to this theme.

## Creating a new issue

Issues on this repository are always welcome, whether it's to discuss about an icon that doesn't look good, or to request a new icon to be added.

## Adding a new icon

_The following guide is not fully complete. Images may be coming in the future to better explain everything._

There are a few things to note if you want to add a new icon.
- The icon must be in SVG format. NO PNG's or JPG's.
- The icon will not have any margin and will take the maximum possible space. They are rendered at 16x16 pixels (on my screen at least), no need to reduce their size further.
- The size should be 320x320. Originally I made 32x32 PNG icons, and porting them to SVG was easier with this size. 320x320 is big enough to be looked at with any image viewer, and is exactly (you probably figured that out already) 10 times the former size.
- The icon should be clean, so that anyone can modify it by hand with a text editor (e.g. VSCode itself).
- Readability comes first. The icons are optimized with [SVGO](https://www.npmjs.com/package/svgo) when building the extension, there is no need to manually optimize the icon by replacing polygons and rects with paths and whatnot.
- The icons will be beautified automatically upon building the extension.

Example starting template :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" version="1.1">
<!--a magnificent grey square-->
    <rect width="320" height="320" x="0" y="0" fill="#7f7f7f"/>
</svg>
```

## Getting started

### Explanation on how everything works

Originally, this extension simply had a bunch of PNG icons and a `icons.json` file to put them together as a VSCode theme.
Then I started converting them all to SVG.
And as I was converting older icons to SVG, new icons were created directly as SVG's as well.
And I ended up with a lot of copying and pasting to add each new icon, because `icons.json` needs to know where to find the icon, but they were all at the exact same place, and the name used within `icons.json` was simply the name of the file minus `.svg`.
I then started working on the minimalistic version of the theme, which added a whole lot of copying and pasting, as half of the icons would stay the same, but with a grey color.

So I made an automatic generation system to let the computer do all that tedious and boring work.
The files doing this work are called `generator.sh` and `generator.js`.
They generate :
- expanded versions of the special folders
- minimalistic icons when they are simply grey versions of the simple icon (color changes without any structural change in the SVG)
- light versions of the minimalistic icons
- complete `*-icons.json` files from a `icons.json` file that only contains necessary file associations, by adding associations for generated icons and icon definitions with the paths to the SVG files

This means that for a lot of icons, you will not need to make the minimalistic versions, and the modifications to `icons.json` will be restricted just to what extension/language ID your icon is associated with.

### Getting the code and icons

First , you should clone this repository and install the dependencies :
```sh
git clone https://github.com/LaurentTreguier/vscode-simple-icons
cd vscode-simple-icons
npm install
```

### For Windows users

The `generator.sh` script is written in bash (because doing file I/O in Javascript is tedious and lengthy), and `generator.js` is used by `generator.sh` for JSON manipulation (because JSON manipulation in bash is not something I want to even try).
Because of this, a bash implementation has to be installed to be able to work on this extension. On Windows 10, WSL (Windows Subsystem for Linux) can do the job just fine.
You will simply need to [install NodeJS 6.x](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions) in the freshly installed Ubuntu bash, and then everything should just work.
On other versions of Windows however, you are on your own... (kind of, but you can still post an issue and we will sort this out somehow).

### Adding the new icon

This repository already has a `.vscode` direcory that contains the assets to beautify, generate and optimize the SVG icons, and then start a debug session of VSCode.
Simply create a new SVG icon in the `source/simple-icons` direcory (and `source/minimalistic-icons` if the automatically generated icon is no good), add one or more file association(s) in `icons.json`, and then start a debugging session.
The first launch will take a lot of time, as a lot of icons will need to be generated, but subsequent launches will only regenerate icons that have changed (it will still be slow, but certainly not as much as the first time).

_Note : Prefer language ID's to file extensions when possible, as it can sometimes cover a lot of extensions.
Powershell, for example, has 5 different file extensions that are all covered when simply using the `powershell` language ID.
Whenever a language only has one possible extension, use both the language ID and the extension. The language ID will be used if for some reason the user decides to associate the language to a file with a different extension._

## Icon design guidelines

A new icon should (obviously) be simple.
It shouldn't be complex and have a lot of details, which will often only become visual noise.

Icons are encouraged to take inspiration from official logos, but reproducing the exact logo is never a requirement (see explanation just above).
It is __strongly__ encouraged to use a 16x16 grid with 20x20 pixels squares as a reference for components of the SVG.

In some cases it makes sense to mix existing icons instead of creating an entirely new one.
For example :
There is a VSCode icon used for `.vscodeignore` files and an archive icon used for zip archives and such.
This same archive icon, but featuring a small version of the VSCode logo is used for VSIX extensions files, which are archives for VSCode and Visual Studio extensions.

### Special folders

Special folders have two specificities :
- Their color is different. For example, the `.vscode` folder uses the color from the `.vscodeignore` icon.
- They show a small, white icon. For example,  the `.vscode` folder also uses a small VSCode logo (the same as the `.vscodeignore` icon).

When an folder icon is related to another icon (just like `.vscode` and `.vscodeignore`), the folder's color should be the main color from the other icon.

The white logo should also be a smaller version of the other icon. It should have a 20px margin relative to the border of the folder so that the folder itself is still visible.

### Special files

Special files refer to variations of the basic file icon, such as JSON or plain text files for example.
This is generally used for languages that are not programmating languages but markup languages and such.

Just like folders, special files have a specific color to differentiate them from basic files.
In addition, they have a transparent pattern with (just like logos on special folders) a minimal 20px margin relative to the border of the basic file background.