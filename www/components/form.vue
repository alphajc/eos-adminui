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
                    <a class="documents nav-link disabled" href="javascript:void(0);">
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
                    <div class="form-group row">
                        <label class="custom-file col-sm-5">
                            <input type="file"
                                   name="files[]"
                                   class="form-control-file custom-file-input"
                                   aria-describedby="fileHelp"
                                   @change="selectFiles"
                                   multiple>
                            <span class="custom-file-control"></span>
                        </label>
                        <small id="fileHelp" class="form-text text-muted col-sm-7 align-middle">可以选择多个文件进行加密上传，但可见性＼密码＼加密方式需一致，否则请分次上传</small>
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
                    <div v-if="progress">
                        <div class="progress">
                            <div role="progressbar"
                                 v-bind:class="['progress-bar', finished ? 'bg-success' : 'bg-info']"
                                 v-bind:style="{ width: progress + '%', height: '1px' }"
                                 v-bind:aria-valuenow="progress"
                                 aria-valuemin="0"
                                 aria-valuemax="100"></div>
                        </div>
                        <div v-bind:class="['alert', finished ? 'alert-success' : 'alert-info']" role="alert">
                            <strong>{{prompt_title}}</strong> {{prompt_text}}
                        </div>
                    </div>
                    <h3>加密属性</h3>
                    <table class="table table-responsive">
                        <tbody>
                        <tr>
                            <td scope="row">加密算法</td>
                            <td>
                                <select class="custom-select" name="crypto">
                                    <option selected>请选择算法</option>
                                    <template v-for="crypto in cryptoes">
                                        <option v-bind:value="crypto">{{crypto}}</option>
                                    </template>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td scope="row">可见性</td>
                            <td>
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
                            </td>
                        </tr>
                        <tr>
                            <td scope="row"><label for="key" class="col-form-label">密钥</label></td>
                            <td>
                                <input type="password" class="form-control" id="key" name="key" placeholder="密钥">
                            </td>
                        </tr>
                        </tbody>
                    </table>
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
        files: null,
        progress: 0,
        finished: false,
        prompt_title: "",
        prompt_text: "",
        cryptoes: []
      }
    },
    created () {
      $.get('/api/cryptoes').done((data) => {
        this.cryptoes = data;
      }).fail(() => {
        this.error = {message: "获取加密算法失败，请重新刷新页面！"};
      })
    },
    mounted () {
      $('.nav-pills a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
      });
      $('.navbar-nav .upload').tab('show');
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
        this.finished = false;
        this.prompt_title = "准备中，";
        this.prompt_text = "请稍候．．．．．．";
        const formData = new FormData(e.target);
        $.ajax({
          url: '/api/files',
          type: 'post',
          data: formData,
          cache: false,
          processData: false,
          contentType: false,
          xhr: () => {
            console.log(this);
            const xhr = $.ajaxSettings.xhr();
            if (xhr.upload) {
              xhr.upload.addEventListener('progress', e => {
                this.prompt_title = "上传中，";
                this.progress = e.loaded / e.total * 100;
              }, false);
              xhr.upload.addEventListener('loadend', () => {
                this.finished = true;
                this.prompt_title = "处理中，";
                this.prompt_text = "已经完成上传，正在进行查重和加密处理，请稍候．．．．．．"
              }, false);
            }
            return xhr;
          }
        })
          .done((data) => {
            this.progress = 0;
            this.$parent.modal_title = "上传结果";
            this.$parent.results = data;
            console.log(data);
            $("#myModal").modal('show');
          })
          .fail((xhr) => {
            console.error(xhr.statusText);
          });
      }
    }
  }
</script>

<style>
    .custom-file-control::before {
        content: "浏览";
    }

    .custom-file-control::after {
        content: "选择文件．．．";
    }
</style>