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


    var file_add_view = '<tr class="first" file_id="" ><td><div class="img"><img src="static/img/folder.png"></div><div class="add_folder" style="display:none"><input type="text" value="新建文件夹" /><i class="table-confirm" ></i><i class="folder-delete"></i></div><a href="javascript:;" file_id = ""></a></td><td class="description"></td><td><span class ="folder_create_time">2017-01-01 12:00</span></td><td><ul class="actions"><li><i class="table-download"></i></span></li><li ><i class="table-edit"></i></span></li><li ><i class="table-perm"></i></span></li><li class="last"><i class="table-delete"></i></li></ul></td></tr>'
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
                    //$("#file_list tr:last .table-download").css('display', 'none');
                    $("#file_list tr:last .table-download").parent('li').remove();
                    if ($("#user_name").text() != 'admin') {
                        $("#file_list tr:last .actions").remove();
                    }
                };
                for (i in data.content.file) {
                    $("#file_list").append(file_add_view);
                    $("#file_list tr:last").attr("file_id", data.content.file[i].id);
                    $("#file_list tr:last a").attr("file_id", data.content.file[i].id);
                    $("#file_list tr:last a").attr("file_attr", data.content.file[i].attr);
                    //$("#file_list tr:last a").attr("href", data.content.file[i].path + data.content.file[i].name);
                    $("#file_list tr:last a").text(data.content.file[i].name);
                    var fz_kb = data.content.file[i].file_size / 1000.0
                    if(fz_kb > 1000){
                        fz_kb = fz_kb/1000.0
                        $("#file_list tr:last .description").text(fz_kb.toFixed(1) + 'M');
                    }
                    else
                        $("#file_list tr:last .description").text(fz_kb.toFixed(1) + 'K');

                    $("#file_list tr:last .folder_create_time").text(data.content.file[i].create_time);
                    $("#file_list tr:last img").attr("src", "static/img/table-img.png");
                    if ($("#user_name").text() != 'admin') {
                        // $("#file_list tr:last .actions ").css('display', 'none');
                        $("#file_list tr:last .actions .table-download").parents('li').siblings().remove();
                        $("#file_list tr:last .actions li").attr('class', 'last')

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


    var loadingTask;



    function renderPDF(url, canvasContainer, options) {
        var options = options || { scale: 1 };

        function renderPage(page) {



            // var scaledViewport = page.getViewport(scale);


            // var canvas = document.createElement('canvas');
            // // canvas.style.display = "block";
            // // canvas.style.margin = "0 auto";

            // canvas.width = $("html").width();
            // var w_scale = canvas.width / page.getViewport(1.0).width;
            // canvas.height = w_scale * page.getViewport(1.0).height;
            // var viewport = page.getViewport(w_scale * 0.9);


            // //canvas.style.width = "100%";
            // //canvas.style.height = "100%";
            // canvas.style.width = Math.floor(viewport.width/w_scale) + 'pt';
            // canvas.style.height = Math.floor(viewport.height/w_scale) + 'pt';

            var canvas = document.createElement('canvas');
            var wrapper = document.createElement('wrapper');

            var scale = 2;
            var viewport = page.getViewport(scale);
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = "100%";
            //canvas.style.height = "100%";
            wrapper.style.width = Math.floor(viewport.width / scale) + 'px';
            //wrapper.style.height = Math.floor(viewport.height / scale) + 'px';
            wrapper.appendChild(canvas);

            var ctx = canvas.getContext("2d");
            var renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            canvasContainer.appendChild(wrapper);

            page.render(renderContext);


        }

        function renderPages(pdfDoc, svg) {

            for (var num = 1; num <= pdfDoc.numPages; num++)
                pdfDoc.getPage(num).then(renderPage);
        }


        __PAGE_RENDERING_IN_PROGRESS = 1;
        PDFJS.disableWorker = true;

        var loadingTask = PDFJS.getDocument(url);
        loadingTask.onProgress = function(progress) {

            var percent_loaded = Math.round(progress.loaded * 100 / progress.total);
            if (percent_loaded > 100) percent_loaded = 100;
            $("#pdf-loading-completed").text(percent_loaded + '%');
            $("#pdf-loading-completed").css('width', percent_loaded + '%');

        };

        loadingTask.promise.then(
            function getDocumentCallback(pdfDocument) {


                var svg = "";
                renderPages(pdfDocument, svg);

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
            $("#bg,.loading").show();
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
                        $("#bg,.loading").hide();

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
            // loadingTask.destroy();
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

    $('#file_list').on('click', 'tr .table-perm', function() {

        var file_id = $(this).parents("tr").find("a").attr("file_id");
        var file_name = $(this).parents("tr").find("a").text();
        var tr_obj = $(this).parents("tr");
        $("#mask_layer").show();
        var bh = $("html").height();
        var bw = $("html").width();
        $("#mask_layer").css({
            height: bh,
            width: bw,
            // display: "block"
        });
        $("#perm_container").show();
        var ptop = ($("html").height()) / 2 - $("#perm_container").height() / 2;
        var pleft = (($("html").width()) / 2 - $("#perm_container").width() / 2)
        $("#perm_container").css({
            top: ptop,
            left: pleft,
        });
        $("#perm-filename").attr("file_id", file_id);
        $("#perm-filename").text(file_name);

        //addOrRename($(this).attr("action_type"),  )
        $.post('permission_control.html', { "file_id": file_id, "_xsrf": getCookie("csrftoken") }, function(data, status) {
            console.log(file_id);
            console.log(data);
            var perm_line = '<tr class="first"><td class="col-md-3 sortable align-center"><div class="perm-member-select">Name</div></td><td class="col-md-3 sortable align-center"><div class="perm-action-select"><select><option value="NO">禁止查看</option><option value="YES">授权查看</option></select></div></td></tr>';
            $('#perm-list:first-child').nextAll().remove();
            for (var items in data.content) {
                $('#perm-list').append(perm_line);
                $("#perm-list tr:last .perm-member-select").text(items);
                if (data.content[items])
                    $("#perm-list tr:last .perm-action-select select").val('YES');
                else
                    $("#perm-list tr:last .perm-action-select select").val('NO');

            }


        });


    });
    $('#perm-confirm').on('click', '', function() {
        var trList = $("#perm-list").children("tr")
        var file_id = $("#perm-filename").attr("file_id");
        var user_perm = {};
        for (var i = 1; i < trList.length; i++) {
            var tdArr = trList.eq(i).find("td");
            var user = tdArr.eq(0).find('div').text();
            var perm = tdArr.eq(1).find('select').val();
            if (perm == "YES")
                user_perm[user] = 1;
            else
                user_perm[user] = 0;
        }

        // $.post('permission_set.html', { "file_id": file_id, "_xsrf": getCookie("csrftoken"), 'user_permission': user_perm }, function(data, status) {
        //     console.log(data);
        // });


        $.ajax({
            type: "POST",
            url: "permission_set.html",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ "file_id": file_id, "_xsrf": getCookie("csrftoken"), 'user_permission': user_perm }),
            dataType: "json",
            success: function(message) {
               console.log(message);
                $("#perm_container").hide();
                $("#mask_layer").hide();
            },
            error: function(message) {
                alert("修改权限失败");
            }
        });

    });


    $('#perm-cancel').on('click', '', function() {
        $("#perm_container").hide();
        $("#mask_layer").hide();

    });


    $('#total-member').on('change', 'select', function() {
        console.log($(this).find("option:selected").val());
        console.log($(this).val());
        if($(this).find("option:selected").val() == 'YES'){
            var trList = $(this).parents("tbody").children("tr")
            for(var i = 1; i < trList.length; i++){
                //setTimeout(al,50);
                trList.eq(i).find('select').val('YES').trigger('change');
            }
        }
        else{
            var trList = $(this).parents("tbody").children("tr")
            //for(var i = 1; i < trList.length; i++){
            for(var i = 1; i < trList.length; i++){
                trList.eq(i).find('select').val('NO').trigger('change');
            }
        }
        
    });

    $('#file_list').on('click', 'tr .table-download', function() {

        if ($(this).parents("tr").find("a").text().lastIndexOf(".pdf")) {
            var file_id = $(this).parents("tr").find("a").attr("file_id");
            $("#bg,.loading").show();
            $.post('preview_pdf.html', { 'file_path': parent_ids.join('/') + '/', "_xsrf": getCookie("csrftoken"), "file_id": file_id },
                function(data, status) {
                    $("#bg,.loading").hide();
                    var url = encodeURI("download_file.html?file_path=") + data.content.file_path;
                    window.location.href = url;
                });
        }




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
        $("#pad-wrapper").css("overflow", "scroll");
        $("#pad-wrapper").css("min-height", "620px");

        $("#pad-wrapper").append("<ul style='overflow:auto;height:500px'></ul>");

        $.get('get_user_log.html',
            function(data, status) {
                for (i in data.content) {
                    $("#pad-wrapper ul").append("<li>" + data.content[i] + "</li>");
                }
            });

    });

    $('#permission_config').click(function(e) {
        $("#pad-wrapper").children().remove();
        //$("#pad-wrapper").append("<iframe style='width:100% overflow-x:scroll; overflow-y: scroll;'></iframe>");


    });


});
