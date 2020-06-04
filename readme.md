Sublime-text3-sass
====================================

### 下载安装Sublime Text3关于Sass编译相关插件
    插件1：SASS

    插件2：SASS Build

    插件3：SublimeOnSaveBuild  实现保存即编译


第一步
-----------------------------------
Tools->编译系统->编译新系统
第二步
-----------------------------------
粘贴如下代码到新建文档中：

    {
        "cmd": ["sass", "--update", "$file:${file_path}/../css/${file_base_name}.css"],
        "selector": "source.sass, source.scss",
        "line_regex": "Line ([0-9]+):",

        "osx":
        {
            "path": "/usr/local/bin:$PATH"
        },

        "windows":
        {
            "shell": "true"
        }
    }

第三步.存储
---------------------------------------
保存到C:\Users\Administrator(这里用户名可变)\AppData\Roaming\Sublime Text 3\Packages、下，新建EpcSass文件夹，保存名字为EpcSass.sublime-build

第四步.选择编译类型
---------------------------------------
Toos>编译系统>EpcSass
做某个项目时更改此文件相关CSS生成路径就OK了。


构建系统变量
=======================================
在EpcSass.sublime-build 中包括如下构建系统变量

    $file_path          当前文件所在路径, 比如 C:\Files.
    $file               当前文件的完整路径, 比如 C:\Files\Chapter1.txt.
    $file_name          当前文件的文件名, 比如 Chapter1.txt.
    $file_extension     当前文件的扩展名, 比如 txt.
    $file_base_name     当前文件仅包含文件名的部分, 比如 Document.
    $packages           Packages 文件夹的完整路径.
    $project            当前项目文件的完整路径.
    $project_path       当前项目文件的路径.
    $project_name       当前项目文件的名称.
    $project_extension  当前项目文件的扩展部分.
    $project_base_name  当前项目仅包括名的部分.
    
    更改sass编译方式
=======================================    
打开你的ruby中sass的安装位置

D:\Software\Ruby22\Ruby24-x64\lib\ruby\gems\2.4.0\gems\sass-3.5.6\lib\sass
找到并来用编译自器打开engine.rb
大概2113在170行左右,  找到这行代码:

DEFAULT_OPTIONS = {
      :style => :compact,
      :load_paths => [],
      :cache => true,
      :cache_location => './.sass-cache',
      :syntax => :sass,
      :filesystem_importer => Sass::Importers::Filesystem
    }.freeze
其中的:style=>:compact就是我们sass编译后css的排版样式;

这里有四个5261值,分别对应四种样式,用下面这四个值中的一个替换compact就可以了

nested嵌套,expanded展开,compact紧凑,compressed压缩

=======================================
一台电脑上有多个公钥时在.ssh文件内建config文件并编辑如下(本人pc上配置):
=======================================
    Host me.github.com
    HostName github.com
    User weiyao86
    IdentityFile  ~/.ssh/id_rsa

    Host work.github.com
    HostName github.com
    User ServisionFrontend
    IdentityFile  ~/.ssh/id_rsa.servision
