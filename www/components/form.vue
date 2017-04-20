<template>
    <div class="row no-gutters">
        <div class="col-md-2 col-12 slide-nav">
            <ul class="nav flex-column nav-pills">
                <li class="nav-item">
                    <a class="all nav-link active" href="javascript:void(0);">
                        <i class="fa fa-key" aria-hidden="false">　加密存储</i>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="documents nav-link" href="javascript:void(0);">
                        <i class="fa fa-folder-open-o" aria-hidden="true">　明文存储</i>
                    </a>
                </li>
                <li class="nav-tabs"></li>
                <li class="nav-item">
                    <a class="nav-link" v-on:click="logout" href="javascript:void(0);">
                        <i class="fa fa-sign-out" aria-hidden="true">　注销</i>
                    </a>
                </li>
            </ul>
        </div>
        <div class="col-md-10 push-md-2 col-12">
            <div class="main container-fluid" id="content">
                <div v-if="error" class="alert alert-danger">{{error.message}}</div>
                <form action="/api/files" method="post" enctype="multipart/form-data" @submit.prevent="submit">
                    <div class="form-group">
                        <input type="file" name="files[]"
                               class="form-control-file"
                               aria-describedby="fileHelp"
                               @change="selectFiles"
                               multiple>
                        <small id="fileHelp" class="form-text text-muted">可以选择多个文件进行加密上传，但可见性＼密码＼加密方式需一致，否则请分次上传</small>
                    </div>
                    <div class="form-group" v-if="files">
                        <label for="filesTable">选定的文件</label>
                        <table class="table" id="filesTable">
                            <thead class="thead-default">
                            <tr>
                                <th>文件名</th>
                                <th>大小(Byte)</th>
                                <th>文件类型</th>
                            </tr>
                            </thead>
                            <tbody class="table-striped">
                            <tr v-for="item in files">
                                <td>{{item.name}}</td>
                                <td>{{item.size}}</td>
                                <td>{{item.type}}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <fieldset class="form-group">
                        <legend>加密属性</legend>

                        <div class="row">
                            <div class="col-sm-2">可见性</div>
                            <div class="col-sm-10">
                                <div class="form-check form-check-inline">
                                    <label class="form-check-label">
                                        <input type="radio" class="form-check-input" name="visibility" value="public"
                                               checked>
                                        Public
                                    </label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <label class="form-check-label">
                                        <input type="radio" class="form-check-input" name="visibility" value="owner">
                                        Owner
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="key" class="col-sm-2 col-form-label">密钥</label>
                            <div class="col-sm-10">
                                <input type="password" class="form-control" id="key" name="key" placeholder="密钥">
                            </div>
                        </div>
                    </fieldset>
                    <button type="submit" class="btn btn-primary">上传</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
  export default {
    data () {
      return {
        error: null,
        files: null
      }
    },
    mounted () {
      $('.nav-pills a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
      });
    },
    methods: {
      logout () {
        $.ajax({
          url: '/api/auth',
          type: 'delete'
        })
          .done(() => {
            this.$router.push('/login');
          });
      },
      selectFiles (e) {
        if (e.target.files.length) {
          this.files = e.target.files;
        } else {
          this.files = null;
        }
      },
      submit (e) {
        const formData = new FormData(e.target);
        $.ajax({
          url:'/api/files',
          type: 'post',
          data: formData,
          cache: false,
          processData: false,
          contentType: false
        })
          .done((data) => {
            this.$parent.modal_title = "上传结果";
            this.$parent.results = data;
            console.log(data);
            $("#myModal").modal('show');
          })
          .fail((xhr) => {
            this.error = JSON.parse(xhr.responseText);
          });
      }
    }
  }
</script>