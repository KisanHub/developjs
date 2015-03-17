# [developjs]

[developjs] is a repository of MIT-licensed tooling to make developing JavaScript just a little bit less painful. It can be used standalone (when cloned from GitHub; remember to do `git submodule update --init --recursive`), but is intended to work closely with [classjs]. An example user of both [developjs] and [classjs] is [mongojs], a client-side [mongoDB] database driver which uses [WebSockets].

The main pieces it provides are:-

* `DevelopModule`, a synchronous JavaScript loader framework that allows one to load packages and modules, irrespective of whether they are individual files or need to be concatenated;
* Extraction of common namespace (module) logic, allowing rapid development and best-practice little files
* Removal of the need to write common boilerplate all over the place
* A simple build framework to concatenate and minify files

[developjs]: https://github.com/KisanHub/mongojs "developjs homepage"
[classjs]: https://github.com/KisanHub/mongojs "classjs homepage"
[shellfire]: https://github.com/shellfire-dev "shellfire homepage"
[mongojs]: https://github.com/KisanHub/mongojs "mongojs homepage"
[shellfire]: https://github.com/shellfire-dev "shellfire homepage"
[WebSockets]: https://www.rfc-editor.org/rfc/rfc6455.txt "WebSockets RFC 6455 Standard Reference"
[mongoDB]: https://www.mongodb.org/ "mongoDB homepage"
