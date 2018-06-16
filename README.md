Coco
====

![Project status][status]

Project of CrossMediaVisualization2017@ZJU.
Storyline for Movie "Coco". Third-party Javascript libraries [Three.js][threejs], [Popup.js][popupjs] and [TweenLite.js][tweenlitejs] are used in this project.

Open [GitHub Pages][pages] for playing!

Table of Contents
-----------------

  * [Requirements](#requirements)
  * [Usage](#usage)
  * [Structure](#structure)
  * [Snapshot](#snapshot)
  * [License](#license)
  * [Contact](#contact)

Requirements
------------

Berryfolio requires the following Python version and Python packages to run:

  * [Python][Python] 2.7
  * [Flask][Flask] 1.0.2

`npm` and `http-server` are alternatives to run the server locally

Usage
-----

You can run the server on localhost by executing this script:
```cmd
$ RUN.bat
```

If you are using `http-server` through `npm`, try this:
```cmd
$ http-server .
```

Done! Now you can open [http://localhost:8080/Coco.html][localhost] for fun!

Structure
-------------

```
Coco
├─Coco.html         // Entrance
└─static
    ├─css
    ├─data
    ├─font
    ├─image
    ├─js
    │  ├─easing
    │  └─libs
    └─model
```

Snapshot
--------

![][S0]  

![][S1]  

![][S2]  

![][S3]  

![][S4]  

![][S5]  

![][S6]  

![][S7]  

![][S8]  

![][S9]  

License
-------

Coco is licensed under the [MIT][MIT] license 
while all media files related are under [CC BY-NC-ND 4.0][CC BY-NC-ND 4.0].  
Copyright &copy; 2017, [Yunzhe][yunzhe], [Asaki][asaki].

Contact
-------

For any question, please mail to [yunzhe@zju.edu.cn][Mail]



[status]: https://img.shields.io/badge/status-finished-green.svg "Project Status: Finished"
[pages]: https://yunzhezju.github.io/Coco/
[threejs]: https://github.com/mrdoob/three.js
[popupjs]: http://docs.toddish.co.uk/popup
[tweenlitejs]: https://greensock.com/tweenlite

[Python]: https://www.python.org/downloads/
[Flask]: https://github.com/pallets/flask

[localhost]: http://localhost:8080/Coco.html

[S0]: docs/0.png
[S1]: docs/1.png
[S2]: docs/2.png
[S3]: docs/3.png
[S4]: docs/4.png
[S5]: docs/5.png
[S6]: docs/6.png
[S7]: docs/7.png
[S8]: docs/8.png
[S9]: docs/9.png

[MIT]: /LICENCE_MIT.md
[CC BY-NC-ND 4.0]: /LICENCE_CC_BY_NC_ND_4_0.md
[yunzhe]: https://github.com/YunzheZJU
[asaki]: https://gitee.com/AAAAAsaki

[Mail]: mailto:yunzhe@zju.edu.cn