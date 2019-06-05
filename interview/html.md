# html
> ### html5都有哪些新的特性？移除了哪些元素？
#### 1、add: header|footer|nav|sction|article|data|datetime|url|email|range|time|canvas|video
#### 2、del: big|center|frame|basefont|font|s|strike|tt|u|frameset|noframes

<br>
> ### cookie & session

||来源|存储位置|大小|安全|销毁方式|特点|
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
|cookie|服务器|浏览器|4KB|轻松访问|cookie过期|与js交换数据方便、获取用户信息方便|
|session|服务器|服务器|无限量|不好访问|session-destory()|高效、安全、不依赖浏览器、唯一性|

<br>
> ### SEO标签
#### 1、title|descript|keyword
#### 2、less div more 专业标签
#### 3、meta|nav|header|main|article|sectopn|aside|footer|figure|picture|time|video|audio|lt|strong|h1~h6

<br>
> ### BOM & DOM

||缩写|中文|描述|
|:-|:-:|:-:|:-:|
|BOM|Browser Object Model|浏览器对象模型|对浏览器进行访问和操作，比如谈窗口、改变状态栏|
|DOM|Document Object Model|文档对象模型|对HTML的API进行操作，把页面规划成由节点层级构成的文档|
#### BOM: document|frames[]|history|location|navigator|screen
#### DOM: forms[]|images[]|layers[]|links[]|anchors[]|applets[]|areas[]|embeds[]

<br>
> ### link和@import有什么区别

||来源|加载方式|兼容|区别|
|:-|:-:|:-:|:-:|:-:|
|link|HTML标签|与页面同时加载|基本兼容|可用js控制DOM改变|
|import|CSS提供|等页面加载完后再加载|不兼容ie5及以下|不可用js控制DOM改变|
