# PHP Class Generator (Composer PSR-4)

VS Code extension which helps creating PHP classes in project which is configured to use Composer PSR-4 autoloading.

> Note: composer.json (with PSR-4 autoloading configured) file is required in project (workspace).

Old version of this extension can be found [here](https://marketplace.visualstudio.com/items?itemName=damianbal.vs-phpclassgen) but it doesn't support PSR-4.

## Demo

### Creating class using wizard

![Wizard](https://i.imgur.com/SUFLYbO.gif)

### Inserting namespace

![Namespace](https://i.imgur.com/7X6YDx6.gif)

### Inserting class/interface/trait

![Class](https://i.imgur.com/zYQqJdY.gif)

### Inserting namespace (using context menu)

![Class](https://i.imgur.com/DU3ru61.gif)

## Features

- Generate PHP class/interfce/trait (using wizard)
- Insert PHP class/interface/trait (inserting to already created file)
- Insert PSR-4 Namespace at selected line in PHP file with command or context menu

## Commands

- "PHP Class Generator: Generate class/interface/trait (Wizard)"
- "PHP Class Generator: Insert PSR-4 namespace"
- "PHP Class Generator: Insert PSR-4 class/interface/trait"

## Settings
- `phpClassGenerator.composerJsonLocation` - Specify where composer.json file is located. Defaults: `composer.json`
