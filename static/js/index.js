$(function() {

    var parent_ids = ["0"];


    function DisplayCurrentTime() {
        var date = new Date();
        var month = date.getMonth() < 10 ? "0" + date.getMonth() + 1 : date.getMonth() + 1;
        var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        time = date.getFullYear() + "-" + month + '-' + day + ' ' + hours + ":" + minutes + ":" + seconds;
        return time;
    };

    function getCookie(name) {
        var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
        return r ? r[1] : undefined;
    }


    var file_add_view = '<tr class="first" file_id="" ><td><div class="img"><img src="static/img/folder.png"></div><div class="add_folder" style="display:none"><input type="text" value="新建文件夹" /><i class="table-confirm" ></i><i class="folder-delete"></i></div><a href="javascript:;" file_id = "">There are many variations </a></td><td class="description"></td><td><span class ="folder_create_time">2017-01-01 12:00</span><ul class="actions"><li><i class="table-edit"></i></span></li><li class="last"><i class="table-delete"></i></li></ul></td></tr>'
    var new_layer = '<a href="javascript:;" data-deep="0" file_id="0">全部文件夹</a><span class="EKIHPEb">&gt;</span>';

    function addLayer(cur_id, cur_name) {
        if (cur_id == "0") {
            $("#last_layer").hide();
        } else {
            $("#last_layer").show();
        }
        $("#left_layer").append(new_layer);
        $("#left_layer a:last").attr("file_id", cur_id);
        $("#left_layer a:last").text(cur_name);

    }

    function getDirFiles(dir_id) {
        $.post('get_dir_list.html', { 'dir_id': dir_id },
            function(data, status) {

                //sconsole.log(data);
                $("#file_list tr").remove();
                //add title layer,remove before add
                parent_ids = ["0"];
                $("#left_layer a").remove();
                $("#left_layer span").remove();
                if (dir_id == "0") {
                    $("#last_layer").hide();
                } else {
                    $("#last_layer").show();
                }
                $("#left_layer").append(new_layer);

                for (var id_name in data.content.path_ids) {
                    for (id in data.content.path_ids[id_name]) {
                        parent_ids.push(id);
                        addLayer(id, data.content.path_ids[id_name][id]);
                    }
                }

                for (i in data.content.dir) {
                    $("#file_list").append(file_add_view);
                    $("#file_list tr:last").attr("file_id", data.content.dir[i].id);
                    $("#file_list tr:last a").attr("file_id", data.content.dir[i].id);
                    $("#file_list tr:last a").attr("file_attr", data.content.dir[i].attr);
                    $("#file_list tr:last a").text(data.content.dir[i].name);
                    $("#file_list tr:last .folder_create_time").text(data.content.dir[i].create_time);
                    if ($("#user_name").text() != 'admin') {
                        $("#file_list tr:last .actions").css('display', 'none')
                    }
                };
                for (i in data.content.file) {
                    $("#file_list").append(file_add_view);
                    $("#file_list tr:last").attr("file_id", data.content.file[i].id);
                    $("#file_list tr:last a").attr("file_id", data.content.file[i].id);
                    $("#file_list tr:last a").attr("file_attr", data.content.file[i].attr);
                    //$("#file_list tr:last a").attr("href", data.content.file[i].path + data.content.file[i].name);
                    $("#file_list tr:last a").text(data.content.file[i].name);
                    $("#file_list tr:last .folder_create_time").text(data.content.file[i].create_time);
                    $("#file_list tr:last img").attr("src", "static/img/table-img.png");
                    if ($("#user_name").text() != 'admin') {
                        $("#file_list tr:last .actions").css('display', 'none')
                    }
                };
            });
    };

    function addOrRename(type, new_name, file_id) {
        var parent_id = parent_ids[parent_ids.length - 1];
        $.post('add_or_rename.html', { 'action_type': type, 'file_id': file_id, 'folder_name': new_name, 'create_time': DisplayCurrentTime(), "_xsrf": getCookie("csrftoken"), "parent_id": parent_id, "parent_path": parent_ids.join("/") + '/' },
            function(data, status) {
                if (status == 'success') { //add folder
                    getDirFiles(parent_id);
                    //window.location.hash = parent_id;
                    if (type = "0") { //add folder
                        $("#new_folder").removeAttr("disabled");
                    }

                }
                console.log(status);

            });
    }



    function renderPDF(url, canvasContainer, options) {
        var options = options || { scale: 1 };

        function renderPage(page) {



            // var scaledViewport = page.getViewport(scale);


            var canvas = document.createElement('canvas');
            canvas.style.display = "block";
            canvas.style.margin = "0 auto";

            canvas.width = $("html").width();
            var w_scale = canvas.width / page.getViewport(1.0).width;
            canvas.height = w_scale * page.getViewport(1.0).height;
            var viewport = page.getViewport(w_scale * 0.9);


            var ctx = canvas.getContext("2d");
            var renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            canvasContainer.appendChild(canvas);

            page.render(renderContext);
        }

        function renderPages(pdfDoc) {
            for (var num = 1; num <= pdfDoc.numPages; num++)
                pdfDoc.getPage(num).then(renderPage);
        }

        __PAGE_RENDERING_IN_PROGRESS = 1;
        PDFJS.disableWorker = true;

        var loadingTask = PDFJS.getDocument(url);
        loadingTask.onProgress = function(progress) {

            var percent_loaded = Math.round(progress.loaded * 100 / progress.total);

            $("#pdf-loading-completed").css('width', percent_loaded + '%');

        };

        loadingTask.promise.then(
            function getDocumentCallback(pdfDocument) {
                renderPages(pdfDocument)
            });
    }


    $(document).ready(function() {
        sharp_value = window.location.hash;
        var cur_id = 0;
        if (sharp_value != "") {
            cur_id = sharp_value.slice(1);
        }
        //var cur_id = sharp_value.slice(1);
        getDirFiles(cur_id);

    });

    window.onhashchange = function() {
        getDirFiles(window.location.hash.slice(1));
    }


    $("#new_folder").click(function(e) {
        $("#file_list").prepend(file_add_view);
        $("#file_list tr:first").attr("action_type", "0");
        $("#file_list tr:first .add_folder").show();
        $("#new_folder").attr("disabled", true);
        //$("#file_list tr:first a").attr("file_attr", "0");
    });



    $('#file_list').on('click', '.table-confirm', function() {
        var folder_name = $(this).prev().val();
        if (folder_name.match(/新建文件夹\((\d)\)/) != null || folder_name == "新建文件夹") {
            folders = $('#file_list tr a[file_attr=0]').get();
            repeated_folder = new Array();
            for (var i in folders) {
                console.log(folders[i]);
                pos = $(folders[i]).text().indexOf('新建文件夹');
                if (pos != -1) {
                    matched_name = $(folders[i]).text().match(/新建文件夹\((\d)\)/);
                    if (matched_name != null) {
                        repeated_folder.push(parseInt(matched_name[1]));
                    } else if ($(folders[i]).text() == "新建文件夹") {
                        //matched_name = $(folders[i]).text().match(/新建文件夹/);
                        repeated_folder.push(0);
                    }
                }
            }
            if (repeated_folder.length) {
                folder_name = "新建文件夹(" + (repeated_folder.sort()[repeated_folder.length - 1] + 1) + ")";
            }
        }

        addOrRename($(this).parents("tr").attr("action_type"), folder_name, $(this).parents("tr").find("a").attr("file_id"));

    });

    $('#file_list').on('click', '.folder-delete', function() {
        if ($(this).parents("tr").attr("action_type") == "0") { //add folder confirm/con
            $("#file_list").children().first().remove();
            $("#new_folder").removeAttr("disabled");
        } else { //rename file
            $(this).parents("tr").find(".add_folder").hide();
        }

    });



    $('#file_list').on('click', 'tr a', function() {
        if ($(this).attr("file_attr") == 0) {

            var cur_id = $(this).attr("file_id");
            //getDirFiles(cur_id);
            window.location.hash = cur_id;

        } else if ($(this).text().lastIndexOf(".pdf")) {
            var file_name = $(this).text();
            $.post('preview_pdf.html', { 'file_path': parent_ids.join('/') + '/', "_xsrf": getCookie("csrftoken"), "file_id": $(this).attr("file_id") },
                function(data, status) {
                    if (status == 'success') {
                        var bh = $("html").height();
                        var bw = $("html").width();
                        $("#fullbg").css({
                            height: bh,
                            width: bw,
                            // display: "block"
                        });
                        //$("iframe").attr("src", "viewer.html?file=" + data.content.file_path)


                        //var url = data.content.file_path;
                        var url = data.content.file_path;


                        $("#previewDownload a").attr("href", encodeURI("download_file.html?file_path=" + url));

                        renderPDF(url, document.getElementById('fullbg'));




                        $("body header").hide();
                        $("#preview_line").show();

                    }
                    console.log(status);

                });

        }

    });

    $('#previewClose').on('click', '', function() {
        $("#preview_line").hide();
        $("body header").show();
        $("#fullbg").children().remove();
        $.post('close_pdf.html', { "_xsrf": getCookie("csrftoken") }, function(data, status) {

        });
    });

    $('#previewDownload').on('click', '', function() {

    });

    $('#file_list').on('click', 'tr .table-edit', function() {
        //$("#file_list tr:first a").text(folder_name);
        //$("#file_list tr:first .add_folder").children("input").attr("value", folder_name);
        $(this).parents("tr").find(".add_folder").show();
        $(this).parents("tr").find("input").attr("value", $(this).parents("tr").find("a").text());
        //addOrRename($(this).attr("action_type"),  )
        $(this).parents("tr").attr("action_type", "1");

    });

    $('#file_list').on('click', 'tr .table-delete', function() {

        var file_id = $(this).parents("tr").find("a").attr("file_id");
        var tr_obj = $(this).parents("tr");
        //addOrRename($(this).attr("action_type"),  )
        $.post('delete_file.html', { "file_id": file_id, "_xsrf": getCookie("csrftoken") }, function(data, status) {
            console.log(file);
            tr_obj.remove();
        });


    });


    $('#file_list').on('click', 'tr .table-delete', function() {


    });

    $('#left_layer').on('click', 'a', function() {
        //$("#file_list tr").remove();
        var cur_id = $(this).attr("file_id");
        var id_index = parent_ids.indexOf(cur_id) + 1
        parent_ids.splice(id_index, parent_ids.length - id_index);
        //parent_paths.splice(id_index, parent_paths.length - id_index);
        $(this).next().nextAll().remove();
        //getDirFiles(cur_id)
        window.location.hash = cur_id;

    });

    $('#last_layer').on('click', '', function() {
        //$("#file_list tr").remove();
        if (parent_ids.length > 1) {
            parent_ids.pop();
            //getDirFiles(parent_ids[parent_ids.length - 1]);
            window.location.hash = parent_ids[parent_ids.length - 1];
            $("#left_layer span:last").remove();
            $("#left_layer a:last").remove();
        } else {
            //getDirFiles("0");
            //$("#left_layer span:last").remove();
            //$("#left_layer a:last").remove();
            window.location.hash = 0;
        }

    });

    $("#file").on("change paste keyup", function() {
        alert("上传完成");
        var formData = new FormData();
        formData.append('file', $('#file')[0].files[0]);
        var parent_id = parent_ids[parent_ids.length - 1];
        formData.append('path', parent_ids.join('/') + '/');
        formData.append('parent_id', parent_id);
        formData.append('create_time', DisplayCurrentTime());
        $.ajax({
            url: 'upload_file.html',
            type: 'POST',
            cache: false,
            data: formData,
            processData: false,
            contentType: false
        }).done(function(res) {
            console.log('success1')
            $("#file_list tr").remove();
            getDirFiles(parent_ids[parent_ids.length - 1]);
            //window.location.hash = parent_ids[parent_ids.length - 1];

        }).fail(function(res) {

        });
    });



    $('#file_upload').click(function(e) {
        $("#file").click();
    });

    $('#user_log').click(function(e) {
        $("#pad-wrapper").children().remove();
        //$("#pad-wrapper").append("<iframe style='width:100% overflow-x:scroll; overflow-y: scroll;'></iframe>");
        $("#pad-wrapper").css("overflow","scroll");
        $("#pad-wrapper").css("min-height","620px");

        $("#pad-wrapper").append("<ul style='overflow:auto;height:500px'></ul>");

        $.get('get_user_log.html',
            function(data, status) {
                for (i in data.content) {
                    $("#pad-wrapper ul").append("<li>" + data.content[i] + "</li>");
                }
            });

    });

});
