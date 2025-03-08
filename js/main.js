$(document).ready(function () {
    $("#gsh").click(function () {
        $("#output").val(JSON.stringify(JSON.parse($("#output").val()), null, 4));
        $("#json").jsonViewer(JSON.parse($("#output").val()));
    });
    $("#clean").click(function () {
        $("#output,.input-url").val("");
        $("#json").html("");
    });
    $("#copy").click(function () {
        var copyText = $('#output');

        copyText.select();
        document.execCommand("copy");
        alert('copy success')
    });
});
