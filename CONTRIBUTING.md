# Contributing

There are multiple ways to contribute to this theme.

## Creating a new issue

Issues on this repository are always welcome, whether it's to discuss about an icon that doesn't look good, or to request a new icon to be added.

__The following guide is not complete. Images are coming in the future to better explain everything.__

## Adding a new icon

There are a few things to note if you want to add a new icon.
- The icon must be in SVG format. You may see a few PNG ones as I started by making only PNG's, but there should all be eradicated soon enough.
- The icon will not have any margin and will take the maximum possible space. They are rendered at 16x16 pixels on a 1080p screen, no need to reduce their size.
- The size should be 320x320. Originally I made 32x32 PNG icons, and porting them to SVG was easier with a similar size. 320x320 is big enough to be looked at with any image viewer, and is exactly (you probably figured that out already) 10 times the former size.
- The icon should be clean, such as anyone could modify it by hand with a text editor (e.g. VSCode itself).
- Readability comes first. The icons are optimized with [SVGO](https://www.npmjs.com/package/svgo) when building the extension, there is no need to manually optimize the icon.
- The [XML tools extension](https://marketplace.visualstudio.com/items?itemName=DotJoshJohnson.xml) can format the SVG for you.

Example starting template :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg 
    xmlns="http://www.w3.org/2000/svg" version="1.1" width="320" height="320" viewbox="0 0 320 320">
    <!--a magnificent grey rectangle-->
    <rect x="0" y="0" width="320" height="320" fill="#7f7f7f"/>
</svg>
```

## Getting started

First , you should clone this repository and install the dependencies :
```sh
git clone https://github.com/LaurentTreguier/vscode-simple-icons
npm install
```

This repository already has a `.vscode` direcory that contains the assets to optimize the SVG icons and start a debug session of VSCode. Simply create a new SVG icon in the `source` direcory and add a file association in `icons.json`, and then start a debugging session.

_Note : Prefer language ID's to file extensions when possible, as it can sometimes cover a lot of extensions. Powershell, for example, has 5 different file extensions that are all covered when simply using the `powershell` language ID._

## Icon design guidelines

A new icon should (obviously) be simple. It shouldn't be complex and have a lot of details, which will often become visual noise.

Icons are encouraged to take inspiration from official logos, but reproducing the exact logo is never a requirement (see explanation above).

In some cases it makes sense to mix existing icons. There is a VSCode icon used for `.vscodeignore` files and an archive icon used for zip archives and such. This archive icon featuring a small version of the VSCode logo is used for VSIX extensions files, which are archives for VSCode and Visual Studio extensions.

### Special folders

Special folders have two specificities :
- Their color is different. For example, the `.vscode` folder uses the color from the `.vscodeignore` icon.
- They show a small, white icon. For example,  the `.vscode` folder also uses a small VSCode logo (the same as the `.vscodeignore` icon).

When an folder icon is related to another icon (just like `.vscode` and `.vscodeignore`), the folder's color should be the main color from the other icon.

The white logo should also be a smaller version of the other icon. It should have a 20px margin from the border of the folder so that the folder itself is still visible.

### Special files

Special files refer to variations of the basic file icon, such as JSON or plain text files for example.

Just like folders, special files have a specific color to differentiate them from basic files. In addition, they have a transparent pattern that have (just like logos on special folders) a minimal 20px margin.