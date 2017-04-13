# eos-adminui

作为Saves项目的一个模块，该模块我将其命名为eos-adminui，主要功能是调用后台api为前端提供数据。

# 功能划分

* 鉴权
  
  1. 登录(POST /api/auth)
      
      输入：

        参数名     |  类型  |  是否必需   |　描述
        ----------|--------|:----------:|------------------------
        ｕsername | string |是          |　用户名
        password  | string |是          |　密码
  
  2. 注销(DELETE /api/auth)

* 管理
  
  1. 查询加密方式(GET /api/cryptoes)
  2. 查询文件列表(GET /api/filelist)
  2. 上传(POST /api/files)
      
      输入：
        
        参数名       |  类型    | 是否必需 | 描述
        ------------|----------|:-------:|------
        visibility  |  string  |   否    | 指定哪些人可见，默认public
        crypto      |  string  |   否    | 加密方式，默认rc4
        key         |  string  |   否    | 加密密码，没有的时候取默认密码
  
  3. 下载(GET /api/files)
      
      输入：
        
        参数名     |  类型  |  是否必需   |　描述
        ----------|--------|:---------:|------------------------
        uuid      | string |  是        |　文件的uuid

# 许可
MPL v. 2. See [LICENSE](./LICENSE).
