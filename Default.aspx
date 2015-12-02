<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <script src="Scripts/jquery-1.4.1.js" type="text/javascript"></script>
    <script type="text/javascript">

        function ajaxFunction(url) {
            var xmlHttp;
            try {
                xmlHttp = new XMLHttpRequest();
            } catch (e) {
                try {
                    xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                }
            }
            xmlHttp.onreadystatechange = function () {
              
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    document.write(xmlHttp.responseText);
                    console.log("fff");
                }
            }
            xmlHttp.open("POST", url, true);
            xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xmlHttp.send(null);
        }

        ajaxFunction("Default.aspx/helloworld");


        //$().ready(function () {
        //    var teststr = "wbecf:";
        //    alert(teststr[2]);

        //    alert("random" + Math.floor(Math.random() * 100));

        //    var aa = { "a": "ffff" };
        //    if ($.isEmptyObject(aa))
        //        alert('f');
        //    else
        //        alert("");

        //    $("#btnShow").click(function () {
        //        //三种方式取出子窗体中控件的值
        //        // var iframeID = iframe.document.getElementById("hfValueID"); //
        //        var iframeID = document.getElementById("iframe").contentWindow;
        //        //var iframeID=window.parent.window.frames[0].document.getElementById("hfValueID").value;
        //        //alert(iframeID);
        //        alert(iframeID.document.getElementById("hfValueID").value);
        //    });

        //    //            $.get("test.aspx/InvokeServiceMethod", { name: "john", time: "2pm" }, function (data) {
        //    //                alert(data);
        //    //            });
        //});
    </script>
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <h1>"Scripts/jquery-1.4.1.js" type="text/javascript"</h1>
            <br />
            <p>
                <div id="divHtml" style="width: 500px; height: 600px;">
                    aaaa
                </div>
            </p>
            <div>
                <% if (1 > 2)
                   { %>
            结果:1大于2<%}
                   else
                   {  %>结果:1小于2<%} %>
            </div>
            <div>
                <%=hfvalue.Value%>
            </div>
            <div>getPage:<%= getPage(hfvalue.Value)%></div>
            <asp:HiddenField runat="server" ID="hfvalue" Value="12" />
            <asp:GridView ID="gvshow" runat="server" AutoGenerateColumns="False" EnableModelValidation="True">
                <Columns>
                    <asp:TemplateField HeaderText="aa">
                        <ItemTemplate>
                            <asp:Label ID="lb" runat="server" Text='<%# Eval("aa") %>'></asp:Label>
                        </ItemTemplate>
                    </asp:TemplateField>
                </Columns>
                <Columns>
                    <asp:TemplateField HeaderText="bb">
                        <ItemTemplate>
                            <asp:Label ID="lb1" runat="server" Text='<%# Eval("bb") %>'></asp:Label>
                        </ItemTemplate>
                    </asp:TemplateField>
                </Columns>
            </asp:GridView>

        </div>
        <div style="position: absolute; width: 580px; height: 600px; top: 50px;">
           <%-- <iframe id="iframe" src="test.aspx" width="100%" height="100%"></iframe>--%>
        </div>
        <input type="button" id="btnShow" value="buttonShow" />
    </form>
</body>
</html>
