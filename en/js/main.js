$(document).ready(function () {
    // 初始化工具提示
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // 格式化按钮点击事件
    $("#gsh").click(function () {
        var $btn = $(this);
        var $output = $("#output");
        var $resultContainer = $("#resultContainer");
        var $json = $("#json");
        
        // 获取输入内容
        var inputText = $output.val().trim();
        
        // 检查输入是否为空
        if (!inputText) {
            showError("请输入JSON数据");
            return;
        }
        
        // 添加加载状态
        $btn.addClass('loading').prop('disabled', true);
        $btn.html('<i class="fas fa-spinner fa-spin me-2"></i>处理中...');
        
        // 使用setTimeout确保UI更新
        setTimeout(function() {
            try {
                // 移除之前的错误状态
                $output.removeClass('error success');
                
                // 解析JSON
                var jsonData = JSON.parse(inputText);
                
                // 格式化JSON
                var formattedJson = JSON.stringify(jsonData, null, 4);
                
                // 更新输出
                $output.val(formattedJson);
                $output.addClass('success');
                
                // 显示JSON查看器 - 使用更兼容的方式
                try {
                    if (typeof $json.jsonViewer === 'function') {
                        $json.jsonViewer(jsonData);
                    } else {
                        // 使用语法高亮的降级方案
                        $json.html(formatJsonWithHighlight(jsonData));
                    }
                } catch (viewerError) {
                    console.warn('JSON Viewer error:', viewerError);
                    // 使用语法高亮的降级方案
                    $json.html(formatJsonWithHighlight(jsonData));
                }
                
                // 显示结果容器
                $resultContainer.slideDown(300);
                
                // 成功提示
                showSuccess("JSON格式化成功！");
                
                // 添加成功动画
                $btn.removeClass('loading').addClass('success-animation');
                
                // 自动滚动到结果区域
                setTimeout(function() {
                    $resultContainer[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 400);
                
            } catch (error) {
                // 错误处理
                $output.addClass('error');
                showError("JSON格式错误：" + error.message);
                $resultContainer.slideUp(300);
                
                // 高亮错误位置（如果可能）
                if (error.message.includes('position')) {
                    var match = error.message.match(/position (\d+)/);
                    if (match) {
                        var position = parseInt(match[1]);
                        highlightErrorPosition(position);
                    }
                }
            } finally {
                // 恢复按钮状态
                setTimeout(function() {
                    $btn.removeClass('loading success-animation').prop('disabled', false);
                    $btn.html('<i class="fas fa-magic me-2"></i>格式化');
                }, 1000);
            }
        }, 100);
    });

    // 复制按钮点击事件
    $("#copy").click(function () {
        var $btn = $(this);
        var $output = $("#output");
        var outputText = $output.val().trim();
        
        if (!outputText) {
            showError("没有可复制的内容");
            return;
        }
        
        // 添加加载状态
        $btn.addClass('loading').prop('disabled', true);
        $btn.html('<i class="fas fa-spinner fa-spin me-2"></i>复制中...');
        
        // 使用现代剪贴板API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(outputText).then(function() {
                showSuccess("内容已复制到剪贴板！");
                $btn.removeClass('loading').addClass('success-animation');
                setTimeout(function() {
                    $btn.removeClass('success-animation').prop('disabled', false);
                    $btn.html('<i class="fas fa-copy me-2"></i>复制结果');
                }, 1000);
            }).catch(function(err) {
                console.error('复制失败:', err);
                fallbackCopy(outputText);
            });
        } else {
            // 降级方案
            fallbackCopy(outputText);
        }
        
        function fallbackCopy(text) {
            $output.select();
            try {
                var successful = document.execCommand('copy');
                if (successful) {
                    showSuccess("内容已复制到剪贴板！");
                    $btn.removeClass('loading').addClass('success-animation');
                } else {
                    showError("复制失败，请手动复制");
                }
            } catch (err) {
                showError("复制失败，请手动复制");
            }
            
            setTimeout(function() {
                $btn.removeClass('loading success-animation').prop('disabled', false);
                $btn.html('<i class="fas fa-copy me-2"></i>复制结果');
            }, 1000);
        }
    });

    // 清除按钮点击事件
    $("#clean").click(function () {
        var $btn = $(this);
        
        // 添加确认动画
        $btn.addClass('loading');
        
        // 清除内容
        $("#output").val("");
        $("#json").html("");
        $("#resultContainer").slideUp(300);
        
        // 移除错误和成功消息
        $('.error-message, .success-message').remove();
        
        // 恢复按钮状态
        setTimeout(function() {
            $btn.removeClass('loading');
        }, 500);
        
        // 聚焦到输入框
        $("#output").focus();
    });

    // 输入框事件
    $("#output").on('input', function() {
        var $this = $(this);
        var value = $this.val().trim();
        
        // 移除之前的错误消息
        $('.error-message').remove();
        
        // 如果输入为空，隐藏结果容器
        if (!value) {
            $("#resultContainer").slideUp(300);
        }
    });

    // 键盘快捷键
    $("#output").on('keydown', function(e) {
        // Ctrl+Enter 格式化
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            $("#gsh").click();
        }
        
        // Ctrl+A 全选
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            $(this).select();
        }
    });

    // 自动调整文本域高度
    $("#output").on('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // 显示成功消息
    function showSuccess(message) {
        removeMessages();
        var $message = $('<div class="success-message alert alert-success alert-dismissible fade show" role="alert">' +
            '<i class="fas fa-check-circle me-2"></i>' + message +
            '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
            '</div>');
        
        $('.main-card .card-body').prepend($message);
        
        // 自动隐藏
        setTimeout(function() {
            $message.alert('close');
        }, 3000);
    }

    // 显示错误消息
    function showError(message) {
        removeMessages();
        var $message = $('<div class="error-message alert alert-danger alert-dismissible fade show" role="alert">' +
            '<i class="fas fa-exclamation-triangle me-2"></i>' + message +
            '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
            '</div>');
        
        $('.main-card .card-body').prepend($message);
        
        // 自动隐藏
        setTimeout(function() {
            $message.alert('close');
        }, 5000);
    }

    // 移除所有消息
    function removeMessages() {
        $('.error-message, .success-message').remove();
    }

    // 页面加载动画
    $('.main-card').addClass('animate__animated animate__fadeInUp');
    $('.feature-card').each(function(index) {
        $(this).css('animation-delay', (index * 0.1) + 's');
    });

    // 添加滚动效果
    $(window).on('scroll', function() {
        var scrollTop = $(this).scrollTop();
        var windowHeight = $(this).height();
        
        $('.feature-card').each(function() {
            var $this = $(this);
            var elementTop = $this.offset().top;
            
            if (elementTop < scrollTop + windowHeight - 100) {
                $this.addClass('animate__animated animate__fadeInUp');
            }
        });
    });

    // 添加示例JSON功能
    function addExampleButton() {
        var $exampleBtn = $('<button class="btn btn-outline-info btn-sm me-2" id="exampleBtn">' +
            '<i class="fas fa-lightbulb me-1"></i>示例JSON</button>');
        
        $('.form-text').after($exampleBtn);
        
        $exampleBtn.click(function() {
            var exampleJson = {
                "name": "张三",
                "age": 25,
                "email": "zhangsan@example.com",
                "address": {
                    "city": "北京",
                    "district": "朝阳区",
                    "street": "三里屯街道"
                },
                "hobbies": ["编程", "阅读", "旅行"],
                "isActive": true,
                "lastLogin": "2024-01-15T10:30:00Z"
            };
            
            $("#output").val(JSON.stringify(exampleJson));
            $("#output").focus();
        });
    }

    // 添加示例按钮
    addExampleButton();

    // 添加统计功能
    function updateStats() {
        var text = $("#output").val();
        var lines = text.split('\n').length;
        var chars = text.length;
        var words = text.split(/\s+/).filter(function(word) {
            return word.length > 0;
        }).length;
        
        var $stats = $('#stats');
        if ($stats.length === 0) {
            $stats = $('<div id="stats" class="text-muted small mt-2">' +
                '<i class="fas fa-info-circle me-1"></i>' +
                '<span id="lines">0</span> 行, ' +
                '<span id="chars">0</span> 字符, ' +
                '<span id="words">0</span> 词</div>');
            $('.form-text').after($stats);
        }
        
        $('#lines').text(lines);
        $('#chars').text(chars);
        $('#words').text(words);
    }

    // 实时更新统计
    $("#output").on('input', updateStats);
    
    // 初始化统计
    updateStats();
    
    // HTML转义函数
    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    
    // 语法高亮函数
    function syntaxHighlight(json) {
        if (typeof json != "string") {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
    
    // 增强的JSON格式化函数
    function formatJsonWithHighlight(jsonData) {
        var formattedJson = JSON.stringify(jsonData, null, 4);
        var highlightedJson = syntaxHighlight(formattedJson);
        return '<pre class="json-output">' + highlightedJson + '</pre>';
    }
    
    // 高亮错误位置
    function highlightErrorPosition(position) {
        var $output = $("#output");
        var text = $output.val();
        var lines = text.substring(0, position).split('\n');
        var lineNumber = lines.length;
        var columnNumber = lines[lines.length - 1].length;
        
        // 显示错误位置信息
        showError("错误位置：第 " + lineNumber + " 行，第 " + columnNumber + " 列");
        
        // 尝试选中错误位置附近的文本
        try {
            var start = Math.max(0, position - 10);
            var end = Math.min(text.length, position + 10);
            $output.focus();
            $output[0].setSelectionRange(start, end);
        } catch (e) {
            console.warn('无法选中错误位置:', e);
        }
    }
    
    // 添加JSON验证功能
    function validateJson(text) {
        try {
            JSON.parse(text);
            return { valid: true, error: null };
        } catch (error) {
            return { valid: false, error: error };
        }
    }
    
    // 实时JSON验证
    $("#output").on('input', function() {
        var text = $(this).val().trim();
        var $this = $(this);
        
        if (text.length > 0) {
            var validation = validateJson(text);
            if (validation.valid) {
                $this.removeClass('error').addClass('success');
            } else {
                $this.removeClass('success').addClass('error');
            }
        } else {
            $this.removeClass('error success');
        }
    });
});